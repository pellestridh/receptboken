"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRecipes, sortRecipes, filterRecipes, timeBucket } from "@/components/useRecipes";
import { Card, Pick } from "@/components/Card";
import { api, lsGet, lsSet } from "@/lib/api";
import { daysSince, mins } from "@/lib/format";
import { useSettings } from "@/components/useSettings";

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function tonight(list) {
  const d = new Date();
  const weekday = d.getDay() >= 1 && d.getDay() <= 4;
  const rnd = seeded(d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate());
  let pool = list.filter((r) => (r.type || "Huvudrätt") === "Huvudrätt" && daysSince(r.lastCooked) > 10);
  if (weekday) { const quick = pool.filter((r) => (r.minutes || 0) <= 45); if (quick.length >= 3) pool = quick; }
  if (pool.length < 3) pool = list.filter((r) => (r.type || "Huvudrätt") === "Huvudrätt");
  const scored = pool.map((r) => ({ r, s: rnd() + (r.rating || 0) * 0.15 }));
  scored.sort((a, b) => b.s - a.s);
  return { weekday, picks: scored.slice(0, 3).map((x) => x.r) };
}

export default function Home() {
  const { recipes, error } = useRecipes();
  const [drafts, setDrafts] = useState([]);
  const [menu, setMenu] = useState(null);
  const [q, setQ] = useState("");
  const [f, setF] = useState({});
  const [sort, setSort] = useState("az");
  const [settings] = useSettings();

  useEffect(() => {
    setF(lsGet("rb-filter", {})); setSort(lsGet("rb-sort", "az"));
    api("/api/drafts").then((d) => setDrafts(d.drafts)).catch(() => {});
    api("/api/menus").then((d) => {
      const today = new Date().toISOString().slice(0, 10);
      const upcoming = d.menus.filter((m) => m.items.some((i) => i.recipeId && i.day && i.day >= today));
      upcoming.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
      setMenu(upcoming[0] || null);
    }).catch(() => {});
  }, []);

  const all = recipes || [];
  const shown = useMemo(() => sortRecipes(filterRecipes(all, f, q).filter((r) => !f.light || (r.kcal && r.kcal <= settings.lightKcal)), sort), [all, f, q, sort, settings.lightKcal]);
  useEffect(() => { try { sessionStorage.setItem("rb-order", JSON.stringify(shown.map((r) => r.id))); } catch {} }, [shown]);

  const setFilter = (k, v) => { const n = { ...f, [k]: f[k] === v ? null : v }; setF(n); lsSet("rb-filter", n); };
  const setSorting = (v) => { setSort(v); lsSet("rb-sort", v); };
  const uniq = (k) => [...new Set(all.map((r) => r[k]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sv"));
  const times = [...new Set(all.map(timeBucket))].sort();
  const { weekday, picks } = tonight(all);
  const longAgo = all.filter((r) => r.lastCooked && daysSince(r.lastCooked) >= 30).sort((a, b) => String(a.lastCooked).localeCompare(String(b.lastCooked))).slice(0, 3);
  const filtering = q || Object.values(f).some(Boolean);

  const facet = (key, label, values) => values.length < 2 ? null : (
    <div className="frow"><span className="flabel">{label}</span>
      {values.map((v) => <button key={v} type="button" className="chip" aria-pressed={f[key] === v} onClick={() => setFilter(key, v)}>{v}</button>)}
    </div>
  );

  return (
    <>
      {drafts.length > 0 && (
        <div className="banner">
          <span><b>{drafts.length === 1 ? "Ett recept" : `${drafts.length} recept`}</b> från genvägen väntar på granskning.</span>
          <Link className="btn" href={`/nytt?utkast=${drafts[0].id}`}>Granska {drafts[0].title}</Link>
        </div>
      )}

      {!filtering && menu && (
        <>
          <div className="section-h"><h2>På menyn</h2><Link href="/meny" className="muted">{menu.title} · ändra</Link></div>
          <div className="weekmenu">
            {menu.items.filter((i) => i.recipeId).map((i) => {
              const today = i.day === new Date().toISOString().slice(0, 10);
              const d = i.day ? new Date(i.day + "T12:00:00") : null;
              const label = menu.kind === "middag" ? i.course : today ? "Idag" : d ? d.toLocaleDateString("sv-SE", { weekday: "long" }) : "";
              return (
                <Link key={i.id} href={`/recept/${i.recipeId}`} className={"wday" + (today ? " today" : "")} style={{ "--rc": `var(--c-${i.accent || "ember"})` }}>
                  <div className="wimg">{i.image && <img src={i.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}</div>
                  <div className="wtxt"><span>{label}</span><b>{i.title}</b></div>
                </Link>
              );
            })}
          </div>
        </>
      )}
      {!filtering && picks.length > 0 && (
        <>
          <div className="section-h"><h2>{weekday ? "Ikväll?" : "Till helgen?"}</h2><span className="muted">{weekday ? "Snabba rätter ni inte ätit på ett tag" : "Något att ta god tid på"}</span></div>
          <div className="picks">{picks.map((r) => <Pick key={r.id} r={r} />)}</div>
        </>
      )}
      {!filtering && longAgo.length > 0 && (
        <>
          <div className="section-h"><h2>Länge sedan ni lagade</h2></div>
          <div className="picks">{longAgo.map((r) => <Pick key={r.id} r={r} note={`Senast för ${daysSince(r.lastCooked)} dagar sedan`} />)}</div>
        </>
      )}

      <div className="section-h"><h2>Alla recept</h2><span className="muted">{shown.length}{shown.length < all.length ? ` av ${all.length}` : ""} recept</span></div>
      <input className="tin search" id="q" type="search" placeholder="Sök recept eller ingrediens" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      {recipes && (
        <div className="filters">
          {facet("kitchen", "Kök", uniq("kitchen"))}
          {facet("type", "Typ", uniq("type"))}
          {facet("base", "Bas", uniq("base"))}
          {facet("time", "Tid", times)}
          <div className="frow"><span className="flabel">Lätt</span>
            <button type="button" className="chip" aria-pressed={!!f.light} onClick={() => setFilter("light", true)}>Under {settings.lightKcal} kcal per portion</button>
          </div>
          <div className="frow"><span className="flabel">Sortera</span>
            {[["az", "A–Ö"], ["new", "Nyast"], ["rating", "Bäst betyg"], ["cooked", "Senast lagad"], ["quick", "Snabbast"]].map(([v, l]) => (
              <button key={v} type="button" className="chip" aria-pressed={sort === v} onClick={() => setSorting(v)}>{l}</button>
            ))}
          </div>
        </div>
      )}
      {error && <div className="empty">{error}</div>}
      {!recipes && !error && <div className="empty">Hämtar recepten …</div>}
      {recipes && !all.length && <div className="empty">Inga recept än. <Link href="/nytt">Lägg till det första</Link>.</div>}
      {recipes && all.length > 0 && !shown.length && (
        <div className="empty">Inget recept matchar. <button className="link" type="button" onClick={() => { setQ(""); setF({}); lsSet("rb-filter", {}); }}>Rensa filtren</button></div>
      )}
      <div className="grid">{shown.map((r) => <Card key={r.id} r={r} lightKcal={settings.lightKcal} />)}</div>
      <p className="hint" style={{ marginTop: "2rem" }}><Link href="/installningar">Inställningar</Link> · <Link href="/genvag">Dela från Safari</Link></p>
    </>
  );
}
