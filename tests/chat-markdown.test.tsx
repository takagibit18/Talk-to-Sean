import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";

describe("ChatMarkdown", () => {
  it("renders assistant markdown without executing raw HTML", () => {
    render(
      <ChatMarkdown
        content={[
          "**Agent & Tool Calling** with *traceable* output and `submit_review`.",
          "",
          "- RAG & Retrieval Evaluation",
          "- Backend deployment",
          "",
          "Read https://example.com/report for context.",
          "",
          "<img src=x onerror=alert(1)>",
        ].join("\n")}
      />,
    );

    expect(screen.getByText("Agent & Tool Calling").tagName).toBe("STRONG");
    expect(screen.getByText("traceable").tagName).toBe("EM");
    expect(screen.getByText("submit_review")).toHaveClass("chat-markdown-inline-code");

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);

    expect(screen.getByRole("link", { name: "https://example.com/report" })).toHaveAttribute(
      "href",
      "https://example.com/report",
    );
    expect(document.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });

  it("keeps incomplete streaming markdown stable and shows the cursor", () => {
    render(<ChatMarkdown content="**bold tex" isStreaming />);

    expect(screen.getByText("**bold tex")).toBeInTheDocument();
    expect(document.querySelector(".chat-stream-cursor")).toBeInTheDocument();
  });
});
