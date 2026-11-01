/* useContent — CMS runtime hydration (pola terbukti build lama).
   Ambil /api/content (Vercel Blob, no-store) → fallback seed data/content.json.
   Selama fetch berjalan, seed langsung render (tidak ada loading state — konten
   selalu ada, hydrate diam-diam bila Blob lebih baru). */
import { useEffect, useState } from "react";
import seed from "../../data/content.json";
import type { ContentData } from "../types";

export function useContent(): ContentData {
  const [content, setContent] = useState<ContentData>(seed as unknown as ContentData);

  useEffect(() => {
    let alive = true;
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && j.site && j.about) setContent(j as ContentData);
      })
      .catch(() => {
        /* offline / API mati — seed build-time tetap jalan */
      });
    return () => {
      alive = false;
    };
  }, []);

  return content;
}
