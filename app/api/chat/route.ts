import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatError, ChatErrorCode, getChatErrorResponse, toChatError } from "@/lib/chat-errors";
import { checkCostGuard } from "@/lib/cost-guard";
import { logger } from "@/lib/logger";
import {
  createChatCompletionStream,
  getModelConfig,
  type ProviderMessage,
  type ProviderStreamComplete,
} from "@/lib/model-provider";
import { enforceMemoryRateLimit } from "@/lib/rate-limit";
import { getRequestIp, hashIp } from "@/lib/request";
import { recordUsage } from "@/lib/usage-tracker";
import { getWikiContext } from "@/lib/wiki-context";

export const dynamic = "force-dynamic";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(1200),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(20),
  locale: z.enum(["en", "zh"]).optional(),
});
const SESSION_COOKIE = "tts_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getAllowedOrigins(request: NextRequest) {
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigins = (process.env.CHAT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([requestOrigin, ...configuredOrigins]);
}

function assertAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return;
  }

  if (!getAllowedOrigins(request).has(origin)) {
    throw new ChatError(ChatErrorCode.FORBIDDEN_ORIGIN);
  }
}

function getOrCreateSessionId(request: NextRequest) {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing && /^[a-zA-Z0-9_-]{16,80}$/.test(existing)) {
    return { sessionId: existing, isNew: false };
  }

  return { sessionId: crypto.randomUUID(), isNew: true };
}

function getSessionCookie(sessionId: string) {
  return [
    `${SESSION_COOKIE}=${sessionId}`,
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

function buildMessages(messages: ProviderMessage[], locale: "en" | "zh" = "en") {
  const context = getWikiContext();
  const languageInstruction =
    locale === "zh"
      ? "Answer in Chinese unless the user asks otherwise."
      : "Answer in English unless the user asks otherwise.";

  return [
    {
      role: "system" as const,
      content: [
        "You are Sean Yu's public AI profile assistant.",
        "Keep answers concise, factual, and grounded in the provided public profile context.",
        "Do not invent private details or claim to be Sean.",
        languageInstruction,
        "",
        context,
      ].join("\n"),
    },
    ...messages.filter((message) => message.role !== "system"),
  ];
}

function parseChatBody(body: unknown) {
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new ChatError(
      ChatErrorCode.INVALID_MESSAGE,
      "Invalid chat request.",
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return parsed.data;
}

async function readChatBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new ChatError(ChatErrorCode.INVALID_MESSAGE, "Invalid chat request.");
  }
}

export function GET() {
  return NextResponse.json(
    {
      error: "The chat endpoint accepts POST requests with a messages array.",
      errorCode: "METHOD_NOT_ALLOWED",
    },
    {
      status: 405,
      headers: { Allow: "POST" },
    },
  );
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const ip = getRequestIp(request);
  const ipHash = hashIp(ip);
  const { sessionId, isNew } = getOrCreateSessionId(request);
  const sessionCookie = isNew ? getSessionCookie(sessionId) : null;

  try {
    assertAllowedOrigin(request);
    enforceMemoryRateLimit(ipHash);
    const quota = await checkCostGuard(ip, sessionId);

    if (!quota.allowed) {
      throw new ChatError(quota.errorCode);
    }

    const body = parseChatBody(await readChatBody(request));
    const config = getModelConfig();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let streamStarted = false;

    try {
      const finalizeStream = async (result: ProviderStreamComplete) => {
        const usageRecord = await recordUsage({
          ip,
          requestId,
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
        });

        logger.info(requestId, "chat.request.completed", {
          ipHash,
          messageCount: body.messages.length,
          durationMs: Date.now() - startedAt,
          promptTokens: usageRecord.promptTokens,
          completionTokens: usageRecord.completionTokens,
        });

        clearTimeout(timeout);
      };

      const stream = await createChatCompletionStream(
        config,
        buildMessages(body.messages, body.locale),
        controller.signal,
        finalizeStream,
        (error) => {
          logger.error(requestId, "chat.request.stream_failed", {
            ipHash,
            durationMs: Date.now() - startedAt,
            stack:
              process.env.NODE_ENV === "development" && error instanceof Error
                ? error.stack
                : undefined,
          });
          clearTimeout(timeout);
        },
        () => clearTimeout(timeout),
      );

      streamStarted = true;

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          ...(sessionCookie ? { "Set-Cookie": sessionCookie } : {}),
          "X-Request-Id": requestId,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ChatError(ChatErrorCode.PROVIDER_TIMEOUT);
      }

      throw error;
    } finally {
      if (!streamStarted || controller.signal.aborted) {
        clearTimeout(timeout);
      }
    }
  } catch (error) {
    const chatError = toChatError(error);
    const response = getChatErrorResponse(chatError);

    logger.error(requestId, "chat.request.failed", {
      ipHash,
      errorCode: chatError.code,
      durationMs: Date.now() - startedAt,
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
    });

    const errorResponse = NextResponse.json(
      {
        ...response.body,
        requestId,
      },
      { status: response.status },
    );

    if (sessionCookie) {
      errorResponse.headers.set("Set-Cookie", sessionCookie);
    }

    return errorResponse;
  }
}
