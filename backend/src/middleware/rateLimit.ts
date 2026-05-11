import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisConfigured } from "../lib/redis";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  store?: "auto" | "memory" | "redis";
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

let lastResolvedStore: "memory" | "redis" = "memory";

function resolveRequestedStore(store?: RateLimitOptions["store"]): "memory" | "redis" {
  if (store === "memory") return "memory";
  if (store === "redis") return "redis";
  return isRedisConfigured() ? "redis" : "memory";
}

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function cleanupExpiredBuckets(now: number): void {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "global", store = "auto" } = options;

  async function consumeWithMemory(key: string, now: number): Promise<{ count: number; retryAfterSec: number }> {
    cleanupExpiredBuckets(now);

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { count: 1, retryAfterSec: Math.max(1, Math.ceil(windowMs / 1000)) };
    }

    bucket.count += 1;
    return {
      count: bucket.count,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  async function consumeWithRedis(key: string, now: number): Promise<{ count: number; retryAfterSec: number }> {
    const client = await getRedisClient();
    if (!client) {
      lastResolvedStore = "memory";
      return consumeWithMemory(key, now);
    }

    lastResolvedStore = "redis";
    const count = await client.incr(key);
    if (count === 1) {
      await client.pExpire(key, windowMs);
    }

    const ttlMs = await client.pTTL(key);
    const retryAfterSec = Math.max(1, Math.ceil((ttlMs > 0 ? ttlMs : windowMs) / 1000));

    return { count, retryAfterSec };
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const now = Date.now();

    const routeKey = req.baseUrl || req.path || "route";
    const key = `${keyPrefix}:${getClientIp(req)}:${routeKey}`;

    const requestedStore = resolveRequestedStore(store);
    let result: { count: number; retryAfterSec: number };

    if (requestedStore === "redis") {
      result = await consumeWithRedis(key, now);
    } else {
      lastResolvedStore = "memory";
      result = await consumeWithMemory(key, now);
    }

    res.setHeader("X-RateLimit-Store", lastResolvedStore);

    if (result.count > max) {
      res.setHeader("Retry-After", String(result.retryAfterSec));
      res.status(429).json({
        error: "Too many requests",
        details: "Rate limit exceeded for this endpoint",
      });
      return;
    }

    next();
  };
}

export function __resetRateLimitStore(): void {
  buckets.clear();
}

export function __getLastResolvedRateLimitStore(): "memory" | "redis" {
  return lastResolvedStore;
}
