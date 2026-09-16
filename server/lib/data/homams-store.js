/**
 * File-backed store for the Homams section (mirrors services-store).
 * Reads from `content/homams.json` when present; otherwise falls back to the
 * bundled seed. Server-only (uses node:fs) — never import into a client component.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { homams as seedHomams } from "../../src/lib/data/homams";
const DATA_DIR = path.join(process.cwd(), "content");
const DATA_FILE = path.join(DATA_DIR, "homams.json");
export async function readHomamsRaw() {
    try {
        const buf = await fs.readFile(DATA_FILE, "utf8");
        const parsed = JSON.parse(buf);
        if (Array.isArray(parsed) && parsed.length > 0)
            return parsed;
    }
    catch {
        // File missing or unreadable — fall back to the seed data.
    }
    return seedHomams;
}
export async function writeHomamsRaw(list) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}
