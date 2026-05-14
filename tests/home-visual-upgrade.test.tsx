import { createElement, type ImgHTMLAttributes } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Hero from "@/components/cv/Hero";
import Skills from "@/components/cv/Skills";
import TopBar from "@/components/cv/TopBar";
import { CV_DATA } from "@/lib/cv-data";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) =>
    // eslint-disable-next-line @next/next/no-img-element
    createElement("img", { ...props, alt: props.alt ?? "" }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe("homepage visual upgrade", () => {
  beforeEach(() => {
    document.documentElement.className = "dark";
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = "";
  });

  test("top bar exposes an animated theme toggle that persists light mode", async () => {
    render(<TopBar user={null} data={CV_DATA.en} locale="en" onLocaleChange={vi.fn()} />);

    const toggle = await screen.findByRole("button", { name: /switch to light theme/i });
    fireEvent.click(toggle);

    await waitFor(() => expect(document.documentElement).not.toHaveClass("dark"));
    expect(localStorage.getItem("theme")).toBe("light");
    expect(screen.getByRole("button", { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  test("hero keeps the public name as a heading while applying the text hover effect", () => {
    render(<Hero data={CV_DATA.en} talkToSeanUrl="/chat" />);

    const heading = screen.getByRole("heading", { name: "Sean Yu" });
    const hoverEffect = heading.querySelector("[data-text-hover-effect]");

    expect(heading).toBeVisible();
    expect(hoverEffect).toHaveTextContent("Sean Yu");
  });

  test("skills section includes an accessible interactive technology icon cloud", () => {
    render(<Skills data={CV_DATA.en} />);

    expect(
      screen.getByRole("img", { name: /technology icon cloud/i }),
    ).toBeInTheDocument();
  });
});
