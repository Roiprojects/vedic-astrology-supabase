import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { BookingForm } from "@/components/forms/BookingForm";

interface Props {
  homamName: string;
  onClose: () => void;
}

export function HomamBookingModal({ homamName, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-t-3xl border border-gold/25 bg-[#fdf6e8] shadow-2xl sm:rounded-3xl">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#b67a1b]/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c9933a]/20 bg-gradient-to-r from-[#3b1224] to-[#55192f] px-6 py-4 sm:rounded-t-3xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd777]/70">Book Homam</p>
            <h2 className="mt-0.5 font-serif text-lg text-[#fff8e8]">{homamName}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[#fff2d0]/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:max-h-[75vh]">
          <BookingForm variant="homam" subject={homamName} />
        </div>
      </div>
    </div>
  );
}
