"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { accentVar } from "@/lib/format";
import BeerMap from "@/components/BeerMap";
import { Glass, Stats } from "@/components/BeerBits";
import { styleByKey, familyName, STYLES, childrenOf, ALL_STYLES } from "@/data/beer";
import { cardsFor } from "@/data/beerCards";
import { beerProfile } from "@/data/beerSchool";
import { spectrumFor } from "@/data/beerSpectrum";
import { ProfileBars, WineNote, itemFor } from "@/components/Wine";

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
  if (!s) return <div className="narrow"><div className="empty">Den ölstilen finns inte. <Link href="/dryck?typ=ol&vy=kort">Alla stilar</Link></div></div>;
  const recs = usage[s.key] || [];
  const cards = [s.key, ...childrenOf(s.key)].flatMap(cardsFor);
  const covers = childrenOf(s.key).map((k) => ALL_STYLES.find((x) => x.key === k)?.name).filter(Boolean);
  const c0 = cards[0];
  const st = c0 ? { ...s, ibu: range(c0.ibu) || s.ibu, ebc: range(c0.ebc) || s.ebc, abv: range(c0.abv) || s.abv } : s;
  const same = STYLES.filter((x) => x.family === s.family && x.key !== s.key);

  return (
    <article className="narrow bstyle">
      <header className="bhead">
        <Glass s={s} size={72} />
        <div>
          <span className="kicker"><Link href="/dryck?typ=ol&vy=kort">{familyName(s.family)}</Link> · {KIND[s.kind]}</span>
          <h1>{s.name}</h1>
          <p className="muted" style={{ margin: 0 }}>Servering {s.temp}</p>
        </div>
      </header>
      <Stats s={st} />
      <div className="stats" style={{ marginTop: ".6rem" }}><ProfileBars p={beerProfile(s)} kind="beer" /></div>

      <section className="bsec">
        <h2>Om stilen</h2>
        <p>{s.about}</p>
        {spectrumFor(s.key) && <p className="sline"><b>Smakprofil</b>{spectrumFor(s.key).d}</p>}
        {covers.length > 0 && <p className="muted">Hit räknas också {covers.join(", ").replace(/, ([^,]*)$/, " och $1").toLowerCase()}.</p>}
        <p className="src">{s.src === "tillägg" ? "Tillägg, finns inte i Pelles material" : "Ur Pelles Ölkunskap och Liten Ölguide"}</p>
      </section>

      {cards.length > 0 && (
        <section className="bsec">
          <h2>Pelles öltypskort</h2>
          {cards[0].intro && <p>{cards[0].intro}</p>}
          {cards.length > 1 && (
            <div className="boxseg small ctabs" role="tablist">{cards.map((c, i) => <button key={i} type="button" role="tab" aria-selected={ci === i} onClick={() => setCi(i)}>{c.name}</button>)}</div>
          )}
          <Card c={cards[Math.min(ci, cards.length - 1)]} />
          <p className="src">Ur Allt om Öls öltypskort 2010–2011</p>
        </section>
      )}

      <section className="bsec food">
        <h2>Passar till</h2>
        <ul className="ticks">{s.food.map((f) => <li key={f}>{f}</li>)}</ul>
        <div className="becau"><h3>Därför</h3><p>{s.why}</p></div>
        <div className="duo">
          {s.cheese && <div className="card2"><h3>Ost</h3><p>{s.cheese}</p></div>}
          {s.dessert && <div className="card2"><h3>Dessert</h3><p>{s.dessert}</p></div>}
        </div>
      </section>

      {recs.length > 0 && (
        <section className="bsec">
          <h2>I era recept</h2>
          <div className="rail small">
            {recs.map((r) => (
              <Link key={r.id} href={`/recept/${r.id}`} className="wday" style={{ "--rc": accentVar(r.accent) }}>
                <div className="wimg">{r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}</div>
                <div className="wtxt"><span>{r.how === "ert val" ? "Ert val" : r.how === "alternativ" ? "Alternativ" : "Föreslagen"}</span><b>{r.title}</b></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {s.examples?.length > 0 && (
        <section className="bsec">
          <h2>Klassiska exempel</h2>
          <div className="frow">{s.examples.map((e) => <a key={e} className="chip" href={sb(e)} target="_blank" rel="noopener noreferrer">{e}</a>)}</div>
          <p className="hint">Länkarna söker på Systembolaget.</p>
        </section>
      )}

      {s.map && (
        <section className="bsec">
          <h2>På kartan</h2>
          <BeerMap usage={usage} focus={s.key} compact />
        </section>
      )}

      <section className="bsec"><h2>Era provningar</h2>
        {(() => { const mine = notes.filter((n) => itemFor("beer", `${n.style || ""} ${n.wine}`, n.grape)?.key === s.key); return mine.length
          ? <div className="wnotes">{mine.map((n) => <WineNote key={n.id} n={n} />)}</div>
          : <p className="muted">Ni har inte loggat någon {s.name.toLowerCase()} än. <Link href="/dryck?typ=ol&vy=provat">Logga en öl ›</Link></p>; })()}
      </section>

      {same.length > 0 && (
        <section className="bsec">
          <h2>Samma familj</h2>
          <div className="frow">{same.map((x) => <Link key={x.key} className="chip blink" href={`/dryck/ol/${x.key}`}><Glass s={x} size={12} />{x.name}</Link>)}</div>
        </section>
      )}
    </article>
  );
}
