"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { ChatErrorCode } from "@/lib/chat-errors";
import { getChatErrorMessage } from "@/lib/chat-ui";
import { CV_DATA } from "@/lib/cv-data";
import type { Locale } from "@/lib/locale";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatShellProps = {
  initialLocale: Locale;
};

const MAX_CHARS = 1200;

function createId() {
  return crypto.randomUUID();
}

export default function ChatShell({ initialLocale }: ChatShellProps) {
  const [locale] = useState<Locale>(initialLocale);
  const data = useMemo(() => CV_DATA[locale], [locale]);
  const copy = data.chat;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = MAX_CHARS - input.length;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    setInput("");
    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });
  };

  const sendMessage = async (content: string) => {
    const nextMessages = [...messages, { id: createId(), role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSubmitting(true);
    requestAnimationFrame(resizeTextarea);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(getChatErrorMessage(body.errorCode, data, body.error));
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: body.message,
        },
      ]);
    } catch {
      setError(getChatErrorMessage(ChatErrorCode.MODEL_UNAVAILABLE, data));
    } finally {
      setIsSubmitting(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSubmitting) return;
    await sendMessage(content);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const homepageHref = locale === "zh" ? "/?lang=zh" : "/";
  const showCharacterCount = remaining <= 200;

  return (
    <main
      id="main-content"
      data-chat-ready={isHydrated ? "true" : "false"}
      className="cv-container relative min-h-screen py-8 md:py-12"
    >
      <div className="page-grain" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={homepageHref} className="cv-cta cv-cta--ghost focus-ring text-sm">
            <ArrowLeft size={16} />
            {copy.backHome}
          </Link>
          <button
            type="button"
            className="cv-cta focus-ring text-sm"
            onClick={resetChat}
            disabled={messages.length === 0 && !error && !input}
          >
            <RotateCcw size={15} />
            {copy.reset}
          </button>
        </header>

        <section className="cv-section-panel flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] p-5 md:p-6">
            <div className="cv-badge cv-badge--accent">
              <Sparkles size={14} />
              {copy.eyebrow}
            </div>
            <h1 className="cv-heading-lg mt-4">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-text-muted)]">
              {copy.welcomeBody}
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-5 md:p-6"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.length === 0 && !isSubmitting ? (
              <div className="grid gap-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                    {copy.ready}
                  </p>
                  <h2 className="cv-heading-sm mt-3">{copy.welcomeTitle}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {copy.starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="focus-ring rounded-[0.5rem] border border-[color:var(--color-border)] bg-[rgba(244,234,216,0.03)] p-4 text-left text-sm leading-6 text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]"
                      onClick={() => {
                        setInput(prompt);
                        requestAnimationFrame(() => {
                          resizeTextarea();
                          textareaRef.current?.focus();
                        });
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    aria-label={`${message.role === "user" ? copy.visitor : copy.assistant}: ${message.content}`}
                    className={`max-w-[88%] rounded-[0.5rem] border p-4 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto border-[rgba(201,154,62,0.42)] bg-[rgba(201,154,62,0.16)] text-[color:var(--color-text-strong)]"
                        : "border-[color:var(--color-border)] bg-[rgba(244,234,216,0.035)]"
                    }`}
                  >
                    <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      {message.role === "user" ? copy.visitor : copy.assistant}
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </article>
                ))}
                {isSubmitting && (
                  <article
                    aria-label={copy.replying}
                    className="max-w-[88%] rounded-[0.5rem] border border-[color:var(--color-border)] bg-[rgba(244,234,216,0.035)] p-4 text-sm leading-6"
                  >
                    <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      {copy.assistant}
                    </div>
                    <span>{copy.replying}</span>
                    <span className="chat-stream-cursor" aria-hidden>
                      ▍
                    </span>
                  </article>
                )}
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mx-5 mb-4 rounded-[0.5rem] border border-[rgba(240,113,103,0.38)] bg-[rgba(240,113,103,0.1)] p-3 text-sm text-[color:var(--color-text-strong)] md:mx-6"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="border-t border-[color:var(--color-border)] p-4 md:p-5"
          >
            <label className="sr-only" htmlFor="chat-message">
              {copy.placeholder}
            </label>
            <div className="grid gap-3">
              <textarea
                id="chat-message"
                ref={textareaRef}
                value={input}
                maxLength={MAX_CHARS}
                placeholder={copy.placeholder}
                title={copy.shiftEnterTooltip}
                onChange={(event) => {
                  setInput(event.target.value);
                  resizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                className="focus-ring min-h-[3.5rem] resize-none rounded-[0.5rem] border border-[color:var(--color-border)] bg-[rgba(8,8,7,0.72)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-strong)] placeholder:text-[color:var(--color-text-muted)]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[color:var(--color-text-muted)]" aria-live="polite">
                  {showCharacterCount ? copy.characterCount(remaining) : copy.shiftEnterTooltip}
                </div>
                <button
                  type="submit"
                  className="cv-cta cv-cta-primary focus-ring text-sm"
                  disabled={!input.trim() || isSubmitting}
                >
                  {copy.send}
                  <SendHorizontal size={15} />
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
