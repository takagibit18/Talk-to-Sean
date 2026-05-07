type RateLimitOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

export function createFixedWindowRateLimiter({
  limit,
  windowMs,
  now = Date.now
}: RateLimitOptions) {
  const buckets = new Map<string, RateLimitState>();

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();
      const existing = buckets.get(key);
      const bucket =
        existing && existing.resetAt > currentTime
          ? existing
          : { count: 0, resetAt: currentTime + windowMs };

      if (bucket.count >= limit) {
        buckets.set(key, bucket);

        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((bucket.resetAt - currentTime) / 1_000)
          ),
          resetAt: bucket.resetAt
        };
      }

      bucket.count += 1;
      buckets.set(key, bucket);

      return {
        allowed: true,
        remaining: Math.max(0, limit - bucket.count),
        retryAfterSeconds: 0,
        resetAt: bucket.resetAt
      };
    }
  };
}

export function getClientRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "anonymous";

  return `ip:${ip}`;
}
