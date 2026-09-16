import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppUser } from "@/hooks/useAppUser";
import { siteConfig } from "@/lib/site";
import { AppButton, AppLink, ButtonRow, Screen, ScreenTitle } from "@/app/components/AppUI";

const ITEMS = [
  { to: "/app/subscription", label: "Membership & Plans" },
  { to: "/app/profile/me", label: "My Profile" },
  { to: "/app/kundli", label: "My Cosmic Profile" },
  { to: "/app/profile/birth", label: "Birth Details" },
  { to: "/app/profile/saved", label: "Saved Astrologers" },
  { to: "/app/profile/history", label: "Consultation History" },
  { to: "/app/profile/bookings", label: "Bookings" },
  { to: "/app/profile/reports", label: "Reports" },
  { to: "/app/kundli", label: "Kundli" },
  { to: "/app/guruji", label: "Guruji Conversations" },
  { to: "/app/profile/insights", label: "Saved Insights" },
  { to: "/app/profile/payments", label: "Payments" },
  { to: "/app/profile/notifications", label: "Notifications" },
  { to: "/app/profile/language", label: "Language" },
  { to: "/privacy-policy", label: "Privacy" },
  { to: "/terms-and-conditions", label: "Legal" },
];

const PLAN_LABELS: Record<string, string> = { free: "Free", star: "Jyotish Star", cosmic: "Cosmic Divine" };

export function ProfileScreen() {
  const { profile, signOut, userId, plan } = useAppUser();
  const navigate = useNavigate();

  return (
    <Screen>
      <ScreenTitle kicker="Account" title="Profile" />
      <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-[#D6AE57]/22 bg-gradient-to-br from-[#16193e] to-[#11152F] p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#D6AE57]/10 blur-3xl" />
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[#D6AE57]/30 bg-gradient-to-b from-[#D6AE57]/15 to-[#080A18]/50 font-display text-2xl text-[#F3D899] shadow-[0_8px_20px_-8px_rgba(214,174,87,0.25)]">
            {(profile.name || "V").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-2xl text-[#FFF9EE]">{profile.name || "Guest"}</p>
            <p className="truncate text-sm text-[#F3D899]/65">{profile.email || "Local cosmic profile"}</p>
            <p className="mt-0.5 text-[0.65rem] text-[#F3D899]/40">
              {userId ? "Signed in" : "Saved on this device"}
              {" · "}
              <span className={plan !== "free" ? "text-[#D6AE57]" : ""}>{PLAN_LABELS[plan] ?? plan}</span>
            </p>
          </div>
        </div>
        <ButtonRow className="mt-4">
          <AppLink to="/app/auth" variant="primary">
            {userId ? "Account" : "Sign in"}
          </AppLink>
          <AppLink to="/app/onboarding" variant="ghost">
            Edit journey
          </AppLink>
        </ButtonRow>
      </div>

      <div className="app-list mt-4">
        {ITEMS.map((item) => (
          <Link key={item.label} to={item.to}>
            <span>{item.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#D6AE57]/70" />
          </Link>
        ))}
      </div>

      <AppButton
        variant="danger"
        block
        className="mt-6"
        onClick={async () => {
          await signOut();
          navigate("/app/auth");
        }}
      >
        Logout
      </AppButton>
      <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-[#F3D899]/40">{siteConfig.disclaimer}</p>
    </Screen>
  );
}
