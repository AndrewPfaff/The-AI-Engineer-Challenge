"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChatApiError, sendChatMessage } from "@/utils/chat";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isSending]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const reply = await sendChatMessage(trimmed);
      setMessages((current) => [
        ...current,
        { id: createId(), role: "assistant", content: reply },
      ]);
    } catch (caught) {
      const apiError = caught as ChatApiError;
      setError(apiError.message || "Something went wrong. Try another message.");
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-canvas/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
              Mental coach
            </p>
            <h1 className="font-serif text-3xl tracking-tight text-ink">Steady</h1>
          </div>
          <p className="max-w-xs text-right text-sm leading-5 text-muted">
            A quiet place to think out loud — stress, habits, confidence, and the next small step.
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-5 py-8"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={(prompt) => setDraft(prompt)} />
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-2xl bg-ink px-4 py-3 text-canvas shadow-sm"
                  : "mr-auto w-fit max-w-[85%] rounded-2xl border border-line bg-white px-4 py-3 text-ink shadow-sm"
              }
            >
              <p className="mb-1 text-[11px] font-medium tracking-[0.14em] uppercase opacity-70">
                {message.role === "user" ? "You" : "Coach"}
              </p>
              <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>
            </article>
          ))
        )}

        {isSending ? (
          <article className="mr-auto w-fit rounded-2xl border border-line bg-white px-4 py-3 text-muted shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase">Coach</p>
            <p className="mt-1 text-sm">Listening…</p>
          </article>
        ) : null}
      </div>

      <div className="border-t border-line bg-white/80 px-5 py-4 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-end gap-3 rounded-2xl border border-line bg-canvas p-2 shadow-[0_1px_0_rgba(22,20,28,0.04)]">
            <label htmlFor="message" className="sr-only">
              Message your coach
            </label>
            <textarea
              id="message"
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What’s on your mind?"
              disabled={isSending}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-ink outline-none placeholder:text-muted/80 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              {isSending ? "Sending" : "Send"}
            </button>
          </div>
          <p className="px-1 text-xs text-muted">Enter to send · Shift+Enter for a new line</p>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const prompts = [
    "I have been putting something off and I am not sure why.",
    "Help me reset after a stressful morning.",
    "I want a tiny habit I can keep this week.",
  ];

  return (
    <div className="mt-10 rounded-3xl border border-line bg-white p-8 shadow-sm">
      <p className="font-serif text-3xl leading-tight text-ink">Start wherever you are.</p>
      <p className="mt-3 max-w-lg text-[15px] leading-6 text-muted">
        This chat talks to the FastAPI coach at <code className="text-ink">POST /api/chat</code>.
        No need to have it all figured out — pick a thread or write your own.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-xl border border-line bg-canvas px-4 py-3 text-left text-sm text-ink transition hover:border-accent/40 hover:bg-white"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
