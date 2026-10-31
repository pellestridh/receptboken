"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRecipes } from "@/components/useRecipes";
import RecipeBody from "@/components/RecipeBody";
import RecipeImage from "@/components/RecipeImage";
import Drinks from "@/components/Drinks";
import Nutrition from "@/components/Nutrition";
import { useSettings } from "@/components/useSettings";
import { useApp } from "@/components/Providers";
import { api, getName } from "@/lib/api";
import { accentVar, dateSv, mins } from "@/lib/format";
import { shoppingItems } from "@/lib/shopping";

export default function RecipePage({ params }) {
  const id = params.id;
  const { recipes } = useRecipes();
  const { toast } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [serv, setServ] = useState(null);
  const [note, setNote] = useState("");
  const [wake, setWake] = useState(null);
  const wantWake = useRef(false);
  const [order, setOrder] = useState([]);
  const [settings] = useSettings();

  useEffect(() => {
    setData(null); setServ(null);
    api(`/api/recipes/${id}`).then(setData).catch((e) => setError(e.message));
    try { setOrder(JSON.parse(sessionStorage.getItem("rb-order") || "[]")); } catch {}
  }, [id]);

  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState === "visible" && wantWake.current && !wake) {
        try { setWake(await navigator.wakeLock.request("screen")); } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [wake]);
  useEffect(() => () => { try { wake?.release(); } catch {} }, [wake]);

  if (error) return <div className="empty">{error} <Link href="/">Till alla recept</Link></div>;
  if (!data) return <div className="empty">Hämtar receptet …</div>;
  const r = data.recipe, n = data.notes;
  const servings = serv || r.servings;
  const all = recipes || [];
  const byId = Object.fromEntries(all.map((x) => [x.id, x]));
  const seq = (order.includes(id) ? order : all.map((x) => x.id)).filter((x) => byId[x]);
  const idx = seq.indexOf(id);
  const prev = idx >= 0 && seq.length > 1 ? byId[seq[(idx - 1 + seq.length) % seq.length]] : null;
  const next = idx >= 0 && seq.length > 1 ? byId[seq[(idx + 1) % seq.length]] : null;
  const pairs = (r.pairsWith || []).map((p) => byId[p]).filter(Boolean);

  async function toShop(withPairs) {
    const items = shoppingItems(r, servings);
    if (withPairs) {
      for (const p of pairs) {
        try { const d = await api(`/api/recipes/${p.id}`); items.push(...shoppingItems(d.recipe)); } catch {}
      }
    }
    try { await api("/api/shopping", { method: "POST", json: { items } }); toast(withPairs ? "Hela middagen ligger i inköpslistan" : `${r.title} ligger i inköpslistan`); }
    catch (e) { toast(e.message); }
  }
  async function notesAction(json) {
    try { const d = await api(`/api/notes/${id}`, { method: "POST", json }); setData((x) => ({ ...x, notes: d.notes })); }
    catch (e) { toast(e.message); }
  }
  async function toggleWake() {
    if (wake) { wantWake.current = false; try { await wake.release(); } catch {} setWake(null); return; }
    if (!("wakeLock" in navigator)) { toast("Den här enheten kan inte hålla skärmen tänd"); return; }
    try { wantWake.current = true; const l = await navigator.wakeLock.request("screen"); setWake(l); }
    catch { toast("Skärmen kunde inte hållas tänd just nu"); }
  }

  return (
    <article className="r" style={{ "--rc": accentVar(r.accent) }}>
      <div className="rtop">
        {prev && <Link className="chip" href={`/recept/${prev.id}`} aria-label={`Föregående: ${prev.title}`}>‹ Föregående</Link>}
        {next && <Link className="chip" href={`/recept/${next.id}`} aria-label={`Nästa: ${next.title}`}>Nästa ›</Link>}
        <Link className="chip" href={`/recept/${id}/andra`}>Ändra</Link>
      </div>
      <RecipeImage id={id} image={r.image} hasSource={!!r.source?.url} onChange={(img) => setData((x) => ({ ...x, recipe: { ...x.recipe, image: img || undefined } }))} />
      <header className="rhead">
        <h1>{r.title}</h1>
        {r.lede && <p className="lede">{r.lede}</p>}
        <div className="tags">
          {[r.kitchen, r.type, r.base, mins(r.minutes), ...(r.tags || [])].filter(Boolean).map((t, i) => <span className="tag" key={i}>{t}</span>)}
          {r.nutrition?.kcal && r.nutrition.kcal <= settings.lightKcal && <span className="tag light-tag">Lätt</span>}
        </div>
        <div className="tools">
          <div className="stepper" role="group" aria-label="Antal">
            <button type="button" aria-label="Färre" onClick={() => setServ(Math.max(1, servings - 1))}>−</button>
            <span>{servings} {r.servingsUnit || "portioner"}</span>
            <button type="button" aria-label="Fler" onClick={() => setServ(Math.min(30, servings + 1))}>+</button>
          </div>
          <button className="btn" type="button" onClick={() => toShop(false)}>Lägg i inköpslistan</button>
          <button className="btn ghost" type="button" aria-pressed={!!wake} onClick={toggleWake}>{wake ? "Skärmen hålls tänd" : "Håll skärmen tänd"}</button>
        </div>
      </header>

      <RecipeBody recipe={r} factor={servings / r.servings} interactive id={id} />

      <Nutrition id={id} nutrition={r.nutrition} lightKcal={settings.lightKcal} onChange={(nu) => setData((x) => ({ ...x, recipe: { ...x.recipe, nutrition: nu } }))} />
      <Drinks id={id} drinks={r.drinks} onChange={(dr) => setData((x) => ({ ...x, recipe: { ...x.recipe, drinks: dr } }))} />

      {pairs.length > 0 && (
        <section className="rsec"><h2>Passar ihop med</h2>
          <div className="pairs">
            {pairs.map((p) => <Link key={p.id} className="pair" style={{ "--rc": accentVar(p.accent) }} href={`/recept/${p.id}`}>{p.title}</Link>)}
            <button className="btn ghost" type="button" onClick={() => toShop(true)}>Lägg hela middagen i inköpslistan</button>
          </div>
        </section>
      )}

      <section className="rsec"><h2>Våra anteckningar</h2>
        <div className="notes">
          <div className="rate" role="group" aria-label="Betyg">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" className={i <= n.rating ? "on" : ""} aria-label={`${i} av 5`} onClick={() => notesAction({ action: "rate", rating: n.rating === i ? 0 : i })}>★</button>
            ))}
            <span className="muted" style={{ marginLeft: ".6rem", fontSize: ".9rem" }}>{n.rating ? "Ert betyg" : "Sätt ett betyg"}</span>
          </div>
          <div className="arow">
            <span className="muted">{n.lastCooked ? `Senast lagad ${dateSv(n.lastCooked)}${n.timesCooked > 1 ? ` · lagad ${n.timesCooked} gånger` : ""}` : "Inte lagad än"}</span>
            <button className="btn ghost" type="button" onClick={() => notesAction({ action: "cooked" })}>Vi lagade den idag</button>
          </div>
          {n.entries.length > 0 && (
            <ul className="nlist">
              {n.entries.map((e) => (
                <li key={e.id}><div>{e.text}</div>
                  <div className="who">{e.author ? `${e.author} · ` : ""}{dateSv(e.created_at)}{" "}
                    <button className="link" type="button" onClick={() => notesAction({ action: "delentry", entryId: e.id })}>Ta bort</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="nform">
            <textarea className="tin" id="note-in" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Till exempel: nästa gång mer citron" />
            <button className="btn" type="button" disabled={!note.trim()} onClick={() => { notesAction({ action: "entry", text: note, author: getName() }); setNote(""); }}>Spara anteckning</button>
          </div>
        </div>
      </section>

      {prev && (
        <nav className="pnext" aria-label="Fler recept">
          <Link href={`/recept/${prev.id}`} style={{ "--rc": accentVar(prev.accent) }}><span className="dir">‹ Föregående</span><span className="nm">{prev.title}</span></Link>
          <Link href={`/recept/${next.id}`} className="nx" style={{ "--rc": accentVar(next.accent) }}><span className="dir">Nästa ›</span><span className="nm">{next.title}</span></Link>
        </nav>
      )}
      <div className="foot">
        <span>{r.source?.url ? <>Källa: <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.name || r.source.url}</a></> : r.source?.name ? `Källa: ${r.source.name}` : "Receptboken"}</span>
      </div>
    </article>
  );
}
