"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, RotateCcw, Send, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { FormEvent, KeyboardEvent, ReactNode, useMemo, useState } from "react";
import { profileContent } from "@/lib/profile-content";

type ChatShellProps = {
  mode?: "full" | "embedded";
};

export function ChatShell({ mode = "full" }: ChatShellProps) {
  const [input, setInput] = useState("");
  const { error, messages, sendMessage, status, stop } = useChat({
    id: mode === "embedded" ? "talk-to-sean-embedded" : "talk-to-sean"
  });

  const isEmbedded = mode === "embedded";
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
            text: profileContent.chat.welcome
          }
        ]
      }
    ];
  }, [messages]);

  function sendCurrentMessage() {
    const text = input.trim();

    if (!text || isBusy) {
      return;
    }

    sendMessage({ text });
    setInput("");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendCurrentMessage();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    sendCurrentMessage();
  }

  function sendStarter(text: string) {
    if (isBusy) {
      return;
    }

    sendMessage({ text });
  }

  const frame = (
    <section
      className={`chat-frame ${isEmbedded ? "chat-frame-embedded" : ""}`}
      aria-label={profileContent.chat.title}
    >
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Bot size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h1>{profileContent.chat.title}</h1>
            <p>{profileContent.chat.subtitle}</p>
          </div>
        </div>
        <div className="chat-header-actions">
          {!isEmbedded && (
            <Link className="homepage-link" href="/">
              Back to homepage
            </Link>
          )}
          <button
            className="reset-button"
            onClick={() => window.location.reload()}
            title="Restart chat"
            type="button"
          >
            <RotateCcw size={17} />
            Reset
          </button>
          <div className="status-line" aria-live="polite">
            <span className="status-dot" aria-hidden="true" />
            {isBusy ? "Sean AI is replying" : "Ready for questions"}
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
            <div
              className={`bubble ${message.role === "assistant" ? "markdown-preview" : ""}`}
            >
              {message.parts.map((part, index) =>
                part.type === "text" && message.role === "assistant" ? (
                  <MarkdownPreview
                    key={`${message.id}-${index}`}
                    text={part.text}
                  />
                ) : part.type === "text" ? (
                  <span key={`${message.id}-${index}`}>{part.text}</span>
                ) : null
              )}
            </div>
          </article>
        ))}

        {messages.length === 0 ? (
          <div className="starter-row" aria-label="Suggested questions">
            {profileContent.chat.starters.map((starter) => (
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
            aria-label="Type your question"
            maxLength={1200}
            onKeyDown={handleComposerKeyDown}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask about Sean's projects, skills, or collaboration fit..."
            rows={isEmbedded ? 2 : 3}
            value={input}
          />
          <button
            aria-label="Send message"
            className="send-button"
            disabled={!canSend}
            title="Send message"
            type="submit"
          >
            <Send size={18} strokeWidth={2.2} />
          </button>
          <button
            aria-label="Stop response"
            className="stop-button"
            disabled={!isBusy}
            onClick={() => stop()}
            title="Stop response"
            type="button"
          >
            <Square size={16} strokeWidth={2.2} />
          </button>
        </div>
        {error ? (
          <p className="error">
            Chat is temporarily unavailable. Check the deployed API key and model environment variables.
          </p>
        ) : null}
        <p className="footnote">{profileContent.chat.disclaimer}</p>
      </form>
    </section>
  );

  if (isEmbedded) {
    return frame;
  }

  return <main className="chat-page">{frame}</main>;
}

function MarkdownPreview({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h1" | "h2" | "h3";

          return (
            <Heading key={index}>{renderInlineMarkdown(block.text)}</Heading>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{renderInlineMarkdown(block.text)}</p>;
      })}
    </>
  );
}

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }

    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({ type: "list", items: listItems });
    listItems = [];
  }

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const listItem = /^[-*]\s+(.+)$/.exec(line);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2]
      });
      continue;
    }

    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1]);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.length > 0 ? blocks : [{ type: "paragraph", text }];
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);

    if (link && isSafePreviewLink(link[2])) {
      return (
        <a href={link[2]} key={index} rel="noreferrer" target="_blank">
          {link[1]}
        </a>
      );
    }

    return part.split("\n").flatMap((line, lineIndex, lines) => {
      if (lineIndex === lines.length - 1) {
        return line;
      }

      return [line, <br key={`${index}-${lineIndex}`} />];
    });
  });
}

function isSafePreviewLink(href: string) {
  return (
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:")
  );
}
