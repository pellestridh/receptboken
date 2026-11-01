"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { accentVar } from "@/lib/format";
import BeerMap from "@/components/BeerMap";
import { Glass, Stats } from "@/components/BeerBits";
import { styleByKey, familyName, STYLES } from "@/data/beer";

const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
const KIND = { ale: "Överjäst", lager: "Underjäst", spontan: "Spontanjäst", hybrid: "Lagerjäst vid överjäsningstemperatur" };

export default function StylePage() {
  const { key } = useParams();
  const s = styleByKey(key);
  const [usage, setUsage] = useState({});
  useEffect(() => { api("/api/beer-usage").then((d) => setUsage(d.usage || {})).catch(() => {}); }, []);
  if (!s) return <div className="narrow"><div className="empty">Den ölstilen finns inte. <Link href="/dryck?vy=stilar">Alla stilar</Link></div></div>;
  const recs = usage[s.key] || [];
  const same = STYLES.filter((x) => x.family === s.family && x.key !== s.key);

  return (
    <article className="narrow bstyle">
      <header className="bhead">
        <Glass s={s} size={72} />
        <div>
          <span className="kicker"><Link href="/dryck?vy=stilar">{familyName(s.family)}</Link> · {KIND[s.kind]}</span>
          <h1>{s.name}</h1>
          <p className="muted" style={{ margin: 0 }}>Servering {s.temp}</p>
        </div>
      </header>
      <Stats s={s} />

      <section className="bsec">
        <h2>Om stilen</h2>
        <p>{s.about}</p>
        <p className="src">{s.src === "tillägg" ? "Tillägg, finns inte i Pelles material" : "Ur Pelles Ölkunskap och Liten Ölguide"}</p>
      </section>

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

      {same.length > 0 && (
        <section className="bsec">
          <h2>Samma familj</h2>
          <div className="frow">{same.map((x) => <Link key={x.key} className="chip blink" href={`/dryck/ol/${x.key}`}><Glass s={x} size={12} />{x.name}</Link>)}</div>
        </section>
      )}
    </article>
  );
}
