import { createElement, type ImgHTMLAttributes } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Hero from "@/components/cv/Hero";
import Skills, { TECH_STACK_ICONS } from "@/components/cv/Skills";
import TopBar from "@/components/cv/TopBar";
import RepoGrid from "@/components/RepoGrid";
import { CV_DATA } from "@/lib/cv-data";
import { FEATURED_PROJECTS } from "@/lib/project-highlights";

vi.mock("next/image", () => ({
  default: ({ priority: _priority, fill: _fill, unoptimized: _unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean; unoptimized?: boolean }) =>
    // eslint-disable-next-line @next/next/no-img-element
    createElement("img", { ...props, alt: props.alt ?? "" }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("homepage Agent system architecture", () => {
  it("renders Projects immediately after Hero and keeps the canonical section order", () => {
    const source = readFileSync(join(process.cwd(), "components/HomeContent.tsx"), "utf8");
    const tokens = [
      "<Hero",
      "<RepoGrid",
      "<Skills",
      "<ContributionHeatmap",
      "<About",
      "<Education",
      "<Languages",
      "<Publications",
      "<Contact",
      "<Footer",
    ];
    const positions = tokens.map((token) => source.indexOf(token));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("exposes project-first desktop and mobile navigation anchors", () => {
    render(
      <TopBar
        user={null}
        data={CV_DATA.en}
        locale="en"
        onLocaleChange={vi.fn()}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: /portfolio sections/i });
    const anchors = within(navigation).getAllByRole("link");
    expect(anchors).toHaveLength(5);
    expect(anchors[0]).toHaveAttribute("href", "#projects");
    expect(anchors.map((anchor) => anchor.getAttribute("href"))).toEqual(
      expect.arrayContaining(["#projects", "#skills", "#activity", "#about", "#contact"]),
    );
  });

  it("reduces Hero competition while preserving its primary trace", () => {
    const { container } = render(<Hero data={CV_DATA.en} talkToSeanUrl="/chat" />);

    expect(screen.getByText(/available for opportunities/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore projects/i })).toHaveClass("cv-cta-primary");
    expect(screen.getByRole("link", { name: /talk to sean/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download cv/i })).toHaveClass("cv-hero-cv-link");
    expect(container.querySelector(".cv-agent-step-list")).toBeInTheDocument();
    expect(container.querySelector(".cv-hero-trace")).toHaveAttribute("data-surface-level", "2");
    expect(container.querySelector(".cv-hero-card")).not.toBeInTheDocument();
    expect(container.querySelector(".cv-avatar-shell")).not.toBeInTheDocument();
    expect(container.querySelector(".cv-quote")).not.toBeInTheDocument();
    expect(container.querySelector(".cv-hero-signal-list")).not.toBeInTheDocument();
    expect(container.querySelector(".cv-scroll-cue")).not.toBeInTheDocument();
  });

  it("keeps a compact interactive Icon Cloud linked to five capabilities", () => {
    const { container } = render(<Skills data={CV_DATA.en} />);

    expect(TECH_STACK_ICONS).toHaveLength(8);
    expect(screen.getByRole("img", { name: /technology icon cloud/i })).toBeInTheDocument();
    const cloud = screen.getByRole("group", { name: /core technology ecosystem/i });
    expect(within(cloud).getAllByRole("button")).toHaveLength(8);
    const matrix = screen.getByRole("list", { name: /engineering capability matrix/i });
    expect(within(matrix).getAllByRole("button")).toHaveLength(5);
    expect(cloud.closest("[data-surface-level='2']")).toBeInTheDocument();
    expect(matrix.closest("[data-surface-level='0']")).toBeInTheDocument();
    expect(container.querySelectorAll(".cv-skill-cluster[tabindex]")).toHaveLength(0);
    expect(container.querySelectorAll(".cv-chip[tabindex]")).toHaveLength(0);

    const fastApi = within(cloud).getByRole("button", { name: "FastAPI" });
    fireEvent.focus(fastApi);
    expect(within(matrix).getByRole("button", { name: /backend/i })).toHaveAttribute(
      "data-active",
      "true",
    );

    const retrieval = within(matrix).getByRole("button", { name: /^retrieval:/i });
    fireEvent.focus(retrieval);
    expect(within(cloud).getByRole("button", { name: "Qdrant" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("gives every project a distinct topology and two to four sourced metrics", () => {
    for (const project of FEATURED_PROJECTS) {
      const configured = project as typeof project & {
        architectureDiagram?: { id: string; nodes: unknown[]; edges: unknown[] };
        metrics?: Array<{ value: string; label: Record<"en" | "zh", string>; source: string }>;
      };
      expect(configured.architectureDiagram?.nodes.length).toBeGreaterThanOrEqual(4);
      expect(configured.architectureDiagram?.edges.length).toBeGreaterThanOrEqual(3);
      expect(configured.metrics?.length).toBeGreaterThanOrEqual(2);
      expect(configured.metrics?.length).toBeLessThanOrEqual(4);
      expect(configured.metrics?.every((metric) => /\d/.test(metric.value))).toBe(true);
      expect(configured.metrics?.every((metric) => metric.source.length > 0)).toBe(true);
    }

    const graphIds = FEATURED_PROJECTS.map(
      (project) =>
        (project as typeof project & { architectureDiagram?: { id: string } }).architectureDiagram?.id,
    );
    expect(new Set(graphIds).size).toBe(FEATURED_PROJECTS.length);
  });

  it("renders project architecture before metrics and keeps external actions separate", () => {
    const { container } = render(<RepoGrid repos={[]} locale="en" data={CV_DATA.en} />);
    const cards = container.querySelectorAll("[data-project-card]");

    expect(cards).toHaveLength(FEATURED_PROJECTS.length);
    cards.forEach((card, index) => {
      expect(card).toHaveClass("cv-project-case");
      expect(card).toHaveAttribute("data-layout", index % 2 === 0 ? "content-first" : "visual-first");
      expect(card.querySelector(".cv-project-case__content")).toBeInTheDocument();
      expect(card.querySelector(".cv-project-case__visual")).toBeInTheDocument();
      const diagram = card.querySelector("[data-architecture-diagram]");
      const metrics = card.querySelector("[data-project-metrics]");
      expect(diagram).toBeInTheDocument();
      expect(metrics).toBeInTheDocument();
      expect(card.querySelector(".cv-project-case__visual")).toHaveAttribute(
        "data-surface-level",
        "2",
      );
      expect(within(card as HTMLElement).getAllByRole("link", { name: /github|live demo/i }).length).toBeGreaterThan(0);
    });
  });

  it("returns a project signal from processing to verified after one event cycle", () => {
    vi.useFakeTimers();
    const { container } = render(<RepoGrid repos={[]} locale="en" data={CV_DATA.en} />);
    const card = container.querySelector<HTMLElement>("[data-project-card]");

    expect(card).not.toBeNull();
    fireEvent.mouseEnter(card!);
    expect(within(card!).getByText(CV_DATA.en.projects.processingLabel)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1800));
    expect(within(card!).getByText(CV_DATA.en.projects.verifiedLabel)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
