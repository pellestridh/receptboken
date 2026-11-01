"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRecipes, sortRecipes, filterRecipes, timeBucket } from "@/components/useRecipes";
import { Card, Pick } from "@/components/Card";
import { api, lsGet, lsSet } from "@/lib/api";
import { daysSince, mins } from "@/lib/format";
import { useSettings } from "@/components/useSettings";
import { allergyKey } from "@/components/Allergens";
import Box from "@/components/Box";
import { drawers as makeDrawers, seasonal, MONTHS, kitchenName } from "@/lib/box";

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function tonight(list) {
  const d = new Date();
  const weekday = d.getDay() >= 1 && d.getDay() <= 4;
  const rnd = seeded(d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate());
  list = list.filter((r) => !r.allergens?.hits?.length);
  let pool = list.filter((r) => (r.type || "Huvudrätt") === "Huvudrätt" && daysSince(r.lastCooked) > 10);
  if (weekday) { const quick = pool.filter((r) => (r.minutes || 0) <= 45); if (quick.length >= 3) pool = quick; }
  if (pool.length < 3) pool = list.filter((r) => (r.type || "Huvudrätt") === "Huvudrätt");
  const scored = pool.map((r) => ({ r, s: rnd() + (r.rating || 0) * 0.15 }));
  scored.sort((a, b) => b.s - a.s);
  return { weekday, picks: scored.slice(0, 3).map((x) => x.r) };
}

