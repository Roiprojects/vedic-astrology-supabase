import yazl from "yazl";
import fs from "node:fs";
import path from "node:path";

const SOURCE = process.cwd();
const OUTPUT = path.join(process.cwd(), "vedic-astrology-deploy.zip");

const EXCLUDE = new Set([
  "node_modules", ".git", ".vercel",
  "android/.gradle", "android/app/build", "android/build",
  "ios/App/Pods", "ios/App/build", ".idea", ".vscode",
  "vedic-astrology-deploy.zip", "sample-report.pdf"
]);


const entries = [];

function walk(dir, base = "") {
  let items;
  try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const item of items) {
    const rel = base ? `${base}/${item.name}` : item.name;
    let skip = false;
    for (const ex of EXCLUDE) {
      if (rel === ex || rel.startsWith(ex + "/")) { skip = true; break; }
    }
    if (skip) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full, rel);
    } else if (item.isFile()) {
      try { entries.push({ zipPath: rel, fsPath: full }); } catch {}
    }
  }
}

walk(SOURCE);

if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);

const zip = new yazl.ZipFile();
const writeStream = fs.createWriteStream(OUTPUT);

for (const entry of entries) {
  zip.addFile(entry.fsPath, entry.zipPath);
}

zip.outputStream.pipe(writeStream);
zip.end();

await new Promise((resolve, reject) => {
  zip.outputStream.on("close", () => {
    const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\nDone: vedic-deploy.zip (${sizeMB} MB) - ${entries.length} files`);
    console.log(`Location: ${OUTPUT}`);
    resolve(null);
  });
  zip.outputStream.on("error", reject);
});
