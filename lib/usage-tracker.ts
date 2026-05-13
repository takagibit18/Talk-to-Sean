import { Redis } from "@upstash/redis";
import { hashIp } from "@/lib/request";

export type UsageRecord = {
  ip: string;
  requestId: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  timestamp?: string;
};

const memoryUsage: Array<Omit<UsageRecord, "ip"> & { ipHash: string }> = [];
let warnedAboutUsageStore = false;

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return Redis.fromEnv();
}

export async function recordUsage(record: UsageRecord) {
  const timestamp = record.timestamp || new Date().toISOString();
  const ipHash = hashIp(record.ip);
  const payload = {
    requestId: record.requestId,
    ipHash,
    timestamp,
    promptTokens: record.promptTokens || 0,
    completionTokens: record.completionTokens || 0,
    totalTokens: record.totalTokens || 0,
  };
  const day = timestamp.slice(0, 10);
  const redis = getRedis();

  if (redis) {
    try {
      await redis.rpush(`usage:${day}:events`, JSON.stringify(payload));
      await redis.expire(`usage:${day}:events`, 60 * 60 * 24 * 14);
      return payload;
    } catch (error) {
      if (!warnedAboutUsageStore) {
        warnedAboutUsageStore = true;
        console.warn("Usage tracker KV write failed; storing in memory.", error);
      }
    }
  }

  memoryUsage.push(payload);
  return payload;
}

export function getMemoryUsageForTests() {
  return memoryUsage;
}
