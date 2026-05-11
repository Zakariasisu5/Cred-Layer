import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let connectionAttempted = false;

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (connectionAttempted && redisClient && !redisClient.isOpen) {
    return null;
  }

  connectionAttempted = true;
  redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.on("error", (err) => {
    console.error("[Redis] connection error:", err.message);
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("[Redis] unable to connect, falling back to memory store");
    return null;
  }
}
