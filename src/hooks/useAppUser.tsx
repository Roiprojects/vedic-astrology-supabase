import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiFetch, apiBaseUrl } from "@/lib/api";
import { storageGetJson, storageSetJson, storageRemove } from "@/lib/storage";
import type { BirthDetails, CosmicChart } from "@/lib/cosmic";
import { computeCosmicChart } from "@/lib/cosmic";

const PROFILE_KEY = "va.cosmic.profile";
const ONBOARDING_KEY = "va.onboarding.complete";
const INSIGHTS_KEY = "va.saved.insights";
const CHAT_KEY = "va.guruji.history";
const USER_TOKEN_KEY = "va.user.token";
const SAVED_ASTROLOGERS_KEY = "va.saved.astrologers";
const CONSULT_HISTORY_KEY = "va.consult.history";

export type SavedInsight = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ConsultRecord = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  mode: "chat" | "call" | "book";
  status: "connecting" | "waiting" | "unavailable" | "confirmed" | "completed";
  createdAt: string;
};

export type AppProfile = {
  name: string;
  email?: string;
  phone?: string;
  birth: BirthDetails | null;
  chart: CosmicChart | null;
  onboardingComplete: boolean;
};

export type UserPlan = "free" | "star" | "cosmic";

type AppUserState = {
  loading: boolean;
  profile: AppProfile;
  userId: string | null;
  userToken: string | null;
  plan: UserPlan;
  insights: SavedInsight[];
  chatHistory: ChatTurn[];
  savedAstrologers: string[];
  consultHistory: ConsultRecord[];
  saveBirth: (details: BirthDetails) => Promise<void>;
  completeOnboarding: (details: BirthDetails) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveInsight: (insight: Omit<SavedInsight, "id" | "createdAt">) => Promise<void>;
  setChatHistory: (turns: ChatTurn[]) => Promise<void>;
  toggleSavedAstrologer: (id: string) => Promise<void>;
  addConsult: (record: Omit<ConsultRecord, "id" | "createdAt">) => Promise<void>;
};

const emptyProfile: AppProfile = {
  name: "",
  birth: null,
  chart: null,
  onboardingComplete: false,
};

const AppUserContext = createContext<AppUserState | null>(null);

async function persistProfileToServer(userId: string, profile: AppProfile) {
  const base = apiBaseUrl();
  const url = `${base}/api/user/app-profile`;
  await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: profile.name,
      email: profile.email,
      phone: profile.phone,
      birthName: profile.birth?.name || profile.name,
      dob: profile.birth?.dob || null,
      tob: profile.birth?.tob || null,
      pob: profile.birth?.pob || null,
      gender: profile.birth?.gender || null,
      language: profile.birth?.language || "English",
      intention: profile.birth?.intention || null,
      sunSign: profile.chart?.sunSign || null,
      moonSign: profile.chart?.moonSign || null,
      ascendant: profile.chart?.ascendant || null,
      nakshatra: profile.chart?.nakshatra || null,
      onboardingComplete: profile.onboardingComplete,
    }),
  }).catch(() => {});
}

