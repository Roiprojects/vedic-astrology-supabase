import "dotenv/config"; // auto-loads .env (and .env.local fallback)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { query, testDatabaseConnection } from "./lib/db";
import { loadConfig } from "./lib/runtime-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..", "..");

// Auto-create uploads directory on startup
const uploadsDir = path.join(PROJECT_ROOT, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("[startup] Created uploads directory:", uploadsDir);
}

import { adminAuthMiddleware } from "./middleware/adminAuth";

// Auth
import authRoutes from "./routes/auth";

// Public routes
import publicServicesRoutes from "./routes/public/services";
import publicHomamsRoutes from "./routes/public/homams";
import publicAstrologersRoutes from "./routes/public/astrologers";
import publicPagesRoutes from "./routes/public/pages";
import publicTestimonialsRoutes from "./routes/public/testimonials";

// Existing public routes
import enquiryRoutes from "./routes/enquiry";
import razorpayRoutes from "./routes/razorpay";
import consultationRoutes from "./routes/consultation";
import userRoutes from "./routes/user";
import subscriptionRoutes from "./routes/subscriptions";

// Admin routes
import adminServicesRoutes from "./routes/admin/services";
import adminHomamsRoutes from "./routes/admin/homams";
import adminAstrologersRoutes from "./routes/admin/astrologers";
import adminPagesRoutes from "./routes/admin/pages";
import adminTestimonialsRoutes from "./routes/admin/testimonials";
import adminEnquiriesRoutes from "./routes/admin/enquiries";
import adminUploadRoutes from "./routes/admin/upload";
import adminSeedRoutes from "./routes/admin/seed";

const app = express();
const PORT = process.env.PORT || 3002;
app.set("trust proxy", 1);

const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "https://myvedicastrology.in",
  "https://www.myvedicastrology.in",
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({
  limit: "10mb",
  verify(req, _res, buffer) {
    if (req.originalUrl.startsWith("/api/subscriptions/webhook")) {
      (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    }
  },
}));

// Dynamic API responses must never be stored.
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "..", "public"), {
    maxAge: "1d",
  })
);
app.use(
  express.static(path.join(__dirname, "..", "dist"), {
    immutable: true,
    maxAge: "365d",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
      }
    },
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"), {
    maxAge: "1d",
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

// Auth
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", async (_req, res) => {
  let database: string;
  const settingValues = new Map<string, string>();
  try {
    const dbResult = await testDatabaseConnection();
    database = dbResult.success ? "ok" : "error";
    if (!dbResult.success) {
      console.error("[health] DB connection failed:", dbResult.error);
    }
    if (dbResult.success) {
      const settings = await query(
        "settings",
        "select",
        {
          in: ["key", ["jwt_secret", "admin_email", "admin_password", "razorpay_key_id", "razorpay_key_secret", "smtp_host", "smtp_user", "smtp_pass", "smtp_from"]],
        }
      );
      for (const row of settings.rows as { key: string; value: string }[]) settingValues.set(row.key, row.value);
    }
  } catch (err) {
    database = "error";
    console.error("[health] DB error:", err);
  }
  const configured = (value?: string) => {
    if (!value) return false;
    try {
      const parsed = JSON.parse(value) as unknown;
      return typeof parsed === "string" ? parsed.trim().length > 0 : Boolean(parsed);
    } catch {
      return value.trim().length > 0;
    }
  };
  const has = (envKey: string, settingKey: string) =>
    configured(process.env[envKey]) || configured(settingValues.get(settingKey));
  const config = {
    adminAuth: has("JWT_SECRET", "jwt_secret") && has("ADMIN_EMAIL", "admin_email") && has("ADMIN_PASSWORD", "admin_password"),
    razorpay: has("RAZORPAY_KEY_ID", "razorpay_key_id") && has("RAZORPAY_KEY_SECRET", "razorpay_key_secret"),
    smtp: has("SMTP_HOST", "smtp_host") && has("SMTP_USER", "smtp_user") && has("SMTP_PASS", "smtp_pass") && has("SMTP_FROM", "smtp_from"),
  };
  const ok = database === "ok" && Object.values(config).every(Boolean);
  return res.status(ok ? 200 : 503).json({
    ok,
    database,
    config,
    webhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    build: process.env.BUILD_ID || null,
  });
});

