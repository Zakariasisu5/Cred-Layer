import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import reputationRoutes from "./routes/reputation";
import analyticsRoutes from "./routes/analytics";
import leaderboardRoutes from "./routes/leaderboard";
import historyRoutes from "./routes/history";
import premiumRoutes from "./routes/premium";
import { swaggerSpec } from "./docs/swagger";
import { isX402Configured, x402Middleware } from "./middleware/x402";
import { createRateLimit } from "./middleware/rateLimit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const publicRateWindowMs = Number(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS || 60_000);
const publicRateMax = Number(process.env.PUBLIC_RATE_LIMIT_MAX || 60);
const publicRateStore =
  process.env.PUBLIC_RATE_LIMIT_STORE === "redis" ? "redis" : process.env.PUBLIC_RATE_LIMIT_STORE === "memory" ? "memory" : "auto";

const publicRateLimit = createRateLimit({
  windowMs: Number.isFinite(publicRateWindowMs) ? publicRateWindowMs : 60_000,
  max: Number.isFinite(publicRateMax) ? publicRateMax : 60,
  keyPrefix: "public",
  store: publicRateStore,
});

function buildAllowedOrigins(): string[] {
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];

  return [...new Set([...defaults, process.env.FRONTEND_URL || "", ...envOrigins].filter(Boolean))];
}

const allowedOrigins = buildAllowedOrigins();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // No origin means server-to-server clients; allow by default.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());

// Routes
app.use("/api/reputation/history", publicRateLimit, historyRoutes);
app.use("/api/reputation", publicRateLimit, reputationRoutes);
app.use("/api/analytics", publicRateLimit, analyticsRoutes);
app.use("/api/leaderboard", publicRateLimit, leaderboardRoutes);

// The x402 header is applied only to /api/premium
let x402Applied = false;
if (isX402Configured()) {
  // Wrap async middleware to handle errors
  app.use(
    "/api/premium",
    (req, res, next) => {
      Promise.resolve(x402Middleware(req, res, next)).catch(next);
    },
    premiumRoutes,
  );
  x402Applied = true;
  console.log("✅ x402 payment middleware active on /api/premium");
} else {
  app.use("/api/premium", (req, res) => {
    res.status(503).json({
      error: "Premium service unavailable",
      reason: "x402 payment is not configured",
    });
  });
  console.log("⚠️  x402 not configured — premium routes disabled");
}

// API documentation
app.get("/api/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check — verifies that the server is running
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    project: "CredLayer",
    version: "1.0.0",
    x402: x402Applied ? "active" : "disabled",
    security: {
      rateLimit: {
        windowMs: Number.isFinite(publicRateWindowMs) ? publicRateWindowMs : 60_000,
        max: Number.isFinite(publicRateMax) ? publicRateMax : 60,
        store: publicRateStore,
      },
    },
    endpoints: {
      free: [
        "GET  /api/reputation/:wallet",
        "POST /api/reputation/update",
        "GET  /api/reputation/history/:wallet",
        "GET  /api/analytics/:wallet",
        "GET  /api/leaderboard",
      ],
      premium: [
        x402Applied
          ? "GET  /api/premium/reputation/:wallet  ← x402 paid endpoint"
          : "Premium endpoints unavailable until x402 is configured",
      ],
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CredLayer backend running on http://localhost:${PORT}`);
});

export default app;
