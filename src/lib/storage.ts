import { Preferences } from "@capacitor/preferences";
import { isNativePlatform } from "./platform";

async function nativeGet(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value;
}

async function nativeSet(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

async function nativeRemove(key: string): Promise<void> {
  await Preferences.remove({ key });
}

function webGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

function webRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function storageGet(key: string): Promise<string | null> {
  if (isNativePlatform()) {
    try {
      return await nativeGet(key);
    } catch {
      return webGet(key);
    }
  }
  return webGet(key);
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      await nativeSet(key, value);
      return;
    } catch {
      webSet(key, value);
      return;
    }
  }
  webSet(key, value);
}

export async function storageRemove(key: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      await nativeRemove(key);
      return;
    } catch {
      webRemove(key);
      return;
    }
  }
  webRemove(key);
}

export async function storageGetJson<T>(key: string): Promise<T | null> {
  const raw = await storageGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSetJson(key: string, value: unknown): Promise<void> {
  await storageSet(key, JSON.stringify(value));
}
