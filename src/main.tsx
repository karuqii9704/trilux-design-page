/* Trilux Design — fresh SPA landing (React 18 + TS + Vite + Tailwind v4 + Geist).
   Reset 2026-11-01: landing/hero/navbar/route dibangun ulang dari nol.
   Gaya: minimal white architectural (referensi Bespoke prompt) × konten Trilux
   (knowledge: .akos/knowledge/FEATURES_KEEP.md). Stage/shapes-based ONLY —
   tidak ada foto/video layer (standing user call). */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./hooks/useTheme";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root tidak ditemukan di index.html");

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
