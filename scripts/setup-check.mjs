import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const ENV_PATH = path.join(ROOT, ".env");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

const checks: { name: string; pass: boolean; detail: string }[] = [];

function check(name: string, condition: boolean, detail = "") {
  checks.push({ name, pass: condition, detail });
}

// --- .env file ---
const hasEnv = fs.existsSync(ENV_PATH);
check(".env file exists", hasEnv, hasEnv ? ENV_PATH : "MISSING — copy .env.example to .env and fill in values");

if (hasEnv) {
  const envContent = fs.readFileSync(ENV_PATH, "utf8");

  // Required secrets
  const reqVars = [
    "SUPABASE_URL", "SUPABASE_ANON_KEY",
    "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD",
    "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET",
    "DATABASE_URL",
    "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM",
    "VITE_SITE_URL", "VITE_WHATSAPP_NUMBER",
  ];
  for (const v of reqVars) {
    const has = envContent.includes(`${v}=`) && !envContent.match(new RegExp(`^${v}=\\s*#`, "m"));
    check(v, has, has ? "set" : "MISSING or commented out");
  }

  // Recommended
  const optVars = ["GEMINI_API_KEY", "GEMINI_MODEL", "FRONTEND_URL", "VITE_RAZORPAY_KEY_ID", "RAZORPAY_WEBHOOK_SECRET"];
  for (const v of optVars) {
    const has = envContent.includes(`${v}=`);
    check(v + " (recommended)", has, has ? "set" : "not set");
  }
}

// --- Uploads dir ---
check("public/uploads directory", fs.existsSync(UPLOADS_DIR), fs.existsSync(UPLOADS_DIR) ? UPLOADS_DIR : "MISSING — run: mkdir -p public/uploads");

// --- dist/ directory (built frontend) ---
const distDir = path.join(ROOT, "dist");
const hasDist = fs.existsSync(distDir) && fs.existsSync(path.join(distDir, "index.html"));
check("dist/ (built frontend)", hasDist, hasDist ? distDir : "MISSING — run: npm run build");

// --- Print report ---
let passCount = 0;
let failCount = 0;
console.log("\n========================================================");
console.log("  Pre-flight deployment check (Supabase variant)");
console.log("========================================================");
for (const c of checks) {
  const icon = c.pass ? "  OK  " : " FAIL ";
  console.log(`  ${icon}  ${c.name}${c.detail ? " — " + c.detail : ""}`);
  if (c.pass) passCount++; else failCount++;
}
console.log("--------------------------------------------------------");
console.log(`  Result: ${passCount} passed, ${failCount} failed`);
console.log("========================================================\n");

if (failCount > 0) {
  console.log("  Fix the FAIL items above before starting the server.");
  process.exit(1);
} else {
  console.log("  All checks passed. Run: npm start");
  process.exit(0);
}
