import { Link, useLocation } from "react-router-dom";
import { useAppUser } from "@/hooks/useAppUser";
import { astrologers } from "@/lib/astrologers";
import { registerPushNotifications } from "@/lib/push";
import { useState } from "react";
import { AppButton, BackLink, Screen } from "@/app/components/AppUI";

export function ProfileSubScreen() {
  const location = useLocation();
  const { profile, insights, savedAstrologers, consultHistory } = useAppUser();
  const key = location.pathname.split("/").pop();

  return (
    <Screen>
      <BackLink to="/app/profile">← Profile</BackLink>
      <h1 className="app-title mt-3">{titleFor(key)}</h1>
      <div className="mt-5 space-y-3 text-sm text-[#F3D899]/80">
        {key === "me" && (
          <>
            <Row k="Name" v={profile.name || "—"} />
            <Row k="Email" v={profile.email || "—"} />
            <Row k="Phone" v={profile.phone || "—"} />
          </>
        )}
        {key === "birth" && (
          <>
            <Row k="Date of birth" v={profile.birth?.dob || "—"} />
            <Row k="Time" v={profile.birth?.tob || "—"} />
            <Row k="Place" v={profile.birth?.pob || "—"} />
            <Row k="Gender" v={profile.birth?.gender || "—"} />
            <Row k="Language" v={profile.birth?.language || "English"} />
          </>
        )}
        {key === "saved" &&
          (savedAstrologers.length ? (
            savedAstrologers.map((id) => {
              const a = astrologers.find((x) => x.id === id);
              return a ? (
                <Link key={id} to={`/app/consult/${id}`} className="app-card block p-4">
                  {a.name}
                </Link>
              ) : null;
            })
          ) : (
            <p>No saved astrologers yet.</p>
          ))}
        {key === "history" &&
          (consultHistory.length ? (
            consultHistory.map((c) => (
              <div key={c.id} className="app-card p-4">
                <p>{c.astrologerName}</p>
                <p className="text-xs opacity-70">
                  {c.mode} · {c.status}
                </p>
              </div>
            ))
          ) : (
            <p>No consultations yet.</p>
          ))}
        {(key === "bookings" || key === "reports" || key === "payments") && (
          <p>These records appear here after a booking, report, or Razorpay payment is completed.</p>
        )}
        {key === "insights" &&
          (insights.length ? (
            insights.map((i) => (
              <article key={i.id} className="app-card p-4">
                <p className="font-medium text-[#FFF9EE]">{i.title}</p>
                <p className="mt-1 text-[#F3D899]/70">{i.body}</p>
              </article>
            ))
          ) : (
            <p>Save a Guruji insight to keep it here.</p>
          ))}
        {key === "notifications" && <NotificationPanel />}
        {key === "language" && (
          <p>Interface language follows your onboarding choice: {profile.birth?.language || "English"}.</p>
        )}
      </div>
    </Screen>
  );
}

function NotificationPanel() {
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-3">
      <p>
        Reminders for bookings, reports, daily horoscope, and payments can be enabled after FCM is connected. No sample
        alerts are invented.
      </p>
      <AppButton
        block
        onClick={async () => {
          const r = await registerPushNotifications();
          setMsg(r.granted ? "Device registered for future FCM topics." : r.error || "Not enabled.");
        }}
      >
        Enable notifications
      </AppButton>
      {msg && <p>{msg}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="app-card min-h-[4.25rem] p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#D6AE57]">{k}</p>
      <p className="mt-1 text-[#FFF9EE]">{v}</p>
    </div>
  );
}

function titleFor(key?: string) {
  const map: Record<string, string> = {
    me: "My Profile",
    birth: "Birth Details",
    saved: "Saved Astrologers",
    history: "Consultation History",
    bookings: "Bookings",
    reports: "Reports",
    insights: "Saved Insights",
    payments: "Payments",
    notifications: "Notifications",
    language: "Language",
  };
  return map[key || ""] || "Profile";
}
