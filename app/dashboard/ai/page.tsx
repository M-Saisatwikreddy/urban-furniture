"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "What are my total sales?",
  "How much money do customers owe us?",
  "Which invoices are overdue?",
  "Which products are low in stock?",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm the Urban Furniture AI Assistant. I can help you understand sales, customer outstanding amounts, overdue invoices, and inventory.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(message?: string) {
    const text = (message ?? input).trim();

    if (!text || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `Sorry, I couldn't process your request. ${error.message}`
              : "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="flex min-h-[calc(100vh-220px)] flex-col">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
            ✦
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Assistant
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ask questions about your Urban Furniture business data.
            </p>
          </div>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* MESSAGES */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED QUESTIONS */}
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suggested questions
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 p-4"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about sales, invoices, customers, or inventory..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
