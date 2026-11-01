import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Trilux Design — fresh SPA (React + TS + Vite + Tailwind v4).
// Single-page marketing landing; admin (public/admin) & API (api/) stay outside the SPA.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
  },
  server: {
    port: 5173,
    host: true,
  },
});