export default function Home() {
  const { recipes, error, reload } = useRecipes();
  const [drafts, setDrafts] = useState([]);
  const [menu, setMenu] = useState(null);
  const [q, setQ] = useState("");
  const [f, setF] = useState({});
  const [sort, setSort] = useState("az");
  const [settings] = useSettings();
  const [showFilters, setShowFilters] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [group, setGroup] = useState("none");
  useEffect(() => { setGroup(lsGet("rb-group", "none")); }, []);

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
  const filling = useRef(false);
  useEffect(() => {
    if (!recipes || !settings.allergies || filling.current) return;
    const key = allergyKey(settings.allergies);
    const todo = recipes.filter((r) => !r.allergens || r.allergens.key !== key).slice(0, 12);
    if (!todo.length) return;
    filling.current = true;
    (async () => {
      for (const r of todo) { try { await api(`/api/recipes/${r.id}/allergens`, { method: "POST" }); } catch {} }
      reload();
    })();
  }, [recipes, settings.allergies, reload]);
  const classifying = useRef(false);
  useEffect(() => {
    if (!recipes || classifying.current || !recipes.some((r) => r.dishes == null)) return;
    classifying.current = true;
    (async () => {
      for (let i = 0; i < 12; i++) {
        try { const d = await api("/api/classify", { method: "POST" }); if (!d.left) break; } catch { break; }
      }
      reload();
    })();
  }, [recipes, reload]);
  const shown = useMemo(() => sortRecipes(filterRecipes(all, f, q)
    .filter((r) => !f.light || (r.kcal && r.kcal <= settings.lightKcal))
    .filter((r) => !f.diet || (f.diet === "Glutenfri" ? r.allergens?.gluten === "nej" : r.allergens?.lactose === "nej")), sort), [all, f, q, sort, settings.lightKcal]);
  useEffect(() => { try { sessionStorage.setItem("rb-order", JSON.stringify(shown.map((r) => r.id))); } catch {} }, [shown]);

  const setFilter = (k, v) => { const n = { ...f, [k]: f[k] === v ? null : v }; setF(n); lsSet("rb-filter", n); };
  const setSorting = (v) => { setSort(v); lsSet("rb-sort", v); };
  const uniq = (k) => [...new Set(all.map((r) => r[k]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sv"));
  const times = [...new Set(all.map(timeBucket))].sort();
  const { weekday, picks } = tonight(all);
  const longAgo = all.filter((r) => r.lastCooked && daysSince(r.lastCooked) >= 30).sort((a, b) => String(a.lastCooked).localeCompare(String(b.lastCooked))).slice(0, 3);
  const box = useMemo(() => makeDrawers(all, { lightKcal: settings.lightKcal }), [all, settings.lightKcal]);
  const month = new Date().getMonth();
  const inSeason = useMemo(() => seasonal(all.filter((r) => !r.allergens?.hits?.length), month).slice(0, 6), [all, month]);
  const seasonNow = [...new Set(inSeason.flatMap((x) => x.hits))].slice(0, 3);
  const shownIds = new Set([...picks, ...longAgo].map((r) => r.id));
  const inspo = [
    { title: "Inte provat än", sub: "Sparade men aldrig lagade", list: all.filter((r) => !r.timesCooked && !shownIds.has(r.id) && (r.type || "Huvudrätt") === "Huvudrätt").sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) },
    { title: "Familjens favoriter", sub: "Fyra och fem stjärnor", list: all.filter((r) => (r.rating || 0) >= 4 && !shownIds.has(r.id)).sort((a, b) => b.rating - a.rating) },
  ].filter((x) => x.list.length >= 2).map((x) => ({ ...x, list: x.list.slice(0, 6) }));
  const now = new Date();
  const dayName = now.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });
  const filtering = q || Object.values(f).some(Boolean);
  const activeFilters = Object.values(f).filter(Boolean).length;

  const facet = (key, label, values) => values.length < 2 ? null : (
    <div className="frow"><span className="flabel">{label}</span>
      {values.map((v) => <button key={v} type="button" className="chip" aria-pressed={f[key] === v} onClick={() => setFilter(key, v)}>{v}</button>)}
    </div>
  );

  return (
    <>
      <div className="searchbar">
        <input className="tin" id="q" type="search" placeholder="Sök recept eller ingrediens" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <button type="button" className="chip filterbtn" aria-expanded={showFilters} aria-pressed={activeFilters > 0} onClick={() => setShowFilters(!showFilters)}>
          Filter{activeFilters ? ` · ${activeFilters}` : ""}
        </button>
      </div>
      {showFilters && recipes && (
        <div className="filters panel">
          {facet("kitchen", "Kök", uniq("kitchen"))}
          {facet("type", "Typ", uniq("type"))}
          {facet("base", "Bas", uniq("base"))}
          {facet("time", "Tid", times)}
          <div className="frow"><span className="flabel">Kost</span>
            {["Glutenfri", "Laktosfri"].map((v) => <button key={v} type="button" className="chip" aria-pressed={f.diet === v} onClick={() => setFilter("diet", v)}>{v}</button>)}
            <button type="button" className="chip" aria-pressed={!!f.light} onClick={() => setFilter("light", true)}>Lätt, under {settings.lightKcal} kcal</button>
          </div>
          <div className="frow"><span className="flabel">Sortera</span>
            {[["az", "A–Ö"], ["new", "Nyast"], ["rating", "Bäst betyg"], ["cooked", "Senast lagad"], ["quick", "Snabbast"]].map(([v, l]) => (
              <button key={v} type="button" className="chip" aria-pressed={sort === v} onClick={() => setSorting(v)}>{l}</button>
            ))}
          </div>
          {activeFilters > 0 && <div><button className="link" type="button" onClick={() => { setF({}); lsSet("rb-filter", {}); }}>Rensa filtren</button></div>}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="banner">
          <span><b>{drafts.length === 1 ? "Ett recept" : `${drafts.length} recept`}</b> från genvägen väntar på granskning.</span>
          <Link className="btn" href={`/nytt?utkast=${drafts[0].id}`}>Granska</Link>
        </div>
      )}

      {!filtering && recipes && (
        <div className="home-hero">
          <span className="kicker">{dayName}</span>
          <h1>{weekday ? "Vad blir det i kväll?" : "Helg. Tid för något gott."}</h1>
          <p className="muted">{all.length} recept i lådan.{seasonNow.length ? ` I säsong just nu: ${seasonNow.join(", ")}.` : ""}</p>
        </div>
      )}

      {!filtering && menu && (
        <>
          <div className="section-h"><h2>På menyn</h2><Link href="/meny" className="muted">{menu.title} ›</Link></div>
          <div className="rail small">
            {menu.items.filter((i) => i.recipeId).map((i) => {
              const today = i.day === new Date().toISOString().slice(0, 10);
              const d = i.day ? new Date(i.day + "T12:00:00") : null;
              const label = menu.kind === "middag" ? i.course : today ? "Idag" : d ? d.toLocaleDateString("sv-SE", { weekday: "long" }) : "";
              return (
                <Link key={i.id} href={`/recept/${i.recipeId}`} className={"wday" + (today ? " today" : "")} style={{ "--rc": `var(--c-${i.accent || "ember"})` }}>
                  <div className="wimg">{i.image ? <img src={i.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{i.title?.[0]}</span>}</div>
                  <div className="wtxt"><span>{label}</span><b>{i.title}</b></div>
                </Link>
              );
            })}
          </div>
        </>
      )}
      {!filtering && picks.length > 0 && (
        <>
          <div className="section-h"><h2>{weekday ? "Förslag till i kväll" : "Förslag till helgen"}</h2><span className="muted">{weekday ? "Snabbt, och inte ätit på länge" : "Något att ta tid på"}</span></div>
          <div className="rail">{picks.map((r) => <Pick key={r.id} r={r} />)}</div>
        </>
      )}
      {!filtering && recipes && all.length > 0 && <Box drawers={box} />}

      {!filtering && inSeason.length > 0 && (
        <>
          <div className="section-h"><h2>I säsong i {MONTHS[month]}</h2><span className="muted">Råvarorna är som bäst nu</span></div>
          <div className="rail">{inSeason.slice(0, 3).map(({ r, hits }) => <Pick key={r.id} r={r} note={hits.slice(0, 2).map((h) => h[0].toUpperCase() + h.slice(1)).join(" och ") + " · " + mins(r.minutes)} badge="Säsong" />)}</div>
        </>
      )}
      {!filtering && longAgo.length > 0 && (
        <>
          <div className="section-h"><h2>Länge sedan ni lagade</h2></div>
          <div className="rail">{longAgo.map((r) => <Pick key={r.id} r={r} note={`Senast för ${daysSince(r.lastCooked)} dagar sedan`} />)}</div>
        </>
      )}

      {!filtering && inspo.map((x) => (
        <div key={x.title}>
          <div className="section-h"><h2>{x.title}</h2><span className="muted">{x.sub}</span></div>
          <div className="rail">{x.list.slice(0, 3).map((r) => <Pick key={r.id} r={r} />)}</div>
        </div>
      ))}

      <div className="section-h"><h2>{filtering ? "Träffar" : "Alla recept"}</h2>
        <div className="grouping"><span className="muted">{shown.length}{shown.length < all.length ? ` av ${all.length}` : ""}</span>
          <div className="boxseg small" role="tablist" aria-label="Visa">
            {[["none", "Alla"], ["kitchen", "Per kök"]].map(([v, l]) => <button key={v} type="button" role="tab" aria-selected={group === v} onClick={() => { setGroup(v); lsSet("rb-group", v); }}>{l}</button>)}
          </div>
        </div>
      </div>
      {error && <div className="empty">{error}</div>}
      {!recipes && !error && <div className="empty">Hämtar recepten …</div>}
      {recipes && !all.length && <div className="empty">Inga recept än. <Link href="/nytt">Lägg till det första</Link>.</div>}
      {recipes && all.length > 0 && !shown.length && (
        <div className="empty">Inget recept matchar. <button className="link" type="button" onClick={() => { setQ(""); setF({}); lsSet("rb-filter", {}); }}>Rensa filtren</button></div>
      )}
      {group === "kitchen" ? (() => {
        const g = {};
        for (const r of shown) (g[kitchenName(r.kitchen) || "Övrigt"] ||= []).push(r);
        const keys = Object.keys(g).sort((a, b) => g[b].length - g[a].length || a.localeCompare(b, "sv"));
        return (<>
          <nav className="kjump">{keys.map((k) => <a key={k} className="chip" href={`#kok-${k}`}>{k} <span className="muted">{g[k].length}</span></a>)}</nav>
          {keys.map((k) => (
            <section key={k} id={`kok-${k}`} className="kgroup">
              <h3>{k}<span className="muted"> {g[k].length}</span></h3>
              <div className="grid">{g[k].map((r) => <Card key={r.id} r={r} lightKcal={settings.lightKcal} />)}</div>
            </section>
          ))}
        </>);
      })() : <div className="grid">{(filtering || showAll ? shown : shown.slice(0, 8)).map((r) => <Card key={r.id} r={r} lightKcal={settings.lightKcal} />)}</div>}
      {group !== "kitchen" && !filtering && !showAll && shown.length > 8 && <div className="more"><button className="btn ghost" type="button" onClick={() => setShowAll(true)}>Visa alla {shown.length} recept</button></div>}
      <p className="hint" style={{ marginTop: "2rem" }}><Link href="/installningar">Inställningar</Link> · <Link href="/genvag">Dela från Safari</Link></p>
    </>
  );
}
