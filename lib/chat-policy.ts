import type { UIMessage } from "ai";

const allowedRoles = new Set(["system", "user", "assistant"]);
const maxMessages = 24;
const maxTextCharacters = 12000;

export function validateChatMessages(messages: unknown): UIMessage[] {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array.");
  }

  if (messages.length > maxMessages) {
    throw new Error("Too many messages.");
  }

  let textCharacters = 0;

  for (const message of messages) {
    if (!isRecord(message) || typeof message.role !== "string") {
      throw new Error("Invalid message shape.");
    }

    if (!allowedRoles.has(message.role)) {
      throw new Error("Invalid message role.");
    }

    if (!Array.isArray(message.parts)) {
      throw new Error("Invalid message parts.");
    }

    for (const part of message.parts) {
      if (isRecord(part) && part.type === "text" && typeof part.text === "string") {
        textCharacters += part.text.length;
      }
    }
  }

  if (textCharacters > maxTextCharacters) {
    throw new Error("Conversation is too long.");
  }

  return messages as UIMessage[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
