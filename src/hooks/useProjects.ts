/* useProjects — featured + daftar proyek (CMS runtime, pola sama dengan useContent).
   GET /api/admin?cms=1 adalah public read (tanpa auth) yang mengembalikan projects.json;
   Blob wins, fallback seed build-time data/projects.json. */
import { useEffect, useState } from "react";
import seed from "../../data/projects.json";
import type { FeaturedProject, ProjectItem, ProjectsData } from "../types";

export function useProjects(): { featured: FeaturedProject; projects: ProjectItem[] } {
  const [data, setData] = useState<ProjectsData>(seed as unknown as ProjectsData);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin?cms=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && (j.featured || j.projects)) {
          setData(j as ProjectsData);
        }
      })
      .catch(() => {
        /* API mati/offline — seed build-time tetap jalan */
      });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
