import { Redis } from "@upstash/redis";
import { ChatErrorCode } from "@/lib/chat-errors";
import { hashIp } from "@/lib/request";

type CostGuardAllowed = { allowed: true };
type CostGuardBlocked = { allowed: false; errorCode: ChatErrorCode.QUOTA_EXHAUSTED };
type CostGuardResult = CostGuardAllowed | CostGuardBlocked;

const memoryDailyTotals = new Map<string, number>();
const memoryDailyByIp = new Map<string, number>();
let warnedAboutRedis = false;

function getLimits() {
  const dailyRequestLimit = Number.parseInt(process.env.DAILY_REQUEST_LIMIT || "", 10);
  const dailyIpLimit = Number.parseInt(process.env.DAILY_IP_LIMIT || "", 10);

  return {
    dailyRequestLimit: Number.isFinite(dailyRequestLimit) && dailyRequestLimit > 0 ? dailyRequestLimit : 100,
    dailyIpLimit: Number.isFinite(dailyIpLimit) && dailyIpLimit > 0 ? dailyIpLimit : 20,
  };
}

function getDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return Redis.fromEnv();
}

function warnRedisFallback(error: unknown) {
  if (warnedAboutRedis) return;
  warnedAboutRedis = true;
  console.warn("Usage KV unavailable; falling back to in-memory limits.", error);
}

async function checkRedis(ipHash: string, day: string, limits: ReturnType<typeof getLimits>) {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const totalKey = `usage:${day}:total`;
    const ipKey = `usage:${day}:ip:${ipHash}:requests`;
    const [dailyTotal, ipTotal] = await Promise.all([redis.incr(totalKey), redis.incr(ipKey)]);
    await Promise.all([redis.expire(totalKey, 60 * 60 * 48), redis.expire(ipKey, 60 * 60 * 48)]);

    if (dailyTotal > limits.dailyRequestLimit || ipTotal > limits.dailyIpLimit) {
      return {
        allowed: false,
        errorCode: ChatErrorCode.QUOTA_EXHAUSTED,
      } satisfies CostGuardBlocked;
    }

    return { allowed: true } satisfies CostGuardAllowed;
  } catch (error) {
    warnRedisFallback(error);
    return null;
  }
}

function checkMemory(ipHash: string, day: string, limits: ReturnType<typeof getLimits>) {
  const totalKey = `usage:${day}:total`;
  const ipKey = `usage:${day}:ip:${ipHash}`;
  const dailyTotal = (memoryDailyTotals.get(totalKey) || 0) + 1;
  const ipTotal = (memoryDailyByIp.get(ipKey) || 0) + 1;

  memoryDailyTotals.set(totalKey, dailyTotal);
  memoryDailyByIp.set(ipKey, ipTotal);

  if (dailyTotal > limits.dailyRequestLimit || ipTotal > limits.dailyIpLimit) {
    return {
      allowed: false,
      errorCode: ChatErrorCode.QUOTA_EXHAUSTED,
    } satisfies CostGuardBlocked;
  }

  return { allowed: true } satisfies CostGuardAllowed;
}

export async function checkCostGuard(ip: string): Promise<CostGuardResult> {
  const ipHash = hashIp(ip);
  const day = getDayKey();
  const limits = getLimits();
  const redisResult = await checkRedis(ipHash, day, limits);

  return redisResult || checkMemory(ipHash, day, limits);
}

export function resetMemoryUsageForTests() {
  memoryDailyTotals.clear();
  memoryDailyByIp.clear();
  warnedAboutRedis = false;
}
