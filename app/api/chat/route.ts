import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { validateChatMessages } from "@/lib/chat-policy";
import { getChatModel } from "@/lib/model-provider";
import { buildSeanSystemPrompt } from "@/lib/prompt";
import {
  createFixedWindowRateLimiter,
  getClientRateLimitKey
} from "@/lib/rate-limit";

export const maxDuration = 30;
export const runtime = "nodejs";

const chatRateLimiter = createFixedWindowRateLimiter({
  limit: 20,
  windowMs: 60_000
});

export async function POST(req: Request) {
  try {
    const rateLimit = chatRateLimiter.check(getClientRateLimitKey(req));

    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Too many chat requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const { messages }: { messages?: unknown } = await req.json();
    const safeMessages = validateChatMessages(messages);

    const result = streamText({
      model: getChatModel(),
      system: buildSeanSystemPrompt(),
      messages: await convertToModelMessages(safeMessages as UIMessage[])
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "Cache-Control": "no-store"
      },
      onError: () =>
        "Sean AI is temporarily unavailable. Please try again later."
    });
  } catch {
    return Response.json(
      { error: "Invalid chat request." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
