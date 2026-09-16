/**
 * File-backed store for the three informational "service" pages
 * (Birth Chart PDF, Chat with Guruji, AI Palm Reader). Holds the editable hero
 * copy plus page-specific bits (price / includes / FAQs). Server-only — uses
 * node:fs for read/write. The type/config helpers (PAGE_CONFIG, isPageId,
 * allPageIds, pageDefaults) live in src/lib/data/pages-store.ts for client use.
 */
import fs from "node:fs/promises";
import path from "node:path";
const DATA_DIR = path.join(process.cwd(), "content");
const DATA_FILE = path.join(DATA_DIR, "pages.json");
async function readAll() {
    try {
        const buf = await fs.readFile(DATA_FILE, "utf8");
        const parsed = JSON.parse(buf);
        return parsed && typeof parsed === "object" ? parsed : {};
    }
    catch {
        return {};
    }
}
export async function readPageContent(id) {
    const all = await readAll();
    return { ...DEFAULTS[id], ...(all[id] ?? {}) };
}
export async function writePageContent(id, content) {
    const all = await readAll();
    all[id] = content;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, `${JSON.stringify(all, null, 2)}\n`, "utf8");
}
