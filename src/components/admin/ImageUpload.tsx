import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

export function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string | undefined | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
      const data = await res.json() as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>

      {value ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-gold/30 bg-overlay">
          <img src={value} alt="Uploaded" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-danger/40 bg-surface/90 px-3 py-1.5 text-xs font-medium text-danger backdrop-blur-sm transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-overlay py-8 text-sm text-muted transition-colors hover:border-gold/70 hover:text-ink disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><ImagePlus className="h-4 w-4" /> Upload image</>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
      />

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {value && (
        <p className="mt-1 truncate text-xs text-faint">{value}</p>
      )}
    </div>
  );
}
