import { fireEvent, render, screen } from "@testing-library/react";
import { useChat } from "@ai-sdk/react";
import { ChatShell } from "@/components/chat-shell";

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn()
}));

const mockedUseChat = vi.mocked(useChat);

describe("chat shell", () => {
  const sendMessage = vi.fn();
  const stop = vi.fn();

  beforeEach(() => {
    sendMessage.mockReset();
    stop.mockReset();
    mockedUseChat.mockReturnValue({
      error: undefined,
      messages: [],
      sendMessage,
      status: "ready",
      stop
    } as unknown as ReturnType<typeof useChat>);
  });

  it("sends the current message when Enter is pressed in the composer", () => {
    render(<ChatShell />);

    const textarea = screen.getByLabelText("Type your question");
    fireEvent.change(textarea, { target: { value: "Please introduce Sean" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    expect(sendMessage).toHaveBeenCalledWith({ text: "Please introduce Sean" });
    expect(textarea).toHaveValue("");
  });

  it("keeps Shift+Enter as a newline shortcut without sending", () => {
    render(<ChatShell />);

    const textarea = screen.getByLabelText("Type your question");
    fireEvent.change(textarea, { target: { value: "First line" } });
    fireEvent.keyDown(textarea, {
      key: "Enter",
      code: "Enter",
      shiftKey: true
    });

    expect(sendMessage).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("First line");
  });

  it("renders assistant markdown as preview elements", () => {
    mockedUseChat.mockReturnValue({
      error: undefined,
      messages: [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "## Projects\n\n- **shotgunCV**\n- `Mergewarden`"
            }
          ]
        }
      ],
      sendMessage,
      status: "ready",
      stop
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatShell />);

    expect(screen.getByRole("heading", { level: 2, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("shotgunCV").tagName).toBe("STRONG");
    expect(screen.getByText("Mergewarden").tagName).toBe("CODE");
  });

  it("links the full-screen chat page back to the homepage", () => {
    render(<ChatShell />);

    expect(screen.getByRole("link", { name: "Back to homepage" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
