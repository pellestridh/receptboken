"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { accentVar } from "@/lib/format";
import { Glass, Stats } from "@/components/BeerBits";
import { styleByKey, familyName, STYLES, childrenOf, ALL_STYLES } from "@/data/beer";
import { cardsFor } from "@/data/beerCards";
import { beerProfile } from "@/data/beerSchool";
import { spectrumFor } from "@/data/beerSpectrum";
import { ProfileBars, WineNote, itemFor } from "@/components/Wine";
import Clocks from "@/components/Clocks";

const range = (t) => { const m = String(t || "").replace(/,/g, ".").match(/([\d.]+)\s*(?:-\s*([\d.]+))?/); return m ? [Number(m[1]), Number(m[2] || (t.includes("+") ? 80 : m[1]))] : null; };

function Card({ c }) {
  const rows = [["Doft", c.doft], ["Utseende", c.utseende], ["Smak", c.smak], ["Munkänsla och kropp", c.kropp]].filter(([, v]) => v);
  return (
    <div className="okort">
      {c.sammanfattning && <p className="osum">{c.sammanfattning}</p>}
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {(c.ibu || c.ebc || c.abv) && <p className="ovals">{c.ibu && <span><b>{c.ibu}</b> IBU</span>}{c.ebc && <span><b>{c.ebc}</b> EBC</span>}{c.abv && <span><b>{c.abv}</b> % alkohol</span>}</p>}
    </div>
  );
}

const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
const KIND = { ale: "Överjäst", lager: "Underjäst", spontan: "Spontanjäst", hybrid: "Lagerjäst vid överjäsningstemperatur" };

export default function StylePage() {
  const { key } = useParams();
  const s = styleByKey(key);
  const [usage, setUsage] = useState({});
  const [ci, setCi] = useState(0);
  const [notes, setNotes] = useState([]);
  useEffect(() => { api("/api/wine-notes?typ=beer").then((d) => setNotes(d.notes)).catch(() => {}); }, []);
  useEffect(() => { api("/api/beer-usage").then((d) => setUsage(d.usage || {})).catch(() => {}); }, []);
  if (!s) return <div className="narrow"><div className="empty">Den ölstilen finns inte. <Link href="/dryck?typ=ol&vy=stilar">Alla stilar</Link></div></div>;
  const recs = usage[s.key] || [];
  const cards = [s.key, ...childrenOf(s.key)].flatMap(cardsFor);
  const covers = childrenOf(s.key).map((k) => ALL_STYLES.find((x) => x.key === k)?.name).filter(Boolean);
  const c0 = cards[0];
  const st = c0 ? { ...s, ibu: range(c0.ibu) || s.ibu, ebc: range(c0.ebc) || s.ebc, abv: range(c0.abv) || s.abv } : s;
  const same = STYLES.filter((x) => x.family === s.family && x.key !== s.key);

  const mine = notes.filter((n) => itemFor("beer", `${n.style || ""} ${n.wine}`, n.grape)?.key === s.key);

  return (
    <article className="narrow bstyle">
      <header className="bhead">
        <Glass s={s} size={72} />
        <div>
          <span className="kicker"><Link href="/dryck?typ=ol&vy=stilar">{familyName(s.family)}</Link></span>
          <h1>{s.name}</h1>
          <p className="muted" style={{ margin: 0 }}>{KIND[s.kind]} · servera {s.temp}</p>
        </div>
      </header>
      <div className="stats"><Clocks kind="beer" s={st} noColor /></div>

      <section className="bsec">
        <h2>Om stilen</h2>
        <p className="lead">{s.desc}</p>
        {s.about && s.about !== s.desc && <p>{s.about}</p>}
      </section>

      <section className="bsec food">
        <h2>Passar till</h2>
        <ul className="ticks">{s.food.map((f) => <li key={f}>{f}</li>)}</ul>
        <div className="becau"><h3>Därför</h3><p>{s.why}</p></div>
      </section>

      {(recs.length > 0 || mine.length > 0) && (
        <section className="bsec">
          <h2>Hos er</h2>
          {recs.length > 0 && <ul className="plainlist">{recs.map((r) => <li key={r.id}><Link href={`/recept/${r.id}`}>{r.title}</Link> <span className="muted">{r.how === "ert val" ? "ert val" : r.how === "alternativ" ? "alternativ" : "föreslagen"}</span></li>)}</ul>}
          {mine.length > 0 && <div className="wnotes">{mine.map((n) => <WineNote key={n.id} n={n} />)}</div>}
        </section>
      )}

      <p className="arow"><a className="btn ghost" href={sb(s.short || s.name)} target="_blank" rel="noopener noreferrer">Sök {(s.short || s.name).toLowerCase()} på Systembolaget</a> <Link className="btn ghost" href="/dryck?typ=ol&vy=provat">Logga en öl</Link></p>

      {cards.length > 0 && (
        <details className="bsec deeper">
          <summary>Fördjupning: Pelles öltypskort</summary>
          {cards[0].intro && <p>{cards[0].intro}</p>}
          {cards.length > 1 && (
            <div className="boxseg small ctabs" role="tablist">{cards.map((c, i) => <button key={i} type="button" role="tab" aria-selected={ci === i} onClick={() => setCi(i)}>{c.name}</button>)}</div>
          )}
          <Card c={cards[Math.min(ci, cards.length - 1)]} />
          <p className="src">Ur Allt om Öls öltypskort 2010–2011</p>
        </details>
      )}
    </article>
  );
}
