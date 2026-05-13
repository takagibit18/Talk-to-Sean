import type { CVData } from "@/lib/cv-data";
import type { ChatErrorCode } from "@/lib/chat-errors";

export function getChatErrorMessage(
  errorCode: ChatErrorCode | string | undefined,
  data: CVData,
  fallback?: string,
) {
  if (errorCode && data.chat.errors[errorCode]) {
    return data.chat.errors[errorCode];
  }

  return fallback || data.chat.errors.default;
}
