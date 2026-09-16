import { useRef, useState } from "react";
import { Hand, Loader2, RefreshCw, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/forms/fields";
import { siteConfig } from "@/lib/site";
import { apiFetch } from "@/lib/api";

type Status = "idle" | "loading" | "done" | "error";

export function PalmReader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [reading, setReading] = useState<string>("");
  const [error, setError] = useState<string>("");

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      setStatus("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image under 5 MB.");
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setBase64(dataUrl.split(",")[1] ?? "");
      setMediaType(file.type);
      setError("");
      setStatus("idle");
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!base64 || !mediaType) {
      setError("Please upload a photo of your palm first.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    setReading("");
    try {
      const res = await apiFetch("/api/palm-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType, name, question }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not read the palm.");
      setReading(data.reading);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setPreview(null);
    setBase64(null);
    setMediaType(null);
    setReading("");
    setError("");
    setStatus("idle");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      {/* Upload / input */}
      <div className="rounded-3xl border border-gold/25 bg-surface/60 p-6 sm:p-8">
        <h3 className="font-serif text-2xl text-ink">Upload Your Palm</h3>
        <p className="mt-1 text-sm text-faint">
          A clear, well-lit photo of your open dominant hand works best.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group mt-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold/30 bg-overlay/40 transition-colors hover:border-gold/60"
        >
          {preview ? (
            <img src={preview} alt="Palm preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-faint">
              <Upload className="h-8 w-8 text-gold/70" />
              <span className="text-sm">Tap to upload a palm photo</span>
              <span className="text-xs">JPG / PNG / WebP · max 5 MB</span>
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="palm-name">Your Name (optional)</Label>
            <Input
              id="palm-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="palm-q">What would you like to know? (optional)</Label>
            <Textarea
              id="palm-q"
              placeholder="e.g. career direction, marriage, health…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            onClick={analyze}
            disabled={status === "loading"}
            className="flex-1"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Reading your palm…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Read My Palm
              </>
            )}
          </Button>
          {preview && (
            <Button variant="gold" size="lg" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
        {error && (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {/* Result */}
      <div className="rounded-3xl border border-gold/25 bg-surface/60 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Hand className="h-5 w-5 text-gold" />
          <h3 className="font-serif text-2xl text-ink">Your Palm Reading</h3>
        </div>

        {status === "done" && reading ? (
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
            {reading.split("\n").filter(Boolean).map((line, i) => {
              const isHeading = /^[0-9]?\.?\s?[A-Z][A-Za-z &—-]+$/.test(line.trim()) && line.length < 60;
              return isHeading ? (
                <h4 key={i} className="pt-2 font-serif text-base text-gold-light">
                  {line.replace(/^\d+\.\s*/, "")}
                </h4>
              ) : (
                <p key={i}>{line}</p>
              );
            })}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact-us" variant="primary" size="md">
                Book a Full Consultation
              </Button>
              <Button href="/contact-us" variant="gold" size="md">
                Contact Us
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-gold/10 bg-overlay/30 p-6 text-center">
            {status === "loading" ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p className="mt-3 text-sm text-muted">
                  Guruji&apos;s Assistant is studying the lines of your palm…
                </p>
              </>
            ) : (
              <>
                <Hand className="h-10 w-10 text-gold/40" />
                <p className="mt-3 text-sm text-faint">
                  Your personalized palm reading will appear here.
                </p>
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed text-faint">
          {siteConfig.disclaimer} Instant palm readings are for reflection and
          guidance and are not a substitute for a personal consultation.
        </p>
      </div>
    </div>
  );
}
