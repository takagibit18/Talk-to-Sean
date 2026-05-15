import { createElement, type ImgHTMLAttributes } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Hero from "@/components/cv/Hero";
import Skills, { TECH_STACK_ICONS } from "@/components/cv/Skills";
import {
  ICON_CLOUD_ROTATION_CONFIG,
  createIconCloudOrbitPoints,
  getIconCloudPointerDecay,
} from "@/components/motion/IconCloud";
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

  test("skills icon cloud items render from logo image assets with glyph fallback only", () => {
    expect(TECH_STACK_ICONS).toHaveLength(12);
    expect(TECH_STACK_ICONS.every((item) => item.logoSrc?.startsWith("/tech-logos/"))).toBe(
      true,
    );
    expect(TECH_STACK_ICONS.every((item) => item.glyph.length > 0)).toBe(true);
  });

  test("icon cloud uses calm auto-rotation without speeding up on pointer hover", () => {
    const fullYRotationSeconds =
      (Math.PI * 2) / (ICON_CLOUD_ROTATION_CONFIG.autoRotateY * 60);

    expect(fullYRotationSeconds).toBeGreaterThanOrEqual(12);
    expect(fullYRotationSeconds).toBeLessThanOrEqual(18);
    expect(ICON_CLOUD_ROTATION_CONFIG.autoRotateX).toBeLessThan(0.003);
    expect(ICON_CLOUD_ROTATION_CONFIG.pointerRotateY).toBeGreaterThan(1.2);
    expect(ICON_CLOUD_ROTATION_CONFIG.pointerRotateX).toBeGreaterThan(0.9);
    expect(ICON_CLOUD_ROTATION_CONFIG.tickIncrement).toBe(1);
    expect(ICON_CLOUD_ROTATION_CONFIG.pointerActiveTickIncrement).toBe(1);
  });

  test("icon cloud pointer influence eases out over the leave decay window", () => {
    expect(ICON_CLOUD_ROTATION_CONFIG.pointerLeaveDecayMs).toBeGreaterThanOrEqual(1200);
    expect(ICON_CLOUD_ROTATION_CONFIG.pointerLeaveDecayMs).toBeLessThanOrEqual(1800);
    expect(getIconCloudPointerDecay(0)).toBe(1);
    expect(getIconCloudPointerDecay(750)).toBeCloseTo(0.125);
    expect(getIconCloudPointerDecay(1500)).toBe(0);
  });

  test("icon cloud orbit paths are centered great circles through the logo anchor", () => {
    const anchor = {
      x: 0.35,
      y: 0.42,
      z: Math.sqrt(1 - 0.35 ** 2 - 0.42 ** 2),
    };
    const orbit = createIconCloudOrbitPoints(anchor, 16, 0.75);

    expect(orbit).toHaveLength(17);
    expect(orbit[0].x).toBeCloseTo(anchor.x);
    expect(orbit[0].y).toBeCloseTo(anchor.y);
    expect(orbit[0].z).toBeCloseTo(anchor.z);
    expect(orbit[0].x).toBeCloseTo(orbit.at(-1)?.x ?? Number.NaN);
    expect(orbit[0].y).toBeCloseTo(orbit.at(-1)?.y ?? Number.NaN);
    expect(orbit[0].z).toBeCloseTo(orbit.at(-1)?.z ?? Number.NaN);
    expect(orbit.every((point) => Math.hypot(point.x, point.y, point.z) > 0.999)).toBe(true);
    expect(orbit.every((point) => Math.hypot(point.x, point.y, point.z) < 1.001)).toBe(true);
    expect(orbit.some((point) => Math.abs(point.y - anchor.y) > 0.2)).toBe(true);
  });
});
