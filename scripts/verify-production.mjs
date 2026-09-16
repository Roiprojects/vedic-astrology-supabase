const base = (process.argv[2] || "https://myvedicastrology.in").replace(/\/$/, "");

async function request(path, init) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const text = await response.text();
  return { response, text };
}

const failures = [];

const root = await request("/");
if (root.response.status !== 200) failures.push(`GET / returned ${root.response.status}`);
if (root.text.includes("/@react-refresh")) failures.push("root still contains Vite development refresh markup");

const health = await request("/api/health");
let healthBody;
try { healthBody = JSON.parse(health.text); } catch { healthBody = null; }
if (health.response.status !== 200 || !healthBody?.ok) {
  failures.push(`GET /api/health is unhealthy (${health.response.status})`);
}
if (health.response.headers.get("cache-control") !== "no-store") {
  failures.push("/api/health is missing Cache-Control: no-store");
}

const unknown = await request("/api/verify-unknown-route");
let unknownBody;
try { unknownBody = JSON.parse(unknown.text); } catch { unknownBody = null; }
if (unknown.response.status !== 404 || unknownBody?.error !== "API route not found") {
  failures.push(`unknown API route returned ${unknown.response.status} instead of JSON 404`);
}

for (const path of ["/api/public/services", "/api/auth/me"]) {
  const result = await request(path);
  if (!result.response.headers.get("cache-control")?.includes("no-store")) {
    failures.push(`${path} is missing Cache-Control: no-store`);
  }
  if (result.response.headers.get("content-type")?.includes("text/html")) {
    failures.push(`${path} returned SPA HTML instead of JSON`);
  }
}

if (failures.length) {
  console.error(`Production verification failed for ${base}:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Production verification passed for ${base}`);
  console.log(JSON.stringify({ health: healthBody, rootStatus: root.response.status }));
}
