"use client";
import { dishesOf } from "@/lib/dishes";
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

// Snabbval under sökfältet.
const main = (r) => /huvud/i.test(r.type || "Huvudrätt");
const veg = (r) => /veg/i.test(r.base || "");
export const QUICK = {
  middag: (r) => main(r) && !dishesOf(r).includes("pizza"),
  snabbt: (r) => main(r) && (r.minutes || 999) <= 30 && !dishesOf(r).includes("pizza"),
  veg: (r) => veg(r) && main(r),
  enkelt: (r) => r.difficulty === "enkel",
  pizza: (r) => dishesOf(r).includes("pizza"),
  bakat: (r) => dishesOf(r).some((d) => d === "brod" || d === "dessert"),
};
export const QUICK_LABEL = [["middag", "Middag"], ["snabbt", "Under 30 min"], ["veg", "Vegetariskt"], ["enkelt", "Enkelt"], ["pizza", "Pizza"], ["bakat", "Bakat och dessert"]];

// Sökning utan accenter, så att "entrecote" hittar "entrecôte" och "creme" hittar "crème". Å, ä och ö behålls.
const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u0303\u0327]/g, "").normalize("NFC");

export function filterRecipes(list, f, q) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  return list.filter((r) => {
    if (f.kitchen && r.kitchen !== f.kitchen) return false;
    if (f.type && r.type !== f.type) return false;
    if (f.base && r.base !== f.base) return false;
    if (f.time && timeBucket(r) !== f.time) return false;
    if (f.level && (r.difficulty || "medel") !== f.level) return false;
    if (f.quick && !QUICK[f.quick]?.(r)) return false;
    if (words.length) {
      // Alla ord ska finnas någonstans, i valfri ordning: "entrecote smör" hittar receptet.
      const hay = fold(`${r.title} ${r.short} ${(r.tags || []).join(" ")} ${r.ingredients} ${r.kitchen} ${r.base}`);
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}
