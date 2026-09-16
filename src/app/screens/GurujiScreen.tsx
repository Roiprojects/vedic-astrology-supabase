import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Mic, Send, Share2, Sparkles, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAppUser } from "@/hooks/useAppUser";
import { siteConfig } from "@/lib/site";
import { AppButton, Chip, HScroll, IconButton } from "@/app/components/AppUI";

const TOPICS = ["Career", "Marriage", "Dosha", "Remedies", "Muhurat", "Kundli"];
const SUGGESTIONS = [
  "What does my Moon sign suggest today?",
  "Which homam helps with obstacles?",
  "How should I prepare for a consultation?",
  "What birth details are needed for a kundli?",
];

export function GurujiScreen() {
  const navigate = useNavigate();
  const { profile, chatHistory, setChatHistory, saveInsight } = useAppUser();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useMemo(
    () =>
      chatHistory.length
        ? chatHistory
        : [
            {
              role: "assistant" as const,
              content:
                "Namaste. I am Guruji Assistant. Ask about your chart, remedies, or today's sky. For a personal reading I will guide you to a human consultation.",
            },
          ],
    [chatHistory]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(value: string) {
    const content = value.trim();
    if (!content || busy) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content }];
    await setChatHistory([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const response = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          birthProfile: profile.birth,
        }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Guruji Assistant is unavailable right now.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        acc += decoder.decode(part.value, { stream: true });
        await setChatHistory([...history, { role: "assistant", content: acc }]);
      }
    } catch (err) {
      await setChatHistory([
        ...history,
        { role: "assistant", content: err instanceof Error ? err.message : "Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function startVoice() {
    const Speech =
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ||
      (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!Speech) {
      setListening(true);
      window.setTimeout(() => setListening(false), 1200);
      return;
    }
    const rec = new Speech();
    rec.lang = "en-IN";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="mx-auto flex w-full max-w-lg items-center justify-between border-b border-[#D6AE57]/12 px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="app-back"
        >
          ← Close
        </button>
        <div className="flex flex-col items-center">
          <p className="font-display text-[0.68rem] tracking-[0.28em] text-[#D6AE57]">ASK GURUJI</p>
          <p className="text-[0.55rem] tracking-[0.14em] text-[#F3D899]/40">VEDIC ASSISTANT</p>
        </div>
        <IconButton aria-label="Clear chat" onClick={() => void setChatHistory([])}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div ref={scrollRef} className="mx-auto min-h-0 w-full max-w-lg flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        <HScroll>
          {TOPICS.map((t) => (
            <Chip key={t} onClick={() => void send(`Guide me about ${t.toLowerCase()}.`)}>
              {t}
            </Chip>
          ))}
        </HScroll>
        {messages.map((m, i) => (
          <article
            key={`${m.role}-${i}`}
            className={
              m.role === "user"
                ? "ml-10 rounded-3xl bg-[#D6AE57] px-4 py-3 text-sm text-[#080A18]"
                : "mr-6 rounded-3xl border border-[#D6AE57]/20 bg-[#11152F] px-4 py-3 text-sm leading-relaxed text-[#FFF9EE]"
            }
          >
            {m.content || (busy && i === messages.length - 1 ? "✦" : "")}
            {busy && i === messages.length - 1 && m.role === "assistant" && (
              <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-[#D6AE57]" />
            )}
          </article>
        ))}
        {messages.length < 3 && (
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="block min-h-12 w-full rounded-2xl border border-dashed border-[#D6AE57]/25 px-3 py-3 text-left text-xs text-[#F3D899]/80"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-lg px-4">
        <div className="mb-2 grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)] gap-2">
          <IconButton
            aria-label="Save insight"
            onClick={() => void saveInsight({ title: "Guruji insight", body: lastAssistant })}
          >
            <Bookmark className="h-4 w-4" />
          </IconButton>
          <IconButton
            aria-label="Share insight"
            onClick={async () => {
              if (navigator.share) await navigator.share({ title: "Vedic Astrology", text: lastAssistant });
            }}
          >
            <Share2 className="h-4 w-4" />
          </IconButton>
          <AppButton
            variant="ghost"
            className="app-btn-sm"
            onClick={() => navigate("/app/consult")}
          >
            Human astrologer
          </AppButton>
        </div>

        <form
          className="app-composer pb-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <IconButton type="button" onClick={startVoice} aria-label="Voice input">
            <Mic className={listening ? "h-4 w-4 text-[#D6AE57]" : "h-4 w-4"} />
          </IconButton>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Guruji…"
          />
          <button
            type="submit"
            disabled={busy}
            className="app-icon-btn bg-gradient-to-b from-[#F3D899] to-[#D6AE57] text-[#080A18]"
            aria-label="Send"
          >
            {busy ? <Sparkles className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <p className="px-1 pb-3 text-center text-[0.6rem] leading-relaxed text-[#F3D899]/40">
          {siteConfig.disclaimer}
        </p>
      </div>
    </div>
  );
}

type SpeechRecognition = {
  lang: string;
  start: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEvent = { results: { 0: { 0: { transcript: string } } } };
