"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { accentVar } from "@/lib/format";
import { grapeByKey, GRAPES } from "@/data/wine";
import { grapeExtra, WINE_TREE } from "@/data/wineExtra";
import { ProfileBars, WineNote, swatch, itemFor, profileOf } from "@/components/Wine";
import Clocks from "@/components/Clocks";
import WineMap from "@/components/WineMap";

const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
const CN = { vitt: "Vitt", rott: "Rött", "rosé": "Rosé", mousserande: "Mousserande", "sött": "Sött och starkt" };

function familyOf(key) {
  for (const root of WINE_TREE) for (const c of root.c) {
    const keys = (c.c.length ? c.c : [c]).map((x) => x.k);
    if (keys.includes(key) || c.k === key) return { name: c.n, keys: [...new Set(keys.filter((k) => k && k !== key))] };
  }
  return null;
}

export default function Grape() {
  const { key } = useParams();
  const g = grapeByKey(key);
  const [notes, setNotes] = useState([]);
  const [usage, setUsage] = useState({});
  useEffect(() => {
    api("/api/wine-notes?typ=wine").then((d) => setNotes(d.notes)).catch(() => {});
    api("/api/beer-usage").then((d) => setUsage(d.wine || {})).catch(() => {});
  }, []);
  if (!g) return <div className="narrow"><div className="empty">Druvan finns inte. <Link href="/dryck?typ=vin&vy=kort">Alla druvor</Link></div></div>;
  const x = grapeExtra(g.key);
  const mine = notes.filter((n) => itemFor("wine", `${n.style || ""} ${n.wine}`, n.grape)?.key === g.key);
  const prof = profileOf("wine", notes, GRAPES.map((y) => ({ key: y.key, name: y.name, p: y.p })));
  const recs = usage[g.key] || [];
  const fam = familyOf(g.key);

  return (
    <article className="narrow bstyle">
      <header className="bhead">
        <span className="wglass" style={{ "--sw": swatch(g.color) }} />
        <div><span className="kicker"><Link href="/dryck?typ=vin&vy=kort">{CN[g.color]}{fam ? ` · ${fam.name.toLowerCase()}` : ""}</Link></span><h1>{g.name}</h1><p className="muted" style={{ margin: 0 }}>{g.where}</p></div>
      </header>
      <div className="stats"><Clocks kind="wine" g={g} />{prof.liked > 0 && <details className="ownprof"><summary>Jämför med er smakprofil</summary><ProfileBars p={g.p} compare={prof.avg} /><p className="hint">Strecket visar er smakprofil.</p></details>}</div>

      <section className="bsec"><h2>Om druvan</h2><p>{g.about}</p></section>
      <section className="bsec"><h2>Doft och smak</h2><p>{g.smell}</p></section>
      <section className="bsec food">
        <h2>Passar till</h2>
        <div className="becau"><p>{g.food}</p></div>
        <div className="duo">
          {x.cheese && <div className="card2"><h3>Ost</h3><p>{x.cheese}</p></div>}
          {x.dessert && <div className="card2"><h3>Dessert</h3><p>{x.dessert}</p></div>}
        </div>
      </section>

      {recs.length > 0 && (
        <section className="bsec">
          <h2>I era recept</h2>
          <div className="rail small">{recs.map((r) => (
            <Link key={r.id} href={`/recept/${r.id}`} className="wday" style={{ "--rc": accentVar(r.accent) }}>
              <div className="wimg">{r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}</div>
              <div className="wtxt"><span>{r.how === "ert val" ? "Ert val" : r.how === "alternativ" ? "Alternativ" : "Föreslagen"}</span><b>{r.title}</b></div>
            </Link>
          ))}</div>
        </section>
      )}

      <section className="bsec"><h2>Leta efter på etiketten</h2>
        <div className="frow">{g.label.map((l) => <a key={l} className="chip" href={sb(l)} target="_blank" rel="noopener noreferrer">{l}</a>)}</div>
        <p className="hint">Länkarna söker på Systembolaget.</p>
      </section>

      <section className="bsec"><h2>På kartan</h2><WineMap usage={usage} focus={g.key} compact /></section>

      <section className="bsec"><h2>Gillar ni {g.name.split(" ")[0]}, prova</h2>
        <div className="frow">{g.next.map((k) => { const y = grapeByKey(k); return <Link key={k} className="chip blink wine" href={`/dryck/vin/druva/${k}`}><i className="sw" style={{ "--sw": swatch(y.color) }} />{y.name}</Link>; })}</div>
      </section>
      {fam?.keys.length > 0 && (
        <section className="bsec"><h2>Samma familj</h2>
          <div className="frow">{fam.keys.map((k) => { const y = grapeByKey(k); return <Link key={k} className="chip blink wine" href={`/dryck/vin/druva/${k}`}><i className="sw" style={{ "--sw": swatch(y.color) }} />{y.name}</Link>; })}</div>
        </section>
      )}

      <section className="bsec"><h2>Era provningar</h2>
        {mine.length ? <div className="wnotes">{mine.map((n) => <WineNote key={n.id} n={n} />)}</div> : <p className="muted">Ni har inte loggat någon {g.name} än. <Link href="/dryck?typ=vin&vy=provat">Logga ett vin ›</Link></p>}
      </section>
    </article>
  );
}
