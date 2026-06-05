import { createElement, type ImgHTMLAttributes } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Contact from "@/components/cv/Contact";
import Publications from "@/components/cv/Publications";
import { CV_DATA } from "@/lib/cv-data";
import { FEATURED_PROJECTS } from "@/lib/project-highlights";

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

describe("homepage design polish", () => {
  it("keeps the highlights and contact sections on unique sequence numbers", () => {
    const { container } = render(
      <>
        <Publications data={CV_DATA.en} locale="en" />
        <Contact data={CV_DATA.en} talkToSeanUrl="/chat" />
      </>,
    );

    const sections = container.querySelectorAll("section");
    const highlights = within(sections[0] as HTMLElement);
    const contact = within(sections[1] as HTMLElement);

    expect(highlights.getByText("07.")).toBeInTheDocument();
    expect(contact.getByText("08.")).toBeInTheDocument();
  });

  it("prioritizes the AI profile contact action before raw personal contact fields", () => {
    render(<Contact data={CV_DATA.en} talkToSeanUrl="/chat" />);

    const contactPanel = screen.getByRole("region", { name: /contact options/i });
    const firstLink = within(contactPanel).getAllByRole("link")[0];

    expect(firstLink).toHaveTextContent("AI profile");
    expect(firstLink).toHaveTextContent("Talk to Sean");
  });

  it("keeps featured project copy compact enough for fast scanning", () => {
    for (const project of FEATURED_PROJECTS) {
      for (const locale of ["en", "zh"] as const) {
        expect(project.description[locale].length).toBeLessThanOrEqual(150);
        expect(project.problem[locale].length).toBeLessThanOrEqual(130);
        expect(project.architecture[locale].length).toBeLessThanOrEqual(150);
        expect(project.evidence[locale].length).toBeLessThanOrEqual(150);
      }
    }
  });

  it("lists Sean's build log handle across short-form social platforms", () => {
    for (const locale of ["en", "zh"] as const) {
      expect(CV_DATA[locale].contact.socials).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: "抖音", text: "Sean的构建日志", kind: "handle" }),
          expect.objectContaining({ label: "小红书", text: "Sean的构建日志", kind: "handle" }),
          expect.objectContaining({ label: "Twitter", text: "Sean的构建日志", kind: "handle" }),
        ]),
      );
    }
  });

  it("opens short-form social handles in a dialog instead of printing them inline", () => {
    render(<Contact data={CV_DATA.zh} talkToSeanUrl="/chat" />);

    const socialPanel = screen.getByText("社交").closest(".cv-contact-social") as HTMLElement;

    expect(within(socialPanel).getByRole("button", { name: "抖音" })).toBeInTheDocument();
    expect(within(socialPanel).getByRole("button", { name: "小红书" })).toBeInTheDocument();
    expect(within(socialPanel).getByRole("button", { name: "Twitter" })).toBeInTheDocument();
    expect(within(socialPanel).queryByText("Sean的构建日志")).not.toBeInTheDocument();

    fireEvent.click(within(socialPanel).getByRole("button", { name: "抖音" }));

    expect(screen.getByRole("dialog", { name: "抖音" })).toBeInTheDocument();
    expect(screen.getByText("Sean的构建日志")).toBeInTheDocument();
  });
});
