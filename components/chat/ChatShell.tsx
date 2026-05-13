"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChatErrorCode } from "@/lib/chat-errors";
import { getChatErrorMessage } from "@/lib/chat-ui";
import { CV_DATA } from "@/lib/cv-data";
import type { Locale } from "@/lib/locale";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "complete";
};

type ChatShellProps = {
  initialLocale: Locale;
};

const MAX_CHARS = 1200;
const BUBBLE_EASE = [0.22, 0.68, 0.2, 1] as const;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getNewPillLabel(locale: Locale) {
  return locale === "zh" ? "↓ 新消息" : "↓ New";
}

export default function ChatShell({ initialLocale }: ChatShellProps) {
  const reducedMotion = useReducedMotion();
  const [locale] = useState<Locale>(initialLocale);
  const data = useMemo(() => CV_DATA[locale], [locale]);
  const copy = data.chat;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastFailedContent, setLastFailedContent] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForFirstToken, setIsWaitingForFirstToken] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showNewPill, setShowNewPill] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const remaining = MAX_CHARS - input.length;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      bottomRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : behavior,
        block: "end",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom("smooth");
      return;
    }

    if (messages.length > 0 || isWaitingForFirstToken) {
      setShowNewPill(true);
    }
  }, [isWaitingForFirstToken, messages, scrollToBottom]);

  const handleMessageScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldPause = distanceFromBottom > 120;
    shouldAutoScrollRef.current = !shouldPause;
    setShowNewPill(shouldPause && (messages.length > 0 || isWaitingForFirstToken));
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    setLastFailedContent(null);
    setInput("");
    setIsSubmitting(false);
    setIsWaitingForFirstToken(false);
    setStreamingMessageId(null);
    setShowNewPill(false);
    shouldAutoScrollRef.current = true;
    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });
  };

  const readErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      return getChatErrorMessage(body.errorCode, data, body.error);
    } catch {
      return getChatErrorMessage(ChatErrorCode.MODEL_UNAVAILABLE, data);
    }
  };

  const appendAssistantMessage = (
    id: string,
    content: string,
    status: ChatMessage["status"],
  ) => {
    setMessages((current) => {
      if (current.some((message) => message.id === id)) {
        return current.map((message) =>
          message.id === id
            ? { ...message, content: message.content + content, status }
            : message,
        );
      }

      return [
        ...current,
        {
          id,
          role: "assistant",
          content,
          status,
        },
      ];
    });
  };

  const completeAssistantMessage = (id: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id && message.role === "assistant"
          ? { ...message, status: "complete" }
          : message,
      ),
    );
  };

  const sendMessage = async (content: string, options?: { appendUser?: boolean }) => {
    const shouldAppendUser = options?.appendUser ?? true;
    const userMessage = shouldAppendUser
      ? { id: createId(), role: "user" as const, content, status: "complete" as const }
      : null;
    const nextMessages = userMessage ? [...messages, userMessage] : messages;

    if (userMessage) {
      setMessages(nextMessages);
      setInput("");
    }

    setError(null);
    setLastFailedContent(null);
    setIsSubmitting(true);
    setIsWaitingForFirstToken(true);
    shouldAutoScrollRef.current = true;
    setShowNewPill(false);
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

      if (!response.ok) {
        setError(await readErrorMessage(response));
        setLastFailedContent(content);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      const assistantId = createId();

      if (contentType.includes("application/json")) {
        const body = await response.json();
        appendAssistantMessage(assistantId, body.message || "", "complete");
        return;
      }

      if (!response.body) {
        throw new Error("Chat stream missing response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let hasReceivedToken = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const token = decoder.decode(value, { stream: true });
        if (!token) continue;

        if (!hasReceivedToken) {
          hasReceivedToken = true;
          setIsWaitingForFirstToken(false);
          setStreamingMessageId(assistantId);
        }

        appendAssistantMessage(assistantId, token, "streaming");
      }

      completeAssistantMessage(assistantId);
      setStreamingMessageId(null);
    } catch {
      setError(getChatErrorMessage(ChatErrorCode.MODEL_UNAVAILABLE, data));
      setLastFailedContent(content);
    } finally {
      setIsSubmitting(false);
      setIsWaitingForFirstToken(false);
      setStreamingMessageId(null);
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

  const jumpToNewMessages = () => {
    shouldAutoScrollRef.current = true;
    setShowNewPill(false);
    scrollToBottom("smooth");
  };

  const homepageHref = locale === "zh" ? "/?lang=zh" : "/";
  const showCharacterCount = remaining <= 200;
  const isEmptyChat = messages.length === 0 && !isSubmitting;

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

          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollContainerRef}
              className="chat-scroll-area h-full overflow-y-auto p-5 md:p-6"
              aria-live="polite"
              aria-relevant="additions text"
              onScroll={handleMessageScroll}
            >
              {isEmptyChat ? (
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
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";
                    const isStreaming = message.id === streamingMessageId;

                    return (
                      <motion.article
                        key={message.id}
                        aria-label={`${isUser ? copy.visitor : copy.assistant}: ${message.content}`}
                        className={`max-w-[88%] rounded-[0.5rem] border p-4 text-sm leading-6 ${
                          isUser
                            ? "ml-auto border-[rgba(201,154,62,0.42)] bg-[rgba(201,154,62,0.16)] text-[color:var(--color-text-strong)]"
                            : "border-[color:var(--color-border)] bg-[rgba(244,234,216,0.035)]"
                        }`}
                        initial={
                          reducedMotion
                            ? false
                            : { opacity: 0, x: isUser ? 18 : -14, y: 4 }
                        }
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{
                          duration: 0.32,
                          delay: reducedMotion ? 0 : Math.min(index * 0.045, 0.22),
                          ease: BUBBLE_EASE,
                        }}
                      >
                        <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                          {isUser ? copy.visitor : copy.assistant}
                        </div>
                        <motion.p
                          className="whitespace-pre-wrap"
                          animate={{ opacity: message.status === "complete" ? 1 : 0.94 }}
                          transition={{ duration: reducedMotion ? 0 : 0.22 }}
                        >
                          {message.content}
                          {isStreaming && (
                            <span className="chat-stream-cursor" aria-hidden>
                              |
                            </span>
                          )}
                        </motion.p>
                      </motion.article>
                    );
                  })}

                  <AnimatePresence>
                    {isWaitingForFirstToken && (
                      <motion.article
                        aria-label={copy.replying}
                        className="max-w-[88%] rounded-[0.5rem] border border-[color:var(--color-border)] bg-[rgba(244,234,216,0.035)] p-4 text-sm leading-6"
                        initial={reducedMotion ? false : { opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reducedMotion ? {} : { opacity: 0, x: -6 }}
                        transition={{ duration: 0.24, ease: BUBBLE_EASE }}
                      >
                        <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                          {copy.assistant}
                        </div>
                        <span className="sr-only">{copy.replying}</span>
                        <span className="chat-typing-dots" aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                      </motion.article>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <AnimatePresence>
              {showNewPill && (
                <motion.button
                  type="button"
                  className="focus-ring absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[rgba(225,189,104,0.42)] bg-[rgba(17,16,13,0.92)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-accent-strong)] shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur"
                  onClick={jumpToNewMessages}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? {} : { opacity: 0, y: 6 }}
                >
                  {getNewPillLabel(locale)}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                className="mx-5 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[0.5rem] border border-[rgba(240,113,103,0.38)] bg-[rgba(240,113,103,0.1)] p-3 text-sm text-[color:var(--color-text-strong)] md:mx-6"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: 6 }}
              >
                <span>{error}</span>
                {lastFailedContent && (
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[rgba(244,234,216,0.16)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-strong)]"
                    onClick={() => void sendMessage(lastFailedContent, { appendUser: false })}
                    disabled={isSubmitting}
                  >
                    <RotateCcw size={12} />
                    {copy.reset === "Reset" ? "Retry" : "重试"}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
                className={`focus-ring min-h-[3.5rem] resize-none rounded-[0.5rem] border border-[color:var(--color-border)] bg-[rgba(8,8,7,0.72)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-strong)] placeholder:text-[color:var(--color-text-muted)] ${
                  isEmptyChat ? "chat-input--pulse" : ""
                }`}
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
