import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
