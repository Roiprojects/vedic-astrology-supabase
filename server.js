import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DIST_DIR = path.join(__dirname, "dist");
const API_BACKEND = process.env.VITE_API_BASE_URL || "https://vedic-supa-new.vercel.app";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function proxyApiRequest(req, res) {
  const targetUrl = new URL(req.url, API_BACKEND);
  const headers = { ...req.headers, host: targetUrl.host };

  const proxyReq = https.request(
    targetUrl,
    {
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[proxy-error]", req.url, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Backend proxy error", details: err.message }));
    }
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Proxy API routes to live backend
  if (pathname.startsWith("/api/")) {
    return proxyApiRequest(req, res);
  }

  // 2. Serve static files from dist/
  let filePath = path.join(DIST_DIR, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    return fs.createReadStream(filePath).pipe(res);
  }

  // 3. SPA Fallback to dist/index.html
  const indexPath = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found: dist/index.html is missing. Run npm run build first.");
});

server.listen(PORT, () => {
  console.log(`[Vedic Astrology] Production server running on http://localhost:${PORT}`);
  console.log(`[Vedic Astrology] Serving static files from: ${DIST_DIR}`);
  console.log(`[Vedic Astrology] Proxying /api/* to: ${API_BACKEND}`);
});
