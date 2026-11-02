/* ThemeProvider — mode gelap/terang untuk navbar & footer floating island.
   Persist localStorage 'trilux-theme'; default terang (murni hitam/putih,
   tanpa warna lain — sesuai standing constraint). Toggling hanya menukar
   variabel CSS --tr-bg/--tr-fg/--tr-line, bukan menambah warna baru. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

const STORAGE_KEY = "trilux-theme";

function readInitial(): Theme {
  try {
    // deep-link/QA: ?theme=dark|light didahulukan (tanpa menyimpan)
    const qp = new URLSearchParams(window.location.search).get("theme");
    if (qp === "dark" || qp === "light") return qp;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* localStorage tidak tersedia — abaikan */
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("trilux-dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
