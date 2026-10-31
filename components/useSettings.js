"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

let cache = null;
export function useSettings() {
  const [s, setS] = useState(cache || { lightKcal: 500, allergies: null });
  useEffect(() => { api("/api/settings").then((d) => { cache = d.settings; setS(d.settings); }).catch(() => {}); }, []);
  const save = async (patch) => { const d = await api("/api/settings", { method: "POST", json: patch }); cache = d.settings; setS(d.settings); };
  return [s, save];
}
