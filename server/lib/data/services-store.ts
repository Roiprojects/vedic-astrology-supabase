/**
 * File-backed store for the Services section so the admin panel can edit content
 * and have it persist across requests/restarts (local + Node runtime).
 *
 * Reads from `content/services.json` when present; otherwise falls back to the
 * bundled seed array. The first admin save materialises the JSON file. This is
 * the single place to swap to Supabase later — the public accessors in
 * `lib/data/index.ts` call these functions and never touch storage directly.
 *
 * NOTE: this uses the Node filesystem, so it must only be imported by server
 * code (server components, route handlers). Never import it into a client
 * component.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { services as seedServices } from "../../../src/lib/data/services";
import type { Service } from "../../../src/lib/data/types";

const DATA_DIR = path.join(process.cwd(), "content");
const DATA_FILE = path.join(DATA_DIR, "services.json");

export async function readServicesRaw(): Promise<Service[]> {
  try {
    const buf = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(buf) as Service[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // File missing or unreadable — fall back to the seed data.
  }
  return seedServices;
}

export async function writeServicesRaw(list: Service[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}
