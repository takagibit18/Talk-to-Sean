"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, RotateCcw, Send, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

const starters = [
  "请介绍一下 Sean 的项目经验",
  "Sean 的技术栈是什么？",
  "如何联系 Sean？"
];

export function ChatShell() {
  const [input, setInput] = useState("");
  const { error, messages, sendMessage, status, stop } = useChat({
    id: "talk-to-sean"
  });

  const isBusy = status === "submitted" || status === "streaming";
  const canSend = input.trim().length > 0 && !isBusy;

  const renderedMessages = useMemo(() => {
    if (messages.length > 0) {
      return messages;
    }

    return [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text:
              "你好，我是 Sean 的 AI 助理。你可以问我他的项目经历、技术方向、能力边界和合作方式。"
          }
        ]
      }
    ];
  }, [messages]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();

    if (!text || isBusy) {
      return;
    }

    sendMessage({ text });
    setInput("");
  }

  function sendStarter(text: string) {
    if (isBusy) {
      return;
    }

    sendMessage({ text });
  }

  return (
    <main className="chat-page">
      <section className="chat-frame" aria-label="与 Sean 的 AI 助理对话">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <Bot size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1>与 Sean 的 AI 助理对话</h1>
              <p>公开匿名访问，回答基于 Sean 的 LLM Wiki 资料库。</p>
            </div>
          </div>
          <div className="chat-header-actions">
            <Link className="homepage-link" href="/">
              返回首页
            </Link>
            <button
              className="reset-button"
              onClick={() => window.location.reload()}
              title="重新开始"
              type="button"
            >
              <RotateCcw size={17} />
              重新开始
            </button>
            <div className="status-line" aria-live="polite">
              <span className="status-dot" aria-hidden="true" />
              {isBusy ? "Sean AI 正在回复" : "可以开始提问"}
            </div>
          </div>
        </header>

        <div className="chat-log" aria-live="polite">
          {renderedMessages.map((message) => (
            <article
              className={`message ${message.role === "user" ? "user" : "assistant"}`}
              key={message.id}
            >
              <div className="message-label">
                {message.role === "user" ? "Visitor" : "Sean AI"}
              </div>
              <div className="bubble">
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <span key={`${message.id}-${index}`}>{part.text}</span>
                  ) : null
                )}
              </div>
            </article>
          ))}

          {messages.length === 0 ? (
            <div className="starter-row" aria-label="Suggested questions">
              {starters.map((starter) => (
                <button
                  className="starter-button"
                  disabled={isBusy}
                  key={starter}
                  onClick={() => sendStarter(starter)}
                  type="button"
                >
                  <Sparkles size={15} strokeWidth={2.1} />
                  {starter}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form className="composer" onSubmit={submitMessage}>
          <div className="input-row">
            <textarea
              aria-label="输入你的问题"
              maxLength={1600}
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder="输入你的问题..."
              rows={2}
              value={input}
            />
            <button
              aria-label="发送消息"
              className="send-button"
              disabled={!canSend}
              title="发送消息"
              type="submit"
            >
              <Send size={18} strokeWidth={2.2} />
            </button>
            <button
              aria-label="停止回复"
              className="stop-button"
              disabled={!isBusy}
              onClick={() => stop()}
              title="停止回复"
              type="button"
            >
              <Square size={16} strokeWidth={2.2} />
            </button>
          </div>
          {error ? (
            <p className="error">
              当前聊天服务不可用，请检查 Vercel 中的 API Key 和模型环境变量。
            </p>
          ) : null}
          <p className="footnote">
            公开匿名 MVP。本应用不持久化会话；回答由 AI 基于 Sean 批准的 LLM Wiki
            资料生成。
          </p>
        </form>
      </section>
    </main>
  );
}
