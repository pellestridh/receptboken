"use client";
import Link from "next/link";
import { RELEASES, CURRENT } from "@/data/releases";
import { dateSv } from "@/lib/format";

const Part = ({ t, xs }) => xs?.length ? <div className="relpart"><h3>{t}</h3><ul>{xs.map((x) => <li key={x}>{x}</li>)}</ul></div> : null;

export default function Om() {
  return (
    <div className="narrow about">
      <span className="kicker"><Link href="/installningar">Inställningar</Link></span>
      <h1>Om Receptboken</h1>
      <p className="lead">Familjens receptsamling, med matsedlar, inköpslista, dryck till maten och en kurs i öl och vin. Byggd av Pelle tillsammans med Claude.</p>
      <div className="panel abouthead">
        <div><span className="muted">Version</span><b>{CURRENT.version}</b></div>
        <div><span className="muted">Uppdaterad</span><b>{dateSv(CURRENT.date)}</b></div>
      </div>
      <section className="bsec">
        <h2>Källor</h2>
        <p>Dryckesdelen bygger på Pelles eget material om öl (Ölkunskap, Liten Ölguide, Allt om Öl och Mat och öltypskorten), på Garrett Oliver om öl och mat och på sommeliererna Aldo Sohm, Jeannie Cho Lee och Rajat Parr. Näringsvärden kommer från Livsmedelsverket och erbjudanden från butikernas egna sidor.</p>
      </section>
      <section className="bsec">
        <h2>Versioner</h2>
        <div className="releases">{RELEASES.map((r) => (
          <article key={r.version} className="release">
            <header><b>Version {r.version}</b><span className="muted">{dateSv(r.date)}</span></header>
            <h3 className="reltitle">{r.title}</h3>
            <Part t="Nytt" xs={r.nytt} />
            <Part t="Bättre" xs={r.battre} />
            <Part t="Rättat" xs={r.rattat} />
          </article>
        ))}</div>
      </section>
    </div>
  );
}
