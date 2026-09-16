import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_MS = 5 * 60 * 1000; // 5 minutes per service topic

function buildGreeting(serviceTitle: string | null): string {
  if (serviceTitle) {
    return `Namaste. I'm Guruji Assistant, focused on ${serviceTitle}. Ask me anything about this topic — I'll keep the conversation on this subject for 5 minutes.`;
  }
  return "Namaste. I'm Guruji Assistant. Ask me anything about Vedic astrology, services, homams, or birth charts. I'll chat with you for 5 minutes.";
}

function buildSuggestions(serviceTitle: string | null): string[] {
  if (serviceTitle) {
    return [
      `What does a ${serviceTitle.toLowerCase()} consultation include?`,
      `How does ${siteConfig.guruji} analyse ${serviceTitle.toLowerCase()}?`,
      `What details are needed for a ${serviceTitle.toLowerCase()} reading?`,
    ];
  }
  return [
    "Which service can guide me about my career?",
    "Which homam is recommended for obstacles?",
    "What details are needed for a birth chart?",
  ];
}

export function ServiceAiChat() {
  const [open, setOpen] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: buildGreeting(null) },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(SESSION_MS / 1000);
  const [sessionEnded, setSessionEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, sessionEnded]);

  // Reset conversation when the topic changes
  useEffect(() => {
    if (open) {
      setMessages([{ role: "assistant", content: buildGreeting(activeService) }]);
      setInput("");
      setSessionEnded(false);
      setSessionSecondsLeft(SESSION_MS / 1000);
      sessionStartRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeService, open]);

  // Opened from anywhere via window.dispatchEvent(new CustomEvent("open-guruji-ai", { detail: { serviceTitle } }))
  useEffect(() => {
    const openChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ serviceTitle?: string }>;
      const title = customEvent.detail?.serviceTitle;
      setActiveService(title ?? null);
      setOpen(true);
    };

    window.addEventListener("open-guruji-ai", openChat);
    return () => window.removeEventListener("open-guruji-ai", openChat);
  }, []);

  // 5-minute per-topic session timer
  useEffect(() => {
    if (!open) return;

    const start = sessionStartRef.current ?? Date.now();
    sessionStartRef.current = start;

    tickRef.current = setInterval(() => {
      const left = Math.max(0, SESSION_MS - (Date.now() - start));
      setSessionSecondsLeft(Math.ceil(left / 1000));
      if (left === 0) {
        setSessionEnded(true);
        if (tickRef.current) clearInterval(tickRef.current);
      }
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [open]);

  async function send(value: string) {
    const content = value.trim();
    if (!content || busy || sessionEnded) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const response = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: activeService ?? undefined,
          messages: history.filter(
            (message) =>
              message.content !== buildGreeting(null) &&
              !message.content.startsWith("Namaste. I'm Guruji Assistant")
          ),
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const part = await reader.read();
        done = part.done;
        if (!part.value) continue;
        const chunk = decoder.decode(part.value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + chunk,
          };
          return next;
        });
      }
    } catch (error) {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          role: "assistant",
          content: error instanceof Error ? error.message : "The assistant is unavailable right now.",
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  const suggestions = buildSuggestions(activeService);
  const minutes = Math.floor(sessionSecondsLeft / 60);
  const seconds = sessionSecondsLeft % 60;
  const timerLabel = sessionEnded
    ? "Session ended"
    : `Free chat · ${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <>
      {/* Persistent launcher — bottom-left on every page */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with Guruji"
          className="group fixed bottom-5 left-5 z-40 flex items-center gap-2.5 rounded-full border border-[#f2c55e]/50 bg-gradient-to-r from-[#c0451a] to-[#e07b1e] p-3.5 text-white shadow-[0_14px_40px_-10px_rgba(207,94,25,0.75)] transition-transform hover:scale-105 sm:bottom-6 sm:left-6"
        >
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#e07b1e] opacity-20" />
          <Sparkles className="relative h-6 w-6" />
          <span className="relative hidden pr-1 text-sm font-semibold sm:block">Chat with Guruji</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[76vh] max-h-[650px] flex-col overflow-hidden border border-[#d9ad55] bg-[#2d1424] text-[#f7e6bf] shadow-[0_35px_90px_-35px_rgba(45,16,32,.95)] sm:inset-x-auto sm:bottom-24 sm:left-6 sm:w-[410px]"
          >
            <header className="flex items-center justify-between border-b border-[#d5aa50]/25 bg-[#391829] px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={siteConfig.gurujiPortrait}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-[#d7aa4c]"
                />
                <div>
                  <p className="font-serif text-lg text-[#ffe0a0]">Guruji Assistant</p>
                  <p className="text-[0.65rem] text-[#ead7ad]/60">
                    {activeService ? activeService : "Vedic astrology assistant"} · {timerLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-11 w-11 place-items-center text-[#f0d69d]"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" && "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "bg-[#cf5e19] text-white"
                        : "border border-[#d3a64d]/20 bg-white/[0.045] text-[#f4e4c2]"
                    )}
                  >
                    {message.content || <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
              ))}

              {messages.length === 1 && !sessionEnded &&
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="block w-full rounded-xl border border-[#d6a94e]/25 bg-white/[0.035] px-4 py-3 text-left text-xs text-[#ead9b5] hover:border-[#e0b75e]/55"
                  >
                    {suggestion}
                  </button>
                ))}

              {sessionEnded && (
                <div className="rounded-2xl border border-[#e1b656]/45 bg-[#3d1a2b] p-5 shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7b850]">
                    Session ended
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-[#ffe2a1]">
                    Continue with {siteConfig.guruji}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#ecdcb9]/80">
                    Your 5-minute chat on this topic is complete. For personal guidance on {activeService ?? "your concern"}, reach out to {siteConfig.guruji} directly.
                  </p>
                  <div className="mt-4 grid gap-2.5">
                    <a
                      href="/contact-us"
                      className="flex min-h-12 items-center justify-between rounded-xl border border-[#dbb25c]/50 bg-[#311523] px-4 text-sm font-semibold text-[#ffe0a0] transition-colors hover:border-[#f2c55e]"
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Book Consultation
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="/contact-us"
                      className="flex min-h-11 items-center justify-between rounded-xl border border-[#dbb25c]/25 px-4 text-xs text-[#ead9b5] transition-colors hover:bg-white/5"
                    >
                      <span>Book formal consultation</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionEnded(false);
                        setSessionSecondsLeft(SESSION_MS / 1000);
                        sessionStartRef.current = Date.now();
                        setMessages([{ role: "assistant", content: buildGreeting(activeService) }]);
                      }}
                      className="text-[0.65rem] uppercase tracking-[0.18em] text-[#e7b850] underline"
                    >
                      Start a new 5-minute chat
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!sessionEnded && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(input);
                }}
                className="border-t border-[#d6aa50]/25 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={
                      activeService
                        ? `Ask anything about ${activeService}…`
                        : "Ask about services, homams, or remedies…"
                    }
                    className="min-h-11 flex-1 rounded-full border border-[#d6aa50]/25 bg-white/[0.045] px-4 text-sm text-white outline-none placeholder:text-[#ead9b5]/40 focus:border-[#e4ba62]"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    aria-label="Send message"
                    className="grid h-11 w-11 place-items-center rounded-full bg-[#d5631c] text-white disabled:opacity-45"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1 text-[0.6rem] text-[#ead9b5]/50">
                  <ShieldCheck className="h-3 w-3" />
                  {siteConfig.disclaimer}
                </p>
              </form>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
