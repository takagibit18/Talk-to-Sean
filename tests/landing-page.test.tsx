import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("overseas homepage", () => {
  it("renders a complete overseas personal homepage", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Sean Yu/ })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/AI-native developer/).length).toBeGreaterThan(0);
    expect(screen.getByText("about", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("skills", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("projects", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("contact", { selector: "strong" })).toBeInTheDocument();
  });

  it("links primary actions to projects, full chat, and CV", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /Explore Projects/ })).toHaveAttribute(
      "href",
      "#projects"
    );
    expect(screen.getByRole("link", { name: /Full Chat/ })).toHaveAttribute(
      "href",
      "/chat"
    );
    expect(screen.getByRole("link", { name: /Download CV/ })).toHaveAttribute(
      "href",
      "/cv.pdf"
    );
  });

  it("shows migrated project and public contact facts without phone exposure", () => {
    render(<Home />);

    expect(screen.getByText("shotgunCV")).toBeInTheDocument();
    expect(screen.getByText("Mergewarden")).toBeInTheDocument();
    expect(screen.getByText("huali6641@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("takagibit18")).toBeInTheDocument();
    expect(screen.getByText("Sean_Yu3")).toBeInTheDocument();
    expect(screen.queryByText(/1[3-9]\d{9}/)).not.toBeInTheDocument();
  });
});
