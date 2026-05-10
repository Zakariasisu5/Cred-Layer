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
import { x402Middleware } from "./middleware/x402";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/reputation", reputationRoutes);
app.use("/api/reputation/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// The x402 header is applied only to /api/premium
let x402Applied = false;
if (x402Middleware) {
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
  app.use("/api/premium", premiumRoutes);
  console.log("⚠️  x402 not configured — premium routes accessible without payment");
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
    x402: x402Applied ? "active" : "not configured",
    endpoints: {
      free: [
        "GET  /api/reputation/:wallet",
        "POST /api/reputation/update",
        "GET  /api/reputation/history/:wallet",
        "GET  /api/analytics/:wallet",
        "GET  /api/leaderboard",
      ],
      premium: ["GET  /api/premium/reputation/:wallet  ← x402 paid endpoint"],
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CredLayer backend running on http://localhost:${PORT}`);
});

export default app;