// AI routes
import aiChatRoutes from "./routes/ai-chat";
import aiPalmReadingRoutes from "./routes/ai-palm-reading";

// Public API
app.use("/api/public/services", publicServicesRoutes);
app.use("/api/public/homams", publicHomamsRoutes);
app.use("/api/public/astrologers", publicAstrologersRoutes);
app.use("/api/public/pages", publicPagesRoutes);
app.use("/api/public/testimonials", publicTestimonialsRoutes);

// Other public routes
app.use("/api/chat", aiChatRoutes);
app.use("/api/palm-reading", aiPalmReadingRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/consultation", consultationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Admin routes (all protected)
app.use("/api/admin/seed", adminAuthMiddleware, adminSeedRoutes);
app.use("/api/admin/services", adminAuthMiddleware, adminServicesRoutes);
app.use("/api/admin/homams", adminAuthMiddleware, adminHomamsRoutes);
app.use("/api/admin/astrologers", adminAuthMiddleware, adminAstrologersRoutes);
app.use("/api/admin/pages", adminAuthMiddleware, adminPagesRoutes);
app.use("/api/admin/testimonials", adminAuthMiddleware, adminTestimonialsRoutes);
app.use("/api/admin/enquiries", adminAuthMiddleware, adminEnquiriesRoutes);
app.use("/api/admin/upload", adminAuthMiddleware, adminUploadRoutes);

// 404 for unknown API paths
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// SPA fallback
app.get(/.*/, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// Load runtime config before accepting connections.
loadConfig()
  .then(async (cfg) => {
    const c = cfg;
    const missing: string[] = [];
    if (!c.JWT_SECRET) missing.push("JWT_SECRET (admin auth)");
    if (!c.ADMIN_EMAIL) missing.push("ADMIN_EMAIL (admin login)");
    if (!c.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD (admin login)");
    if (!c.RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID (payments)");
    if (!c.RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET (payments)");
    if (!process.env.SMTP_HOST && !process.env.SMTP_USER) missing.push("SMTP_* (email delivery)");
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) missing.push("GEMINI_API_KEY or OPENAI_API_KEY (AI chat)");

    const dbResult = await testDatabaseConnection();
    const dbOk = dbResult.success;

    console.log("\n========================================================");
    console.log(`  Server : http://0.0.0.0:${PORT}`);
    console.log(`  Database: ${dbOk ? "connected (" + dbResult.database + ")" : "DISCONNECTED — check SUPABASE_URL / DATABASE_URL"}`);
    console.log(`  Admin  : ${c.JWT_SECRET && c.ADMIN_EMAIL && c.ADMIN_PASSWORD ? "configured" : "MISSING — " + (missing.find(m => m.includes("JWT") || m.includes("ADMIN")) || "")}`);
    console.log(`  Razorpay: ${c.RAZORPAY_KEY_ID && c.RAZORPAY_KEY_SECRET ? "configured" : "MISSING — set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET"}`);
    console.log(`  SMTP   : ${process.env.SMTP_HOST ? "configured" : "MISSING — set SMTP_* vars"}`);
    console.log(`  Uploads: ${uploadsDir}${fs.existsSync(uploadsDir) ? " (exists)" : " (MISSING — check permissions)"}`);
    if (missing.length > 0) {
      console.log(`  \n  WARNING — missing config:`);
      for (const m of missing) console.log(`    • ${m}`);
    }
    console.log("========================================================\n");
  })
  .catch((err) => {
    console.error("[config] initial load failed:", err?.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });

// Refresh config from DB every 5 minutes.
setInterval(() => {
  loadConfig(true).catch(() => {});
}, 5 * 60_000).unref?.();