export function AppUserProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [plan, setPlan] = useState<UserPlan>("free");
  const [profile, setProfile] = useState<AppProfile>(emptyProfile);
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [chatHistory, setChatHistoryState] = useState<ChatTurn[]>([]);
  const [savedAstrologers, setSavedAstrologers] = useState<string[]>([]);
  const [consultHistory, setConsultHistory] = useState<ConsultRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await storageGetJson<AppProfile>(PROFILE_KEY);
      const insightsStored = (await storageGetJson<SavedInsight[]>(INSIGHTS_KEY)) ?? [];
      const chatStored = (await storageGetJson<ChatTurn[]>(CHAT_KEY)) ?? [];
      const saved = (await storageGetJson<string[]>(SAVED_ASTROLOGERS_KEY)) ?? [];
      const consults = (await storageGetJson<ConsultRecord[]>(CONSULT_HISTORY_KEY)) ?? [];
      if (!cancelled && stored) setProfile(stored);
      if (!cancelled) {
        setInsights(insightsStored);
        setChatHistoryState(chatStored);
        setSavedAstrologers(saved);
        setConsultHistory(consults);
      }

      const token = await storageGetJson<string>(USER_TOKEN_KEY);
      if (token && !cancelled) {
        setUserToken(token);
        try {
          const response = await fetch(`${apiBaseUrl()}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 401 || response.status === 404) {
            await storageRemove(USER_TOKEN_KEY);
            if (!cancelled) setUserToken(null);
          } else {
            if (!response.ok) throw new Error(`Session request failed (${response.status})`);
            const me = await response.json() as { ok: boolean; user?: { id: number; email: string; name: string | null; plan: string } };
            if (me.ok && me.user && !cancelled) {
              setUserId(String(me.user.id));
              setPlan((me.user.plan as UserPlan) || "free");
              const next: AppProfile = {
                ...((await storageGetJson<AppProfile>(PROFILE_KEY)) ?? emptyProfile),
                name: me.user.name || stored?.name || "",
                email: me.user.email,
              };
              setProfile(next);
              await storageSetJson(PROFILE_KEY, next);
            }
          }
        } catch {
          // Preserve token across transient network and server failures.
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback(async (next: AppProfile) => {
    setProfile(next);
    await storageSetJson(PROFILE_KEY, next);
    await storageSetJson(ONBOARDING_KEY, next.onboardingComplete);
    if (userId) await persistProfileToServer(userId, next);
  }, [userId]);

  const saveBirth = useCallback(
    async (details: BirthDetails) => {
      const chart = computeCosmicChart(details);
      await persist({
        ...profile,
        name: details.name || profile.name,
        birth: details,
        chart,
      });
    },
    [persist, profile]
  );

  const completeOnboarding = useCallback(
    async (details: BirthDetails) => {
      const chart = computeCosmicChart(details);
      await persist({
        name: details.name,
        email: profile.email,
        phone: profile.phone,
        birth: details,
        chart,
        onboardingComplete: true,
      });
    },
    [persist, profile.email, profile.phone]
  );

  const sendOtp = useCallback(async (email: string) => {
    const res = await fetch(`${apiBaseUrl()}/api/user/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) throw new Error(data.error || "Failed to send OTP");
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string, name?: string) => {
    const res = await fetch(`${apiBaseUrl()}/api/user/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, name }),
    });
    const data = (await res.json()) as { ok: boolean; token?: string; user?: { id: number; email: string; name: string | null; plan: string }; error?: string };
    if (!data.ok || !data.token) throw new Error(data.error || "Verification failed");
    await storageSetJson(USER_TOKEN_KEY, data.token);
    setUserToken(data.token);
    if (data.user) {
      setUserId(String(data.user.id));
      setPlan((data.user.plan as UserPlan) || "free");
      const next: AppProfile = { ...profile, name: data.user.name || profile.name, email: data.user.email };
      await persist(next);
    }
  }, [profile, persist]);

  const signOut = useCallback(async () => {
    await storageRemove(USER_TOKEN_KEY);
    setUserToken(null);
    setUserId(null);
    setPlan("free");
  }, []);

  const saveInsight = useCallback(async (insight: Omit<SavedInsight, "id" | "createdAt">) => {
    const item: SavedInsight = {
      ...insight,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...insights].slice(0, 80);
    setInsights(next);
    await storageSetJson(INSIGHTS_KEY, next);
  }, [insights]);

  const setChatHistory = useCallback(async (turns: ChatTurn[]) => {
    setChatHistoryState(turns);
    await storageSetJson(CHAT_KEY, turns);
  }, []);

  const toggleSavedAstrologer = useCallback(async (id: string) => {
    const next = savedAstrologers.includes(id)
      ? savedAstrologers.filter((x) => x !== id)
      : [...savedAstrologers, id];
    setSavedAstrologers(next);
    await storageSetJson(SAVED_ASTROLOGERS_KEY, next);
  }, [savedAstrologers]);

  const addConsult = useCallback(async (record: Omit<ConsultRecord, "id" | "createdAt">) => {
    const item: ConsultRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...consultHistory].slice(0, 50);
    setConsultHistory(next);
    await storageSetJson(CONSULT_HISTORY_KEY, next);
  }, [consultHistory]);

  const value = useMemo<AppUserState>(
    () => ({
      loading,
      profile,
      userId,
      userToken,
      plan,
      insights,
      chatHistory,
      savedAstrologers,
      consultHistory,
      saveBirth,
      completeOnboarding,
      sendOtp,
      verifyOtp,
      signOut,
      saveInsight,
      setChatHistory,
      toggleSavedAstrologer,
      addConsult,
    }),
    [
      loading, profile, userId, userToken, plan, insights, chatHistory,
      savedAstrologers, consultHistory, saveBirth, completeOnboarding,
      sendOtp, verifyOtp, signOut, saveInsight, setChatHistory,
      toggleSavedAstrologer, addConsult,
    ]
  );

  return <AppUserContext.Provider value={value}>{children}</AppUserContext.Provider>;
}

export function useAppUser() {
  const ctx = useContext(AppUserContext);
  if (!ctx) throw new Error("useAppUser must be used within AppUserProvider");
  return ctx;
}

export async function clearLocalAppData() {
  await storageRemove(PROFILE_KEY);
  await storageRemove(ONBOARDING_KEY);
  await storageRemove(INSIGHTS_KEY);
  await storageRemove(CHAT_KEY);
}
