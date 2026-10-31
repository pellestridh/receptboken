"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

// Hämtar receptlistan och håller den aktuell när appen kommer i förgrunden.
let cache = null;

export function useRecipes() {
  const [recipes, setRecipes] = useState(cache);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    api("/api/recipes").then((d) => { cache = d.recipes; setRecipes(d.recipes); setError(""); }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    load();
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);
  return { recipes, error, reload: load };
}

export function sortRecipes(list, sort) {
  const a = [...list];
  if (sort === "rating") a.sort((x, y) => (y.rating || 0) - (x.rating || 0) || x.title.localeCompare(y.title, "sv"));
  else if (sort === "cooked") a.sort((x, y) => String(y.lastCooked || "").localeCompare(String(x.lastCooked || "")));
  else if (sort === "quick") a.sort((x, y) => (x.minutes || 0) - (y.minutes || 0));
  else if (sort === "new") a.sort((x, y) => String(y.createdAt || "").localeCompare(String(x.createdAt || "")));
  else a.sort((x, y) => x.title.localeCompare(y.title, "sv"));
  return a;
}

export const timeBucket = (r) => ((r.minutes || 0) <= 40 ? "Vardag, högst 40 min" : "Lite längre");

export function filterRecipes(list, f, q) {
  q = (q || "").trim().toLowerCase();
  return list.filter((r) => {
    if (f.kitchen && r.kitchen !== f.kitchen) return false;
    if (f.type && r.type !== f.type) return false;
    if (f.base && r.base !== f.base) return false;
    if (f.time && timeBucket(r) !== f.time) return false;
    if (q) {
      const hay = `${r.title} ${r.short} ${(r.tags || []).join(" ")} ${r.ingredients} ${r.kitchen} ${r.base}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
