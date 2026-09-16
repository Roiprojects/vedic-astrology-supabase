import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";

function loadEnvFile(file) {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const rawEnv = { ...process.env, ...loadEnvFile(".env"), ...loadEnvFile(".env.local") };
const env = Object.fromEntries(
  Object.entries(rawEnv).filter(([key, value]) => key && !key.startsWith("=") && typeof value === "string")
);
// Dev mode always needs NODE_ENV=development
env.NODE_ENV = "development";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npm, ["run", "dev:vite"], { stdio: "inherit", env, shell: true }),
  spawn(npm, ["run", "dev:api"], { stdio: "inherit", env, shell: true }),
];

function shutdown(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));