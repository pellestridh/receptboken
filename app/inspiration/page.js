"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { accentVar, mins } from "@/lib/format";
import { DISHES, dishesOf } from "@/lib/dishes";

function ICard({ r }) {
  return (
    <Link href={`/inspiration/${r.id}`} className="card" style={{ "--rc": accentVar(r.accent) }}>
      <div className="img">{r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}</div>
      <div className="txt">
        <span className="ifrom">Från {r.fromName}{r.rating >= 4 ? ` · ${"★".repeat(r.rating)}` : ""}</span>
        <h3>{r.title}</h3>
        {r.allergens?.hits?.length > 0 && <span className="warnbadge">Innehåller {r.allergens.hits.join(" och ")}</span>}
        {r.short && <p>{r.short}</p>}
        <div className="meta"><b>{r.kitchen}</b><span>{mins(r.minutes)}</span>{r.kcal ? <span>{r.kcal} kcal</span> : null}{r.have ? <span className="light">Finns hos er</span> : null}</div>
      </div>
    </Link>
  );
}

export default function Inspiration() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [from, setFrom] = useState(null);
  const [dish, setDish] = useState(null);
  const [hideHave, setHideHave] = useState(true);
  const [q, setQ] = useState("");
  useEffect(() => { api("/api/inspiration").then(setD).catch((e) => setErr(e.message)); }, []);
  const list = useMemo(() => (d?.recipes || [])
    .filter((r) => !from || r.from === from)
    .filter((r) => !dish || dishesOf(r).includes(dish))
    .filter((r) => !hideHave || !r.have)
    .filter((r) => !q || `${r.title} ${r.ingredients} ${r.kitchen}`.toLowerCase().includes(q.toLowerCase())), [d, from, dish, hideHave, q]);
  const favs = (d?.recipes || []).filter((r) => !r.have && (r.rating >= 4 || r.timesCooked >= 3)).slice(0, 6);
  const dishesHere = DISHES.filter((x) => (d?.recipes || []).some((r) => dishesOf(r).includes(x.key)));

  return (
    <div className="inspo">
      <div className="hero">
        <span className="kicker">Inspiration</span>
        <h1>Från de andra köken</h1>
        <p className="muted" style={{ margin: 0 }}>Recept som de andra hushållen delar. Läs, och spara det ni vill prova i er egen receptbok.</p>
      </div>
      {err && <div className="empty">{err}</div>}
      {d && !d.households.length && <div className="empty">Inga hushåll delar sina recept än. Under Inställningar → Hushåll kan varje hushåll slå på Visa våra recept som inspiration.</div>}
      {d && d.households.length > 0 && (
        <>
          {favs.length > 0 && !q && !from && !dish && (
            <>
              <div className="section-h"><h2>Deras favoriter</h2><span className="muted">Högt betyg eller ofta lagade</span></div>
              <div className="rail">{favs.map((r) => (
                <Link key={r.id} href={`/inspiration/${r.id}`} className="pick" style={{ "--rc": accentVar(r.accent) }}>
                  {r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}
                  <span className="pbadge">{r.fromName}</span>
                  <div className="cap"><b>{r.title}</b><span>{r.kitchen} · {mins(r.minutes)}</span></div>
                </Link>
              ))}</div>
            </>
          )}
          <div className="searchbar" style={{ marginTop: "1.5rem" }}><input className="tin" type="search" placeholder="Sök i deras recept" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="filters panel">
            {d.households.length > 1 && <div className="frow"><span className="flabel">Från</span>
              {d.households.map((h) => <button key={h.id} type="button" className="chip" aria-pressed={from === h.id} onClick={() => setFrom(from === h.id ? null : h.id)}>{h.name}</button>)}</div>}
            {dishesHere.length > 1 && <div className="frow"><span className="flabel">Rätt</span>
              {dishesHere.map((x) => <button key={x.key} type="button" className="chip" aria-pressed={dish === x.key} onClick={() => setDish(dish === x.key ? null : x.key)}>{x.name}</button>)}</div>}
            <div className="frow"><span className="flabel">Visa</span><button type="button" className="chip" aria-pressed={hideHave} onClick={() => setHideHave(!hideHave)}>Bara sådant vi inte har</button></div>
          </div>
          <div className="section-h"><h2>Alla deras recept</h2><span className="muted">{list.length}</span></div>
          {!list.length && <div className="empty">Inget matchar.</div>}
          <div className="grid">{list.map((r) => <ICard key={r.id} r={r} />)}</div>
        </>
      )}
      {!d && !err && <div className="empty">Hämtar …</div>}
    </div>
  );
}
