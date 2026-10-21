import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ── Dev server security headers ────────────────────────────────
  server: {
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",
    },
  },

  // ── Build optimisations ────────────────────────────────────────
  build: {
    // No source maps in production (prevents code exposure)
    sourcemap: false,
  },

  // ── Security: Prevent secrets leaking to frontend ─────────────
  // Only VITE_ prefixed env vars are exposed to the browser
  // Never prefix sensitive vars with VITE_
  envPrefix: "VITE_",
});
