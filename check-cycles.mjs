const fs = require("fs");
const path = require("path");

function read(f) {
  return fs.readFileSync(path.resolve(f), "utf8");
}

function resolveImport(imp, fromFile) {
  if (!imp.startsWith("@/")) return null;
  let rest = imp.slice(2);
  if (!rest.endsWith(".ts") && !rest.endsWith(".tsx") && !rest.endsWith(".css")) {
    // Try .ts, .tsx, .ts/index.ts
    const base = path.join("src", rest);
    if (fs.existsSync(base + ".tsx")) return base + ".tsx";
    if (fs.existsSync(base + ".ts")) return base + ".ts";
    if (fs.existsSync(path.join(base, "index.ts"))) return path.join(base, "index.ts");
    if (fs.existsSync(base + ".css")) return base + ".css";
    return base + ".ts"; // best guess
  }
  return path.join("src", rest);
}

function findImports(filePath) {
  try {
    const content = read(filePath);
    const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    const result = [];
    for (const m of matches) {
      const resolved = resolveImport(m[1], filePath);
      if (resolved && fs.existsSync(resolved)) {
        result.push(resolved);
      }
    }
    return result;
  } catch (e) {
    return [];
  }
}

// Build dependency map for all ts/tsx files
const allFiles = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) allFiles.push(full);
  }
}
walk("src");

const deps = {};
for (const f of allFiles) {
  deps[f] = findImports(f);
}

// Detect cycles
const visited = new Set();
const inStack = new Set();
let foundCycle = null;

function dfs(node, path) {
  if (foundCycle) return;
  if (inStack.has(node)) {
    foundCycle = [...path, node];
    return;
  }
  if (visited.has(node)) return;
  visited.add(node);
  inStack.add(node);
  for (const dep of deps[node] || []) {
    if (deps[dep]) dfs(dep, [...path, node]);
  }
  inStack.delete(node);
}

for (const f of allFiles) {
  if (!foundCycle) dfs(f, []);
}

if (foundCycle) {
  console.log("CYCLE FOUND:", foundCycle.join(" -> "));
} else {
  console.log("No circular dependencies found.");
}
