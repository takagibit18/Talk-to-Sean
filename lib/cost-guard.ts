import { Redis } from "@upstash/redis";
import { ChatErrorCode } from "@/lib/chat-errors";
import { hashIp } from "@/lib/request";

type CostGuardAllowed = { allowed: true };
type CostGuardBlocked = {
  allowed: false;
  errorCode: ChatErrorCode.QUOTA_EXHAUSTED | ChatErrorCode.PROTECTION_MISCONFIGURED;
};
type CostGuardResult = CostGuardAllowed | CostGuardBlocked;

const memoryDailyTotals = new Map<string, number>();
const memoryDailyByIp = new Map<string, number>();
let warnedAboutRedis = false;

function getLimits() {
  const dailyRequestLimit = Number.parseInt(process.env.DAILY_REQUEST_LIMIT || "", 10);
  const dailyIpLimit = Number.parseInt(process.env.DAILY_IP_LIMIT || "", 10);
  const dailySessionLimit = Number.parseInt(process.env.DAILY_SESSION_LIMIT || "", 10);

  return {
    dailyRequestLimit: Number.isFinite(dailyRequestLimit) && dailyRequestLimit > 0 ? dailyRequestLimit : 50,
    dailyIpLimit: Number.isFinite(dailyIpLimit) && dailyIpLimit > 0 ? dailyIpLimit : 8,
    dailySessionLimit: Number.isFinite(dailySessionLimit) && dailySessionLimit > 0 ? dailySessionLimit : 8,
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

async function checkRedis(
  ipHash: string,
  sessionId: string,
  day: string,
  limits: ReturnType<typeof getLimits>,
) {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const totalKey = `usage:${day}:total`;
    const ipKey = `usage:${day}:ip:${ipHash}:requests`;
    const sessionKey = `usage:${day}:session:${sessionId}:requests`;
    const [dailyTotal, ipTotal, sessionTotal] = await Promise.all([
      redis.incr(totalKey),
      redis.incr(ipKey),
      redis.incr(sessionKey),
    ]);
    await Promise.all([
      redis.expire(totalKey, 60 * 60 * 48),
      redis.expire(ipKey, 60 * 60 * 48),
      redis.expire(sessionKey, 60 * 60 * 48),
    ]);

    if (
      dailyTotal > limits.dailyRequestLimit ||
      ipTotal > limits.dailyIpLimit ||
      sessionTotal > limits.dailySessionLimit
    ) {
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

function checkMemory(
  ipHash: string,
  sessionId: string,
  day: string,
  limits: ReturnType<typeof getLimits>,
) {
  const totalKey = `usage:${day}:total`;
  const ipKey = `usage:${day}:ip:${ipHash}`;
  const sessionKey = `usage:${day}:session:${sessionId}`;
  const dailyTotal = (memoryDailyTotals.get(totalKey) || 0) + 1;
  const ipTotal = (memoryDailyByIp.get(ipKey) || 0) + 1;
  const sessionTotal = (memoryDailyByIp.get(sessionKey) || 0) + 1;

  memoryDailyTotals.set(totalKey, dailyTotal);
  memoryDailyByIp.set(ipKey, ipTotal);
  memoryDailyByIp.set(sessionKey, sessionTotal);

  if (
    dailyTotal > limits.dailyRequestLimit ||
    ipTotal > limits.dailyIpLimit ||
    sessionTotal > limits.dailySessionLimit
  ) {
    return {
      allowed: false,
      errorCode: ChatErrorCode.QUOTA_EXHAUSTED,
    } satisfies CostGuardBlocked;
  }

  return { allowed: true } satisfies CostGuardAllowed;
}

export async function checkCostGuard(ip: string, sessionId = "anonymous"): Promise<CostGuardResult> {
  const ipHash = hashIp(ip);
  const day = getDayKey();
  const limits = getLimits();
  const redisResult = await checkRedis(ipHash, sessionId, day, limits);

  if (redisResult) {
    return redisResult;
  }

  if (process.env.NODE_ENV === "production") {
    return {
      allowed: false,
      errorCode: ChatErrorCode.PROTECTION_MISCONFIGURED,
    };
  }

  return checkMemory(ipHash, sessionId, day, limits);
}

export function resetMemoryUsageForTests() {
  memoryDailyTotals.clear();
  memoryDailyByIp.clear();
  warnedAboutRedis = false;
}
