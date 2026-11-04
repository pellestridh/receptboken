"use client";
import "@fontsource/caveat/latin-700.css";
import "@fontsource/cabin-sketch/latin-700.css";
import Link from "next/link";
import { dishesOf } from "@/lib/dishes";

// Pizzakvällen på startsidan: stor på fredagar, liten andra dagar.
export default function PizzaTeaser({ recipes = [], big = false }) {
  const menu = recipes.filter((r) => dishesOf(r).includes("pizza")).sort((a, b) => (a.pizzaNo ?? 999) - (b.pizzaNo ?? 999));
  if (!menu.length) return null;
  const day = new Date().getDate();
  const show = big ? [0, 1, 2].map((i) => menu[(day + i * 3) % menu.length]).filter((x, i, a) => a.indexOf(x) === i) : [];
  return (
    <Link href="/pizza?vy=kvall" className={"pzteaser" + (big ? " big" : "")}>
      <span className="pzt-h">{big ? "Fredag. Pizzakväll?" : "Pizzakväll"}</span>
      {big
        ? <ul>{show.map((r) => <li key={r.id}><b>{r.pizzaNo ? `${r.pizzaNo}. ` : ""}{r.title}</b></li>)}<li className="more">… och {Math.max(0, menu.length - show.length)} till på tavlan</li></ul>
        : <span className="pzt-s">{menu.length} pizzor på tavlan. Deg och pålägg räknas ut åt er.</span>}
      <span className="pzt-go">{big ? "Välj pizzor ›" : "Till tavlan ›"}</span>
    </Link>
  );
}
