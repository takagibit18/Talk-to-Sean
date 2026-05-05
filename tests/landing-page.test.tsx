import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("landing page", () => {
  it("renders the Chinese-first Sean AI landing hero", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "和 Sean 的 AI 代理聊聊" })
    ).toBeInTheDocument();
    expect(screen.getByText("Sean · AI 助理")).toBeInTheDocument();
    expect(screen.getByText("项目经历")).toBeInTheDocument();
    expect(screen.getByText("技术栈")).toBeInTheDocument();
    expect(screen.getByText("合作方式")).toBeInTheDocument();
  });

  it("links primary actions to chat and Sean homepage", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /开始聊天/ })).toHaveAttribute(
      "href",
      "/chat"
    );
    expect(screen.getByRole("link", { name: /查看主页/ })).toHaveAttribute(
      "href",
      "http://seanhomepage.top"
    );
  });
});
