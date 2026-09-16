import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Namaste 🙏 I'm Guruji Assistant. Ask me anything about Vedic astrology — your rashi, doshas, remedies, homams, or life guidance.",
};

const SUGGESTIONS = [
  "What is my rashi if I'm a Leo?",
  "What is Manglik dosha?",
  "Which homam helps with career?",
];

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");

    const history = [...messages, { role: "user" as const, content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m !== GREETING),
        }),
      });

      if (!res.ok || !res.body) {
        let msg = "The assistant is unavailable right now.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          /* ignore */
        }
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: msg };
          return next;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = {
              role: "assistant",
              content: last.content + chunk,
            };
            return next;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask Guruji"
        className="group fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep p-3.5 text-[#1a0a04] shadow-[0_12px_40px_-8px_rgba(240,132,46,0.7)] transition-transform hover:scale-105 sm:bottom-6 sm:left-6"
      >
        <Sparkles className="h-6 w-6" />
        <span className="hidden pr-1 text-sm font-semibold sm:group-hover:block">
          Ask Guruji
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-3xl border border-gold/30 bg-overlay/95 backdrop-blur-xl shadow-[0_30px_70px_-28px_rgba(74,15,26,0.35)] sm:inset-x-auto sm:left-6 sm:bottom-24 sm:w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-gold/20 bg-gradient-to-r from-saffron/12 to-transparent px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-saffron to-ember text-lg ring-1 ring-gold/40">
                  🕉️
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Guruji Assistant</p>
                  <p className="flex items-center gap-1 text-[0.65rem] text-online">
                    <span className="h-1.5 w-1.5 rounded-full bg-online" /> Astrology assistant
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-gold-light"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-gradient-to-r from-saffron to-saffron-deep text-[#1a0a04]"
                        : "border border-gold/15 bg-surface/70 text-muted"
                    )}
                  >
                    {m.content || (
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    )}
                  </div>
                </div>
              ))}

              {messages.length <= 1 && (
                <div className="space-y-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="flex w-full items-center gap-2 rounded-xl border border-gold/15 bg-surface/40 px-3 py-2 text-left text-xs text-muted transition-colors hover:border-gold/40 hover:text-ink"
                    >
                      <Star className="h-3 w-3 shrink-0 text-gold" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-gold/20 p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your stars…"
                  className="flex-1 rounded-full border border-gold/20 bg-overlay/60 px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-gold/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-saffron to-gold-deep text-[#1a0a04] transition-opacity disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-center text-[0.6rem] text-faint">
                Guruji Assistant answers astrology questions only · guidance, not guarantees
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
