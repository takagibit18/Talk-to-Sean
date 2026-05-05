"use client";

import { useChat } from "@ai-sdk/react";
import { MessageCircle, Send, Sparkles, Square } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const starters = [
  "What kind of work does Sean do?",
  "What should I know before contacting Sean?",
  "Summarize Sean in a few sentences."
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
              "Hi, I am Sean's AI representative. Ask me about Sean's work, background, projects, collaboration style, or how to get in touch."
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
    <main className="page">
      <section className="chat-frame" aria-label="Talk to Sean chatbot">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <MessageCircle size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1>Talk to Sean</h1>
              <p>Public anonymous chat for visitors from Sean's personal homepage.</p>
            </div>
          </div>
          <div className="status-line" aria-live="polite">
            <span className="status-dot" aria-hidden="true" />
            {isBusy ? "Sean AI is replying" : "Ready for a new question"}
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
              aria-label="Message"
              maxLength={1600}
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder="Ask Sean something..."
              rows={2}
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
              The chat service is unavailable right now. Check the API key and model
              environment variables in Vercel.
            </p>
          ) : null}
          <p className="footnote">
            Public anonymous MVP. Conversations are not stored by this app, and answers
            are AI-generated from Sean-approved public profile data.
          </p>
        </form>
      </section>
    </main>
  );
}
