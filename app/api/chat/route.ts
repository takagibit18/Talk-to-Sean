import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { validateChatMessages } from "@/lib/chat-policy";
import { buildSeanSystemPrompt } from "@/lib/prompt";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages }: { messages?: unknown } = await req.json();
    const safeMessages = validateChatMessages(messages);
    const modelName = process.env.OPENAI_MODEL ?? "gpt-5-mini";

    const result = streamText({
      model: openai(modelName),
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
