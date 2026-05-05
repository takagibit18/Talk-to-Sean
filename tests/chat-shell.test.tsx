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

    const textarea = screen.getByLabelText("输入你的问题");
    fireEvent.change(textarea, { target: { value: "请介绍 Sean" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    expect(sendMessage).toHaveBeenCalledWith({ text: "请介绍 Sean" });
    expect(textarea).toHaveValue("");
  });

  it("keeps Shift+Enter as a newline shortcut without sending", () => {
    render(<ChatShell />);

    const textarea = screen.getByLabelText("输入你的问题");
    fireEvent.change(textarea, { target: { value: "第一行" } });
    fireEvent.keyDown(textarea, {
      key: "Enter",
      code: "Enter",
      shiftKey: true
    });

    expect(sendMessage).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("第一行");
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
              text: "## 项目\n\n- **shotgunCV**\n- `Mergewarden`"
            }
          ]
        }
      ],
      sendMessage,
      status: "ready",
      stop
    } as unknown as ReturnType<typeof useChat>);

    render(<ChatShell />);

    expect(
      screen.getByRole("heading", { level: 2, name: "项目" })
    ).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("shotgunCV").tagName).toBe("STRONG");
    expect(screen.getByText("Mergewarden").tagName).toBe("CODE");
  });
});
