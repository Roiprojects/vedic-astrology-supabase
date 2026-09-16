import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/lib/site";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <Helmet>
        <title>Admin Login — {siteConfig.name}</title>
      </Helmet>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo href={null} showText={false} size={64} />
          <h1 className="mt-5 font-serif text-2xl text-ink">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your site</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-gold/25 bg-surface/70 p-6 sm:p-8">
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <div className="relative mb-4">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="email"
              type="email"
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-overlay px-10 py-2.5 text-sm text-ink outline-none focus:border-gold/70"
              placeholder="admin@example.com"
            />
          </div>

          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-overlay px-10 py-2.5 text-sm text-ink outline-none focus:border-gold/70"
              placeholder="Enter admin password"
            />
          </div>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
