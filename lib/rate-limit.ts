import { ChatError, ChatErrorCode } from "@/lib/chat-errors";

const WINDOW_MS = 60_000;
const LIMIT = 12;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceMemoryRateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  bucket.count += 1;

  if (bucket.count > LIMIT) {
    throw new ChatError(ChatErrorCode.RATE_LIMITED);
  }
}

export function resetRateLimitForTests() {
  buckets.clear();
}
