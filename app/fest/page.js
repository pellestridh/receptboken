"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRecipes } from "@/components/useRecipes";
import { useApp } from "@/components/Providers";
import { api, lsGet, lsSet } from "@/lib/api";
import { shoppingItems } from "@/lib/shopping";
import { EVENTS, plan, drinks, roleName, roleOf } from "@/lib/party";
import { HOLIDAYS, holidaysOf, upcomingHoliday } from "@/lib/holidays";
import { dishesOf } from "@/lib/dishes";

const fmt = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

export default function Fest() {
  const { recipes } = useRecipes();
  const { toast } = useApp();
  const [s, setS] = useState({ guests: 12, event: "buffe", hours: 3, ids: [] });
  const [q, setQ] = useState("");
  const [hol, setHol] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const v = lsGet("rb-fest", null); if (v) setS((x) => ({ ...x, ...v })); setHol(upcomingHoliday()?.key || ""); }, []);
  useEffect(() => { lsSet("rb-fest", s); }, [s]);
  const all = recipes || [];
  const chosen = s.ids.map((id) => all.find((r) => r.id === id)).filter(Boolean);
  const rows = useMemo(() => plan(chosen, s.guests, s.event), [chosen, s.guests, s.event]);
  const dr = drinks(s.guests, s.hours);
  const ev = EVENTS.find((e) => e.key === s.event);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const toggle = (id) => set("ids", s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id]);

  const wantPlock = s.event === "mingel" || s.event === "tilltugg";
  const cands = all.filter((r) => !s.ids.includes(r.id))
    .filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => !hol || q || holidaysOf(r).includes(hol))
    .sort((a, b) => (wantPlock ? (dishesOf(b).includes("plock") - dishesOf(a).includes("plock")) : 0) || (b.rating || 0) - (a.rating || 0))
    .slice(0, q || hol ? 30 : 12);

  async function toShop() {
    setBusy(true);
    try {
      const items = [];
      for (const x of rows) { const d = await api(`/api/recipes/${x.r.id}`); items.push(...shoppingItems(d.recipe, x.portions)); }
      await api("/api/shopping", { method: "POST", json: { items } });
      toast("Allt ligger i inköpslistan");
    } catch (e) { toast(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="narrow fest">
      <span className="kicker">Fest och buffé</span>
      <h1>Hur mycket ska vi laga?</h1>
      <p className="lead">Välj antal gäster, sorts tillställning och rätter. Appen räknar ut hur stort varje recept ska göras.</p>

      <div className="panel festform">
        <label className="fld"><span>Antal gäster</span>
          <span className="stepper"><button type="button" onClick={() => set("guests", Math.max(1, s.guests - 1))}>−</button><input className="tin" type="number" inputMode="numeric" min="1" value={s.guests} onChange={(e) => set("guests", Math.max(1, parseInt(e.target.value, 10) || 1))} /><button type="button" onClick={() => set("guests", s.guests + 1)}>+</button></span>
        </label>
        <label className="fld"><span>Timmar</span>
          <span className="stepper"><button type="button" onClick={() => set("hours", Math.max(1, s.hours - 1))}>−</button><input className="tin" type="number" inputMode="numeric" min="1" value={s.hours} onChange={(e) => set("hours", Math.max(1, parseInt(e.target.value, 10) || 1))} /><button type="button" onClick={() => set("hours", s.hours + 1)}>+</button></span>
        </label>
        <div className="fld wide"><span>Sorts tillställning</span>
          <div className="frow">{EVENTS.map((e) => <button key={e.key} type="button" className="chip" aria-pressed={s.event === e.key} onClick={() => set("event", e.key)}>{e.name}</button>)}</div>
          <p className="hint">{ev.hint}</p>
        </div>
      </div>

      <section className="bsec">
        <h2>Det här lagar ni</h2>
        {rows.length === 0 && <p className="muted">Välj rätter nedanför.</p>}
        <ul className="festlist">{rows.map((x) => (
          <li key={x.r.id}>
            <div><Link href={`/recept/${x.r.id}`}><b>{x.r.title}</b></Link><span className="muted">{roleName(x.role)}{x.note ? ` · ${x.note}` : ""}</span></div>
            <div className="festq"><b>{x.portions}</b> <span className="muted">{x.r.servingsUnit || "portioner"}</span><small className="muted">{x.factor === 1 ? "som receptet" : `receptet × ${fmt(x.factor)}`}</small></div>
            <button type="button" className="link" onClick={() => toggle(x.r.id)} aria-label="Ta bort">Ta bort</button>
          </li>
        ))}</ul>
        {rows.length > 0 && <p className="arow"><button className="btn" type="button" disabled={busy} onClick={toShop}>{busy ? "Lägger till …" : "Lägg allt i inköpslistan"}</button></p>}
      </section>

      <section className="bsec">
        <h2>Dryck</h2>
        <p>Räkna med cirka <b>{dr.glasses} glas</b> totalt: två glas första timmen och sedan ett i timmen per gäst.</p>
        <ul className="ticks"><li>Vin: cirka {dr.wine} flaskor, om hälften dricker vin</li><li>Öl: cirka {dr.beer} burkar eller flaskor</li><li>Alkoholfritt: cirka {fmt(dr.soft)} liter, plus vatten till alla</li></ul>
        <p className="hint">Dryckesförslag till rätterna finns på varje recept.</p>
      </section>

      <section className="bsec">
        <h2>Lägg till rätter</h2>
        <input className="tin" type="search" placeholder="Sök bland era recept" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="frow" style={{ marginTop: ".5rem" }}>
          <button type="button" className="chip" aria-pressed={!hol} onClick={() => setHol("")}>Alla</button>
          {HOLIDAYS.map((h) => <button key={h.key} type="button" className="chip" aria-pressed={hol === h.key} onClick={() => setHol(hol === h.key ? "" : h.key)}>{h.name}</button>)}
        </div>
        <ul className="festcands">{cands.map((r) => (
          <li key={r.id}><button type="button" onClick={() => toggle(r.id)}><span className="plus">+</span><b>{r.title}</b><span className="muted">{roleName(roleOf(r))}</span></button></li>
        ))}</ul>
        {cands.length === 0 && <p className="muted">Inga recept {hol ? "för den högtiden " : ""}hittades.</p>}
      </section>
    </div>
  );
}
