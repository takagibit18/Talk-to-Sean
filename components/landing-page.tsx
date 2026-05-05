import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  Handshake,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Send,
  User
} from "lucide-react";
import Link from "next/link";

const cards = [
  {
    title: "项目经历",
    text: "AI 应用、Agent 系统、自动化工具等多类项目经验，持续创造价值。",
    icon: BriefcaseBusiness
  },
  {
    title: "技术栈",
    text: "Python、TypeScript、LangChain、LLM、云服务、数据库等。",
    icon: Code2
  },
  {
    title: "合作方式",
    text: "远程合作、项目咨询、技术顾问或长期共建，灵活协作。",
    icon: Handshake
  }
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-label="Sean AI assistant landing">
        <div className="landing-copy">
          <p className="landing-brand">Sean · AI 助理</p>
          <h1 aria-label="和 Sean 的 AI 代理聊聊">
            <span aria-hidden="true">和 Sean 的</span>
            <span aria-hidden="true">AI 代理聊聊</span>
          </h1>
          <p className="landing-subtitle">
            想了解我的经历、项目、技能与合作方式？直接开始对话。
          </p>
          <div className="landing-actions">
            <Link className="primary-action" href="/chat">
              <MessageCircle size={23} strokeWidth={2.1} />
              开始聊天
            </Link>
            <a className="secondary-action" href="http://seanhomepage.top">
              <User size={23} strokeWidth={2.1} />
              查看主页
            </a>
          </div>
        </div>

        <div className="preview-card" aria-label="与 Sean 的 AI 助理对话预览">
          <div className="preview-topbar">
            <div className="preview-title">
              <span className="preview-dot" aria-hidden="true" />
              <span>与 Sean 的 AI 助理对话</span>
            </div>
            <div className="preview-tools" aria-hidden="true">
              <RefreshCw size={18} />
              <span>重新开始</span>
              <MoreHorizontal size={20} />
            </div>
          </div>

          <div className="preview-thread">
            <div className="preview-row assistant-preview">
              <div className="preview-avatar" aria-hidden="true">
                <Bot size={24} />
              </div>
              <div>
                <div className="preview-bubble">
                  你好，我是 Sean 的 AI 助理，可以介绍他的项目经历、技术方向和合作方式。
                  <br />
                  你想先了解哪一部分？
                </div>
                <span className="preview-time">10:30</span>
              </div>
            </div>

            <div className="preview-row user-preview">
              <div>
                <div className="preview-bubble user-bubble">
                  请介绍一下 Sean 的项目经验
                </div>
                <span className="preview-time user-time">10:31 ✓✓</span>
              </div>
            </div>

            <div className="preview-row assistant-preview">
              <div className="preview-avatar" aria-hidden="true">
                <Bot size={24} />
              </div>
              <div>
                <div className="preview-bubble">
                  Sean 专注于 AI、Agent 和软件方向的项目开发，具备从 0 到 1
                  的产品落地经验。
                  <br />
                  他主导过 AI 应用与自动化工具项目，擅长将前沿技术转化为实际可用的解决方案。
                </div>
                <span className="preview-time">10:31</span>
              </div>
            </div>
          </div>

          <div className="preview-input">
            <span>输入你的问题...</span>
            <button aria-label="发送预览消息" type="button">
              <Send size={21} />
            </button>
          </div>
          <p className="preview-hint">按 Enter 发送，Shift + Enter 换行</p>
        </div>
      </section>

      <section className="landing-card-grid" aria-label="快速了解 Sean">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link className="info-card" href="/chat" key={card.title}>
              <span className="info-icon" aria-hidden="true">
                <Icon size={35} strokeWidth={2.1} />
              </span>
              <span className="info-content">
                <strong>{card.title}</strong>
                <span>{card.text}</span>
              </span>
              <ArrowRight className="info-arrow" size={24} strokeWidth={2} />
            </Link>
          );
        })}
      </section>

      <footer className="landing-footer">
        <span />
        <p>开放合作 · 持续构建 · 期待与你一起创造更多可能</p>
        <span />
      </footer>
    </main>
  );
}
