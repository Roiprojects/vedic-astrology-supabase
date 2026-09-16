import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "@capacitor/camera";
import { CameraResultType, CameraSource } from "@capacitor/camera";
import { apiFetch } from "@/lib/api";
import { isNativePlatform } from "@/lib/platform";
import { useAppUser } from "@/hooks/useAppUser";
import { AppButton, Screen } from "@/app/components/AppUI";

type Phase = "guide" | "permission" | "scan" | "analysis" | "results" | "denied";

export function PalmReaderScreen() {
  const navigate = useNavigate();
  const { profile } = useAppUser();
  const [phase, setPhase] = useState<Phase>("guide");
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function capture() {
    setError("");
    try {
      if (isNativePlatform()) {
        setPhase("permission");
        const photo = await Camera.getPhoto({
          quality: 80,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        if (!photo.dataUrl) throw new Error("No image captured.");
        setPreview(photo.dataUrl);
        await analyze(photo.dataUrl);
        return;
      }
      fileRef.current?.click();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera unavailable";
      if (/denied|permission|restricted/i.test(msg)) setPhase("denied");
      else {
        setError(msg);
        setPhase("guide");
      }
    }
  }

  async function analyze(dataUrl: string) {
    setPhase("scan");
    await new Promise((r) => setTimeout(r, 700));
    setPhase("analysis");
    const base64 = dataUrl.split(",")[1] || "";
    const mediaType = dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    const res = await apiFetch("/api/palm-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: base64,
        mediaType,
        name: profile.name,
        question: "Read life, heart, head, fate lines and mounts.",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Could not read the palm.");
    setReading(data.reading);
    setPhase("results");
  }

  return (
    <Screen>
      <button type="button" onClick={() => navigate(-1)} className="app-back">
        Close
      </button>
      <h1 className="app-title mt-3">Palm Reader</h1>
      <p className="app-sub">Open palm · even light · fingers relaxed</p>

      <div className="relative mx-auto mt-6 aspect-[3/4] max-w-sm overflow-hidden rounded-[2.2rem] border border-[#D6AE57]/30 bg-[#11152F]">
        {preview ? (
          <img src={preview} alt="Palm" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="h-64 w-40 rounded-[40%] border-2 border-dashed border-[#D6AE57]/50" />
          </div>
        )}
        {phase === "scan" && <div className="va-scan absolute inset-x-6 top-8 h-1 bg-[#D6AE57]" />}
      </div>

      {phase === "guide" && (
        <AppButton block className="mt-6" onClick={() => void capture()}>
          Open palm reader
        </AppButton>
      )}
      {phase === "permission" && <p className="mt-4 text-center text-sm">Requesting camera…</p>}
      {phase === "denied" && (
        <div className="app-card mt-4 p-4 text-sm">
          Camera access is off. You can enable it in system settings, or upload a photo instead.
          <AppButton variant="ghost" block className="mt-3" onClick={() => fileRef.current?.click()}>
            Upload a photo
          </AppButton>
        </div>
      )}
      {phase === "analysis" && <p className="mt-4 text-center text-sm">Reading life, heart, head, fate lines and mounts…</p>}
      {error && <p className="mt-3 text-sm text-[#e5484d]">{error}</p>}
      {phase === "results" && (
        <div className="app-card-ivory mt-5 space-y-2 p-5 text-sm leading-relaxed">
          {reading
            .split("\n")
            .filter(Boolean)
            .map((line) => (
              <p key={line}>{line}</p>
            ))}
          <AppButton
            variant="primary"
            block
            className="mt-3"
            onClick={() => navigate("/app/guruji")}
          >
            Ask Guruji
          </AppButton>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const url = reader.result as string;
            setPreview(url);
            void analyze(url).catch((err) => {
              setError(err instanceof Error ? err.message : "Reading failed");
              setPhase("guide");
            });
          };
          reader.readAsDataURL(file);
        }}
      />
    </Screen>
  );
}
