"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import BeerMap from "@/components/BeerMap";
import BeerTree from "@/components/BeerTree";
import { StyleRow, Glass } from "@/components/BeerBits";
import { STYLES, FAMILIES, PRINCIPLES, CHEESE, DESSERT, styleByKey } from "@/data/beer";

const VIEWS = [["karta", "Ölkartan"], ["trad", "Släktträdet"], ["stilar", "Stilarna"], ["mat", "Öl och mat"], ["ost", "Ost"], ["dessert", "Dessert"]];

function BeerLink({ k }) {
  const s = styleByKey(k);
  if (!s) return null;
  return <Link className="blink" href={`/dryck/ol/${k}`}><Glass s={s} size={14} />{s.name}</Link>;
}

function Drinks() {
  const params = useSearchParams();
  const router = useRouter();
  const view = VIEWS.some(([v]) => v === params.get("vy")) ? params.get("vy") : "karta";
  const [usage, setUsage] = useState({});
  useEffect(() => { api("/api/beer-usage").then((d) => setUsage(d.usage || {})).catch(() => {}); }, []);
  const go = (v) => router.replace(`/dryck?vy=${v}`, { scroll: false });
  const usedCount = Object.keys(usage).length;

  return (
    <div className="narrow dryck">
      <div className="hero">
        <span className="kicker">Dryck</span>
        <h1>Öl och mat</h1>
        <p className="muted" style={{ margin: 0 }}>Byggt på Pelles material: smakkartan, släktträdet, öltypskorten och texterna om öl och mat.</p>
      </div>
      <div className="boxseg vtabs" role="tablist">
        {VIEWS.map(([v, l]) => <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => go(v)}>{l}</button>)}
      </div>

      {view === "karta" && (
        <section className="dsec">
          <p className="hint">Smakreferensen från Liten Ölguide. Vänster är fruktigt, höger maltigt, uppåt sött och nedåt beskt. Färgen är ölets färg. {usedCount ? "Ringarna visar stilar som föreslagits till era recept." : ""} Tryck på en stil, eller välj en familj för att se namnen.</p>
          <BeerMap usage={usage} />
        </section>
      )}

      {view === "trad" && (
        <section className="dsec">
          <p className="hint">Pelles släktträd över ölstilarna, Allt om Ölstilar 2 från 2012: från jäsningssätt via familjer till stilar och exempel. Tryck på plus för att fälla ut, och på en stil med glas för att öppna stilkortet. <a href="/ol/allt-om-olstilar.jpg" target="_blank" rel="noopener noreferrer">Visa originalet</a>.</p>
          <BeerTree usage={usage} />
        </section>
      )}

      {view === "stilar" && (
        <section className="dsec">
          {FAMILIES.map((f) => {
            const list = STYLES.filter((s) => s.family === f.key);
            if (!list.length) return null;
            return (
              <div key={f.key} className="fam">
                <h2>{f.name}</h2>
                <div className="srows">{list.map((s) => <StyleRow key={s.key} s={s} uses={(usage[s.key] || []).length} />)}</div>
              </div>
            );
          })}
        </section>
      )}

      {view === "mat" && (
        <section className="dsec prose">
          <p className="lead">{PRINCIPLES.intro}</p>
          <div className="duo">{PRINCIPLES.strengths.map((t) => <div key={t} className="bigfact">{t}</div>)}</div>
          <h2>Sex tumregler</h2>
          <ol className="rules">{PRINCIPLES.tips.map((x) => <li key={x.t}><b>{x.t}</b><span>{x.d}</span></li>)}</ol>
          <h2>Harmoniera eller kontrastera</h2>
          <div className="duo">{PRINCIPLES.ways.map((x) => <div key={x.t} className="card2"><h3>{x.t}</h3><p>{x.d}</p></div>)}</div>
          <h2>Grundsmakerna</h2>
          <div className="tastes">{PRINCIPLES.tastes.map((x) => (
            <div key={x.t} className={"taste t-" + x.t.toLowerCase()}><h3>{x.t}</h3><ul>{x.d.map((d) => <li key={d}>{d}</li>)}</ul></div>
          ))}</div>
          <p className="hint">{PRINCIPLES.note}</p>
        </section>
      )}

      {view === "ost" && (
        <section className="dsec prose">
          <p className="lead">{CHEESE.intro}</p>
          <h2>Därför passar öl och ost</h2>
          <ul className="why">{CHEESE.why.map((t) => <li key={t}>{t}</li>)}</ul>
          <h2>Att tänka på</h2>
          <div className="duo three">{CHEESE.rules.map((x) => <div key={x.t} className="card2"><h3>{x.t}</h3><p>{x.d}</p></div>)}</div>
          <h2>Klassiska par</h2>
          <div className="pairs">{CHEESE.classics.map((x) => <div key={x.cheese + x.beer} className="pair"><b>{x.cheese}</b><BeerLink k={x.beer} /><p>{x.d}</p></div>)}</div>
          <h2>Ost per ölstil</h2>
          <div className="ctable">{STYLES.filter((s) => s.cheese).map((s) => <div key={s.key}><BeerLink k={s.key} /><span>{s.cheese}</span></div>)}</div>
        </section>
      )}

      {view === "dessert" && (
        <section className="dsec prose">
          <p className="lead">{DESSERT.intro}</p>
          <div className="duo three">{DESSERT.rules.map((x) => <div key={x.t} className="card2"><h3>{x.t}</h3><p>{x.d}</p></div>)}</div>
          <h2>Dessert och öl</h2>
          <div className="pairs">{DESSERT.pairs.map((x) => <div key={x.dessert} className="pair"><b>{x.dessert}</b><span className="blinks">{x.beers.map((k) => <BeerLink key={k} k={k} />)}</span></div>)}</div>
        </section>
      )}

      <div className="panel wine-soon">
        <h2 style={{ fontSize: "1.3rem" }}>Vin</h2>
        <p className="muted" style={{ margin: 0 }}>Vinskolan för nybörjare kommer här: druvor, smakprofiler och vin till maten, förklarat från grunden.</p>
      </div>
    </div>
  );
}

export default function DrinkPage() {
  return <Suspense fallback={null}><Drinks /></Suspense>;
}
