import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatShell from "@/components/chat/ChatShell";

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
  });

  it("keeps only the soft chat ambient layer in the hero area", () => {
    const { container } = render(<ChatShell initialLocale="en" />);

    expect(container.querySelector(".chat-ambient-field")).toBeInTheDocument();
    expect(container.querySelector(".page-grain")).not.toBeInTheDocument();
    expect(container.querySelector(".chat-signal-card")).not.toBeInTheDocument();
    expect(container.querySelector(".chat-orbit")).not.toBeInTheDocument();
  });
});
