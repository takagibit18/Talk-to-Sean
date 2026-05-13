import { describe, expect, it } from "vitest";
import { ChatError, ChatErrorCode, getChatErrorResponse } from "@/lib/chat-errors";
import { getChatErrorMessage } from "@/lib/chat-ui";
import { CV_DATA } from "@/lib/cv-data";

describe("chat error mapping", () => {
  it("serializes missing API key as a 503 with a stable code", () => {
    const error = new ChatError(ChatErrorCode.MISSING_API_KEY);
    const response = getChatErrorResponse(error);

    expect(response.status).toBe(503);
    expect(response.body.errorCode).toBe("MISSING_API_KEY");
  });

  it("renders the user-facing missing API key copy", () => {
    const message = getChatErrorMessage("MISSING_API_KEY", CV_DATA.en);

    expect(message).toContain("Service not configured");
  });
});
