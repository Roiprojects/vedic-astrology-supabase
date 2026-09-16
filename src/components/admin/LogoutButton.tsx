import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function LogoutButton() {
  const navigate = useNavigate();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    navigate("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
