import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

// Stamp the service worker with the build timestamp so each deployment
// automatically busts the SW cache for all returning visitors.
function swStampPlugin() {
  return {
    name: "sw-stamp",
    closeBundle() {
      const swPath = path.resolve("dist/sw.js");
      if (!fs.existsSync(swPath)) return;
      const ts = Date.now().toString();
      const content = fs.readFileSync(swPath, "utf8");
      fs.writeFileSync(swPath, content.replaceAll("__BUILD_TS", ts));
    },
  };
}

export default defineConfig({
  plugins: [react(), swStampPlugin()],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "https://vedic-supa-new.vercel.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
