import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { validateChatMessages } from "@/lib/chat-policy";
import { getChatModel } from "@/lib/model-provider";
import { buildSeanSystemPrompt } from "@/lib/prompt";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
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
