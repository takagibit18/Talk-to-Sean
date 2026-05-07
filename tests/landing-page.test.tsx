import { fireEvent, render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { CV_DATA } from "@/lib/cv-data";

vi.mock("@/lib/github", () => ({
  getGitHubUser: vi.fn(async () => ({
    login: "takagibit18",
    name: "Sean Yu",
    bio: null,
    avatar_url: "/avatar.png",
    html_url: "https://github.com/takagibit18",
    public_repos: 12,
    followers: 3,
    following: 4,
    blog: null,
    email: null,
    twitter_username: null
  })),
  getGitHubRepos: vi.fn(async () => [
    {
      name: "shotgunCV",
      html_url: "https://github.com/takagibit18/shotgunCV",
      description: "AI Resume Ops",
      stargazers_count: 8,
      forks_count: 1,
      language: "Python",
      updated_at: "2026-05-01T00:00:00Z"
    },
    {
      name: "MergeWarden",
      html_url: "https://github.com/takagibit18/MergeWarden",
      description: "Code review agent",
      stargazers_count: 4,
      forks_count: 0,
      language: "Python",
      updated_at: "2026-05-02T00:00:00Z"
    }
  ])
}));

vi.mock("@/lib/contributions", () => ({
  getContributions: vi.fn(async () => [
    { date: "2026-05-01", count: 3 },
    { date: "2026-05-02", count: 6 }
  ])
}));

async function renderHome() {
  render(await Home());
}

describe("homepage", () => {
  it("renders the synced Homepage sections and content", async () => {
    await renderHome();

    expect(screen.getByRole("heading", { level: 1, name: CV_DATA.en.hero.name })).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.about)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.skills)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.projects)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.activity)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.education)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.languages)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.sections.contact)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.footer.tagline)).toBeInTheDocument();
  });

  it("uses only the Hero CTA to link into the chatbot", async () => {
    await renderHome();

    expect(screen.getByRole("link", { name: /Explore Projects/ })).toHaveAttribute(
      "href",
      "#projects"
    );
    expect(screen.getByRole("link", { name: /Talk to Sean/ })).toHaveAttribute(
      "href",
      "/chat"
    );
    expect(screen.getAllByRole("link", { name: /Download CV/ })[0]).toHaveAttribute(
      "href",
      "/cv.pdf"
    );
    expect(screen.queryByRole("heading", { name: "Talk to Sean AI" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Type your question")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Talk to Sean/ })).toHaveLength(1);
    expect(screen.queryByText(CV_DATA.en.contact.talkToSeanLabel)).not.toBeInTheDocument();
  });

  it("switches Homepage copy between English and Chinese", async () => {
    await renderHome();

    expect(screen.getByText(CV_DATA.en.nav.exploreProjects)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /中|涓/ }));

    expect(screen.getByText(CV_DATA.zh.nav.exploreProjects)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.zh.sections.contact)).toBeInTheDocument();
  });

  it("shows Homepage contact details while chatbot knowledge still owns privacy", async () => {
    await renderHome();

    expect(screen.getByText(CV_DATA.en.contact.phone)).toBeInTheDocument();
    expect(screen.getByText(CV_DATA.en.contact.email)).toBeInTheDocument();
    expect(screen.getByText("takagibit18")).toBeInTheDocument();
    expect(screen.getByText("WeChat")).toBeInTheDocument();
  });
});
