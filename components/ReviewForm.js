"use client";
import { useState } from "react";
import RecipeBody from "@/components/RecipeBody";
import { accentVar } from "@/lib/format";

// Granskning före sparning. Används både för nya recept och för ändringar.
export default function ReviewForm({ recipe, recipes = [], onSave, onDiscard, saveLabel = "Spara i Receptboken", busy, dupWarning }) {
  const [m, setM] = useState({
    title: recipe.title || "", kitchen: recipe.kitchen || "", type: recipe.type || "", base: recipe.base || "",
    minutes: recipe.minutes || "", servings: recipe.servings || "", source: recipe.source?.name || "",
  });
  const [armed, setArmed] = useState(false);
  const opts = (k) => [...new Set([...recipes.map((r) => r[k]), recipe[k]].filter(Boolean))];
  const set = (k) => (e) => setM({ ...m, [k]: e.target.value });

  function result() {
    const d = JSON.parse(JSON.stringify(recipe));
    d.title = m.title.trim() || d.title;
    d.kitchen = m.kitchen.trim(); d.type = m.type.trim(); d.base = m.base.trim();
    const mn = parseInt(m.minutes, 10); if (mn > 0) d.minutes = mn;
    const sv = parseInt(m.servings, 10);
    if (sv > 0 && sv !== d.servings) {
      const f = sv / d.servings;
      d.groups.forEach((g) => g.items.forEach((it) => {
        if (it.q != null) it.q = Math.round(it.q * f * 100) / 100;
        if (it.q2 != null) it.q2 = Math.round(it.q2 * f * 100) / 100;
      }));
      d.servings = sv;
    }
    d.source = { ...(d.source || {}), name: m.source.trim() || undefined };
    if (!d.source.name && !d.source.url) delete d.source;
    return d;
  }

  const bar = (
    <div className="savebar">
      <div><b>Granska receptet</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>Ändra rubrik och kategorier vid behov och spara sedan.</span></div>
      <div className="arow">
        {armed
          ? <button className="btn ghost" type="button" onClick={onDiscard}>Tryck igen för att slänga</button>
          : <button className="btn ghost" type="button" onClick={() => { setArmed(true); setTimeout(() => setArmed(false), 4000); }}>Släng</button>}
        <button className="btn" type="button" disabled={busy} onClick={() => onSave(result())}>{busy ? "Sparar …" : saveLabel}</button>
      </div>
    </div>
  );

  const list = (id, k) => (
    <datalist id={id}>{opts(k).map((v) => <option key={v} value={v} />)}</datalist>
  );

  return (
    <article className="r" style={{ "--rc": accentVar(recipe.accent) }}>
      {bar}
      {dupWarning && <p className="warn">{dupWarning}</p>}
      <div className="meta-edit">
        <label className="fld wide"><span>Rubrik</span><input className="tin" value={m.title} onChange={set("title")} /></label>
        <label className="fld"><span>Kök</span><input className="tin" list="l-kitchen" value={m.kitchen} onChange={set("kitchen")} />{list("l-kitchen", "kitchen")}</label>
        <label className="fld"><span>Typ</span><input className="tin" list="l-type" value={m.type} onChange={set("type")} />{list("l-type", "type")}</label>
        <label className="fld"><span>Bas</span><input className="tin" list="l-base" value={m.base} onChange={set("base")} />{list("l-base", "base")}</label>
        <label className="fld"><span>Minuter totalt</span><input className="tin" type="number" min="1" inputMode="numeric" value={m.minutes} onChange={set("minutes")} /></label>
        <label className="fld"><span>Antal {recipe.servingsUnit || "portioner"}</span><input className="tin" type="number" min="1" inputMode="numeric" value={m.servings} onChange={set("servings")} /></label>
        <label className="fld wide"><span>Källa</span><input className="tin" value={m.source} onChange={set("source")} placeholder="Till exempel Köket.se eller en kokbok" /></label>
      </div>
      {recipe.image && <div className="rhero"><img src={recipe.image} alt="" referrerPolicy="no-referrer" /></div>}
      <header className="rhead"><h1>{m.title}</h1>{recipe.lede && <p className="lede">{recipe.lede}</p>}</header>
      <RecipeBody recipe={recipe} id="preview" />
      <div style={{ marginTop: "2rem" }}>{bar}</div>
    </article>
  );
}
