import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatShell from "@/components/chat/ChatShell";
import { CV_DATA } from "@/lib/cv-data";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe("ChatShell visual layer", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps only the soft chat ambient layer in the hero area", () => {
    const { container } = render(<ChatShell initialLocale="en" />);

    expect(container.querySelector(".chat-ambient-field")).toBeInTheDocument();
    expect(container.querySelector(".page-grain")).not.toBeInTheDocument();
    expect(container.querySelector(".chat-signal-card")).not.toBeInTheDocument();
    expect(container.querySelector(".chat-orbit")).not.toBeInTheDocument();
  });

  it("fills the composer with a different random magic prompt and focuses the textarea", () => {
    const promptPool = [
      ...CV_DATA.en.chat.starterPrompts,
      ...((CV_DATA.en.chat as typeof CV_DATA.en.chat & { magicPrompts?: string[] }).magicPrompts ??
        []),
    ];
    expect(promptPool.length).toBeGreaterThan(CV_DATA.en.chat.starterPrompts.length);

    const randomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99);
    render(<ChatShell initialLocale="en" />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: promptPool[0] } });
    fireEvent.click(screen.getByRole("button", { name: "Ask a random question" }));

    expect(textarea).toHaveValue(promptPool.at(-1));
    expect(textarea).toHaveFocus();
    expect(randomSpy).toHaveBeenCalledTimes(2);
  });

  it("disables the magic prompt button while a chat request is submitting", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));
    render(<ChatShell initialLocale="en" />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Tell me about Sean's agent work." } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Ask a random question" })).toBeDisabled(),
    );
  });
});
