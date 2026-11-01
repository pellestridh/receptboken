"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { grapeByKey, grapeFor, tasteProfile } from "@/data/wine";
import { ProfileBars, WineNote, swatch } from "@/components/Wine";

const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
const CN = { vitt: "Vitt", rott: "Rött", "rosé": "Rosé", mousserande: "Mousserande", "sött": "Sött och starkt" };

export default function Grape() {
  const { key } = useParams();
  const g = grapeByKey(key);
  const [notes, setNotes] = useState([]);
  useEffect(() => { api("/api/wine-notes").then((d) => setNotes(d.notes)).catch(() => {}); }, []);
  if (!g) return <div className="narrow"><div className="empty">Druvan finns inte. <Link href="/dryck/vin">Vinskolan</Link></div></div>;
  const mine = notes.filter((n) => (n.grape || grapeFor(`${n.wine} ${n.style}`)?.key) === g.key);
  const prof = tasteProfile(notes);

  return (
    <article className="narrow bstyle">
      <header className="bhead">
        <span className="wglass" style={{ "--sw": swatch(g.color) }} />
        <div><span className="kicker"><Link href="/dryck/vin">Vinskolan</Link> · {CN[g.color]}</span><h1>{g.name}</h1><p className="muted" style={{ margin: 0 }}>{g.where}</p></div>
      </header>
      <div className="stats"><ProfileBars p={g.p} compare={prof?.avg} />{prof && <p className="hint">Strecket visar er smakprofil.</p>}</div>
      <section className="bsec"><h2>Om druvan</h2><p>{g.about}</p></section>
      <section className="bsec"><h2>Doft och smak</h2><p>{g.smell}</p></section>
      <section className="bsec food"><h2>Passar till</h2><div className="becau"><p>{g.food}</p></div></section>
      <section className="bsec"><h2>Leta efter på etiketten</h2>
        <div className="frow">{g.label.map((l) => <a key={l} className="chip" href={sb(l)} target="_blank" rel="noopener noreferrer">{l}</a>)}</div>
        <p className="hint">Länkarna söker på Systembolaget.</p>
      </section>
      <section className="bsec"><h2>Gillar ni {g.name.split(" ")[0]}, prova</h2>
        <div className="frow">{g.next.map((k) => { const x = grapeByKey(k); return <Link key={k} className="chip blink" href={`/dryck/vin/druva/${k}`}><i className="sw" style={{ "--sw": swatch(x.color) }} />{x.name}</Link>; })}</div>
      </section>
      <section className="bsec"><h2>Era provningar</h2>
        {mine.length ? <div className="wnotes">{mine.map((n) => <WineNote key={n.id} n={n} />)}</div> : <p className="muted">Ni har inte loggat någon {g.name} än.</p>}
      </section>
    </article>
  );
}
