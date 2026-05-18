import { DEFAULT_OPENAI_BASE_URL, getEnvValidationResult } from "@/lib/config";
import { ChatError, ChatErrorCode } from "@/lib/chat-errors";

export type ModelConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
};

export function getModelConfig(): ModelConfig {
  const result = getEnvValidationResult(process.env, {
    missingOpenAIKeyMessage: "OPENAI_API_KEY is not configured",
  });

  if (!result.success) {
    if (result.errors.some((error) => error.includes("OPENAI_API_KEY"))) {
      throw new ChatError(ChatErrorCode.MISSING_API_KEY);
    }

    if (result.errors.some((error) => error.includes("Invalid URL"))) {
      throw new ChatError(ChatErrorCode.INVALID_BASE_URL);
    }

    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE, result.errors.join("; "));
  }

  if (!result.env.OPENAI_API_KEY) {
    throw new ChatError(ChatErrorCode.MISSING_API_KEY);
  }

  try {
    new URL(result.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL);
  } catch {
    throw new ChatError(ChatErrorCode.INVALID_BASE_URL);
  }

  return {
    apiKey: result.env.OPENAI_API_KEY,
    model: result.env.OPENAI_MODEL,
    baseURL: result.env.OPENAI_BASE_URL,
  };
}

export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ProviderResult = {
  message: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type ProviderStreamComplete = ProviderResult;

export async function createChatCompletion(
  config: ModelConfig,
  messages: ProviderMessage[],
  signal: AbortSignal,
): Promise<ProviderResult> {
  const endpoint = new URL("chat/completions", `${config.baseURL.replace(/\/$/, "")}/`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
    }),
    signal,
  });

  if (response.status === 429) {
    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
  }

  if (!response.ok) {
    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
  }

  return {
    message: content.trim(),
    usage: {
      promptTokens: body?.usage?.prompt_tokens,
      completionTokens: body?.usage?.completion_tokens,
      totalTokens: body?.usage?.total_tokens,
    },
  };
}

export async function createChatCompletionStream(
  config: ModelConfig,
  messages: ProviderMessage[],
  signal: AbortSignal,
  onComplete: (result: ProviderStreamComplete) => Promise<void>,
  onError?: (error: unknown) => void,
  onCancel?: () => void,
  transformMessage?: (message: string) => string,
): Promise<ReadableStream<Uint8Array>> {
  const endpoint = new URL("chat/completions", `${config.baseURL.replace(/\/$/, "")}/`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.1,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal,
  });

  if (response.status === 429) {
    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
  }

  if (!response.ok || !response.body) {
    throw new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let message = "";
  let usage: ProviderResult["usage"] | undefined;
  let finalized = false;

  const finalize = async (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (finalized) {
      return;
    }

    finalized = true;
    const finalMessage = transformMessage ? transformMessage(message) : message.trim();
    if (finalMessage) {
      controller.enqueue(encoder.encode(finalMessage));
    }
    await onComplete({ message: finalMessage.trim(), usage });
    controller.close();
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            await finalize(controller);
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const payload = line.slice(5).trim();
            if (!payload) {
              continue;
            }

            if (payload === "[DONE]") {
              await finalize(controller);
              return;
            }

            const body = JSON.parse(payload);
            const content = body?.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              message += content;
            }

            if (body?.usage) {
              usage = {
                promptTokens: body.usage.prompt_tokens,
                completionTokens: body.usage.completion_tokens,
                totalTokens: body.usage.total_tokens,
              };
            }
          }
        }
      } catch (error) {
        onError?.(error);
        controller.error(error);
      }
    },
    cancel() {
      onCancel?.();
      void reader.cancel();
    },
  });
}
