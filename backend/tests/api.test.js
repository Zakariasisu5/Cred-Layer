const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.PUBLIC_RATE_LIMIT_WINDOW_MS = "60000";
process.env.PUBLIC_RATE_LIMIT_MAX = "3";
process.env.PUBLIC_RATE_LIMIT_STORE = "redis";
process.env.PAYMENT_RECEIVER_ADDRESS =
  process.env.PAYMENT_RECEIVER_ADDRESS || "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

const app = require("../dist/index").default;
const { __setX402TestHooks, __resetX402TestHooks } = require("../dist/middleware/x402");
const { __resetRateLimitStore } = require("../dist/middleware/rateLimit");

const VALID_WALLET = "7xKXTg2CW87d97TXJSDpbD5jBkheTqA5q9oRd2HnJqB1";
const INVALID_BASE58_WALLET = "O0IlO0IlO0IlO0IlO0IlO0IlO0IlO0Il";

test.beforeEach(() => {
  __resetX402TestHooks();
  __resetRateLimitStore();
});

test("GET /health returns service metadata", async () => {
  const res = await request(app).get("/health");

  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
  assert.equal(res.body.project, "CredLayer");
  assert.ok(typeof res.body.endpoints === "object");
  assert.ok(Array.isArray(res.body.endpoints.free));
  assert.ok(Array.isArray(res.body.endpoints.premium));
  assert.ok(res.body.endpoints.free.includes("GET  /api/reputation/:wallet"));
  assert.equal(typeof res.body.security, "object");
  assert.equal(typeof res.body.security.rateLimit, "object");
  assert.equal(res.body.security.rateLimit.max, 3);
  assert.equal(res.body.security.rateLimit.windowMs, 60000);
  assert.equal(res.body.security.rateLimit.store, "redis");
});

test("GET /api/reputation/:wallet validates wallet length", async () => {
  const res = await request(app).get("/api/reputation/invalid-wallet");

  assert.equal(res.status, 400);
  assert.equal(res.body.error, "Invalid Solana wallet address");
});

test("GET /api/reputation/:wallet rejects non-base58 wallet", async () => {
  const res = await request(app).get(`/api/reputation/${INVALID_BASE58_WALLET}`);

  assert.equal(res.status, 400);
  assert.equal(res.body.error, "Invalid Solana wallet address");
});

test("POST /api/reputation/update validates wallet in body", async () => {
  const missingWallet = await request(app).post("/api/reputation/update").send({});
  assert.equal(missingWallet.status, 400);
  assert.equal(missingWallet.body.error, "wallet address required in body");

  const invalidWallet = await request(app)
    .post("/api/reputation/update")
    .send({ wallet: "invalid-wallet" });
  assert.equal(invalidWallet.status, 400);
  assert.equal(invalidWallet.body.error, "Invalid Solana wallet address");
});

test("GET /api/reputation/history/:wallet returns canonical history contract", async () => {
  const res = await request(app).get(`/api/reputation/history/${VALID_WALLET}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.wallet, VALID_WALLET);
  assert.ok(Array.isArray(res.body.history));
  assert.equal(typeof res.body.count, "number");
});

test("GET /api/leaderboard returns canonical leaderboard contract", async () => {
  const res = await request(app).get("/api/leaderboard");

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.leaderboard));
  assert.equal(typeof res.body.total, "number");
  assert.equal(res.body.total, res.body.leaderboard.length);
});

test("GET /api/analytics/:wallet returns flat and nested analytics contracts", async () => {
  const res = await request(app).get(`/api/analytics/${VALID_WALLET}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.wallet, VALID_WALLET);
  assert.equal(typeof res.body.totalTransactions, "number");
  assert.equal(typeof res.body.totalVolumeSOL, "number");
  assert.equal(typeof res.body.defiInteractions, "number");
  assert.equal(typeof res.body.walletAgeMonths, "number");
  assert.equal(typeof res.body.riskScore, "number");
  assert.equal(typeof res.body.riskLabel, "string");

  assert.ok(typeof res.body.analytics === "object");
  assert.equal(typeof res.body.analytics.transactionCount, "number");
  assert.equal(typeof res.body.analytics.riskScore, "number");
  assert.equal(typeof res.body.analytics.riskLabel, "string");
});

test("CORS allows known origins and omits unknown origins", async () => {
  const allowed = await request(app).get("/health").set("Origin", "http://localhost:5173");
  assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:5173");

  const unknown = await request(app).get("/health").set("Origin", "https://evil.example");
  assert.equal(unknown.headers["access-control-allow-origin"], undefined);
});

test("Public endpoints enforce rate limiting with 429", async () => {
  const path = "/api/leaderboard";
  const req1 = await request(app).get(path);
  assert.equal(req1.headers["x-ratelimit-store"], "memory");

  await request(app).get(path);
  await request(app).get(path);
  const rateLimited = await request(app).get(path);

  assert.equal(rateLimited.status, 429);
  assert.equal(rateLimited.body.error, "Too many requests");
  assert.ok(rateLimited.headers["retry-after"]);
  assert.equal(rateLimited.headers["x-ratelimit-store"], "memory");
});

test("GET /api/premium/reputation/:wallet is never open without guard", async () => {
  const res = await request(app).get(`/api/premium/reputation/${VALID_WALLET}`);
  assert.ok([402, 503].includes(res.status));
});

test("x402 rejects invalid payment payload", async () => {
  __setX402TestHooks({
    verify: async () => ({ isValid: false, invalidReason: "signature mismatch" }),
    settle: async () => undefined,
  });

  const payload = Buffer.from(JSON.stringify({ tx: "fake" }), "utf-8").toString("base64");
  const res = await request(app)
    .get(`/api/premium/reputation/${INVALID_BASE58_WALLET}`)
    .set("X-PAYMENT", payload);

  assert.equal(res.status, 402);
  assert.equal(res.body.error, "Invalid payment");
});

test("x402 accepts valid payment then reaches premium route", async () => {
  __setX402TestHooks({
    verify: async () => ({ isValid: true }),
    settle: async () => undefined,
  });

  const payload = Buffer.from(JSON.stringify({ tx: "valid" }), "utf-8").toString("base64");
  const res = await request(app)
    .get(`/api/premium/reputation/${INVALID_BASE58_WALLET}`)
    .set("X-PAYMENT", payload);

  // If payment is accepted, middleware passes and route validation handles wallet format.
  assert.equal(res.status, 400);
  assert.equal(res.body.error, "Invalid Solana wallet address");
});

test("GET /api/openapi.json exposes OpenAPI metadata", async () => {
  const res = await request(app).get("/api/openapi.json");

  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, "3.0.3");
  assert.equal(res.body.info.title, "CredLayer API");
});
