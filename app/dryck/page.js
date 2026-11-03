"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { useSettings } from "@/components/useSettings";
import BeerMap from "@/components/BeerMap";
import WineMap from "@/components/WineMap";
import BeerTree from "@/components/BeerTree";
import { StyleRow, Glass } from "@/components/BeerBits";
import { WineLog, WineNote, ProfileBars, swatch, profileOf } from "@/components/Wine";
import { STYLES, FAMILIES, PRINCIPLES, styleByKey } from "@/data/beer";
import { GRAPES, grapeByKey } from "@/data/wine";
import { WINE_TREE, WINE_PRINCIPLES, CHEESE_BOTH, DESSERT_BOTH } from "@/data/wineExtra";
import { SCHOOL } from "@/data/school";
import { beerProfile } from "@/data/beerSchool";

const VIEWS = [["lar", "Lär dig"], ["karta", "Kartan"], ["trad", "Översikten"], ["kort", "Korten"], ["mat", "Till maten"], ["provat", "Provat"]];
const OLD = { stilar: "kort", ost: "mat", dessert: "mat" };
const KINDS = { ol: "beer", vin: "wine" };

function BeerLink({ k }) {
  const s = styleByKey(k);
  return s ? <Link className="blink" href={`/dryck/ol/${k}`}><Glass s={s} size={14} />{s.name}</Link> : null;
}
function WineLink({ k, label }) {
  const g = grapeByKey(k);
  return g ? <Link className="blink wine" href={`/dryck/vin/druva/${k}`}><i className="sw" style={{ "--sw": swatch(g.color) }} />{label || g.name}</Link> : <span>{label}</span>;
}

function School({ kind }) {
  const [settings] = useSettings();
  const S = SCHOOL[kind];
  const prog = settings[S.progressKey] || {};
  const done = S.lessons.filter((l) => prog[l.key]?.done).length;
  const next = S.lessons.find((l) => !prog[l.key]?.done);
  const slug = kind === "beer" ? "ol" : "vin";
  return (
    <section className="dsec">
      <div className="progress panel">
        <div className="prog-h"><b>{done} av {S.lessons.length} lektioner</b>{next && <Link className="btn" href={`/dryck/lar/${slug}/${next.key}`}>{done ? "Fortsätt" : "Börja"}: {next.title}</Link>}</div>
        <div className={"prog-bar " + kind}><span style={{ width: `${(done / S.lessons.length) * 100}%` }} /></div>
      </div>
      {[["grund", "Grundkurs"], ["fordjupning", "Fördjupning"]].map(([lv, name]) => (
        <div key={lv}>
          <h2 className="lvl">{name}</h2>
          <div className="lessons">{S.lessons.filter((l) => l.level === lv).map((l) => (
            <Link key={l.key} href={`/dryck/lar/${slug}/${l.key}`} className={"lesson " + kind + (prog[l.key]?.done ? " done" : "")}>
              <span className="ln">{prog[l.key]?.done ? "✓" : l.n}</span>
              <span className="lt"><b>{l.title}</b><span className="muted">{l.short}</span></span>
            </Link>
          ))}</div>
        </div>
      ))}
      {kind === "beer" && <p className="src">Kursen bygger på Pelles material: Ölkunskap, Liten Ölguide, Humle – Ölets vindruva och Allt om Öl och Mat.</p>}
    </section>
  );
}

function Principles({ kind }) {
  const P = kind === "beer" ? PRINCIPLES : WINE_PRINCIPLES;
  return (
    <section className="dsec prose">
      <p className="lead">{P.intro}</p>
      <div className="duo">{P.strengths.map((t) => <div key={t} className={"bigfact " + kind}>{t}</div>)}</div>
      <h2>Sex tumregler</h2>
      <ol className="rules">{P.tips.map((x) => <li key={x.t}><b>{x.t}</b><span>{x.d}</span></li>)}</ol>
      <h2>Harmoniera eller kontrastera</h2>
      <div className="duo">{P.ways.map((x) => <div key={x.t} className="card2"><h3>{x.t}</h3><p>{x.d}</p></div>)}</div>
      {kind === "beer" && P.tastes && (
        <>
          <h2>Grundsmakerna</h2>
          <div className="tastes">{P.tastes.map((x) => <div key={x.t} className={"taste t-" + x.t.toLowerCase()}><h3>{x.t}</h3><ul>{x.d.map((d) => <li key={d}>{d}</li>)}</ul></div>)}</div>
        </>
      )}
      <h2>Ost och dessert, öl och vin</h2>
      <p className="hint">Samma ost eller dessert med ett vin och en öl, så att ni kan jämföra.</p>
      <div className="both">
        <div className="both-h"><span /><span>Vin</span><span>Öl</span></div>
        {CHEESE_BOTH.map((x) => (
          <div key={x.cheese} className={"both-r" + (x.own ? " own" : "")}><b>{x.cheese}{x.own && <span className="owntag">Er favorit</span>}</b><WineLink k={x.wineKey} label={x.wine} /><span className="blinks">{x.beers.map((k) => <BeerLink key={k} k={k} />)}</span><p>{x.why}</p></div>
        ))}
        {DESSERT_BOTH.map((x) => (
          <div key={x.dessert} className="both-r dess"><b>{x.dessert}</b><WineLink k={x.wineKey} label={x.wine} /><span className="blinks">{x.beers.map((k) => <BeerLink key={k} k={k} />)}</span></div>
        ))}
      </div>
    </section>
  );
}

function Cards({ kind, usage }) {
  if (kind === "beer") return (
    <section className="dsec">
      {FAMILIES.map((f) => {
        const list = STYLES.filter((s) => s.family === f.key);
        return list.length ? <div key={f.key} className="fam"><h2>{f.name}</h2><div className="srows">{list.map((s) => <StyleRow key={s.key} s={s} uses={(usage[s.key] || []).length} />)}</div></div> : null;
      })}
    </section>
  );
  const groups = WINE_TREE.flatMap((root) => root.c.map((c) => ({ name: `${root.n}: ${c.n.toLowerCase()}`, keys: [...new Set((c.c.length ? c.c : [c]).map((x) => x.k).filter(Boolean))] })));
  return (
    <section className="dsec">
      {groups.map((g) => (
        <div key={g.name} className="fam"><h2>{g.name[0].toUpperCase() + g.name.slice(1)}</h2>
          <div className="srows">{g.keys.map((k) => { const x = grapeByKey(k); const u = (usage[k] || []).length; return (
            <Link key={k} href={`/dryck/vin/druva/${k}`} className="srow">
              <span className="wglass sm" style={{ "--sw": swatch(x.color) }} />
              <span className="st"><b>{x.name}</b><span className="muted">{x.food.split(".")[0]}</span></span>
              {u > 0 && <span className="uses">{u} recept</span>}
              <span className="go">›</span>
            </Link>
          ); })}</div>
        </div>
      ))}
    </section>
  );
}

function Tasted({ kind }) {
  const { toast } = useApp();
  const [notes, setNotes] = useState(null);
  const [logging, setLogging] = useState(false);
  const [sort, setSort] = useState("new");
  useEffect(() => { api(`/api/wine-notes?typ=${kind}`).then((d) => setNotes(d.notes)).catch(() => setNotes([])); }, [kind]);
  const beer = kind === "beer";
  const cands = beer ? STYLES.map((s) => ({ key: s.key, name: s.name, p: beerProfile(s), href: `/dryck/ol/${s.key}` })) : GRAPES.map((g) => ({ key: g.key, name: g.name, p: g.p, href: `/dryck/vin/druva/${g.key}` }));
  const prof = notes ? profileOf(kind, notes, cands) : null;
  const list = (notes || []).slice().sort((a, b) => sort === "best" ? (b.rating || 0) - (a.rating || 0) : 0);
  const del = (id) => api(`/api/wine-notes/${id}`, { method: "DELETE" }).then(() => setNotes((n) => n.filter((x) => x.id !== id))).catch((e) => toast(e.message));
  return (
    <section className="dsec">
      <div className="section-h" style={{ margin: 0 }}><h2>{beer ? "Provade öl" : "Provade viner"}</h2><button className="btn" type="button" onClick={() => setLogging(true)}>{beer ? "Logga en öl" : "Logga ett vin"}</button></div>
      {logging && <div className="panel"><WineLog kind={kind} onSaved={(n) => setNotes(n)} onCancel={() => setLogging(false)} /></div>}
      {notes && !notes.length && !logging && <div className="empty">Inget loggat än. Logga här, eller direkt från ett recept under Att dricka till.</div>}
      {notes?.length > 1 && <div className="frow">{[["new", "Senaste"], ["best", "Bäst betyg"]].map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={sort === v} onClick={() => setSort(v)}>{l}</button>)}</div>}
      <div className="wnotes">{list.map((n) => <WineNote key={n.id} n={n} onDelete={del} />)}</div>
      <h2 style={{ marginTop: "1rem" }}>Er smakprofil</h2>
      {!prof?.liked ? <p className="muted">Profilen byggs av det ni gett fyra eller fem stjärnor och där ni fyllt i Känn efter.</p> : (
        <div className="duo">
          <div className="card2"><h3>Det ni gillar</h3><ProfileBars p={prof.avg} kind={kind} /><p className="hint">Av {prof.liked} med högt betyg.</p></div>
          <div className="card2">
            <h3>{beer ? "Era stilar" : "Era druvor"}</h3>
            {prof.ranked.length ? <ul className="glist">{prof.ranked.slice(0, 5).map((x) => <li key={x.it.key}><Link href={x.it.href}>{x.it.name}</Link> <span className="muted">{x.avg.toFixed(1).replace(".", ",")} av 5, {x.n} st</span></li>)}</ul> : <p className="muted">Inga igenkända än.</p>}
            {prof.suggest.length > 0 && <><h3 style={{ marginTop: ".8rem" }}>Prova härnäst</h3><p>{prof.suggest.map((c, i) => <span key={c.key}>{i > 0 && ", "}<Link href={c.href}>{c.name}</Link></span>)}</p><p className="hint">Liknar profilen men har inte provats.</p></>}
          </div>
        </div>
      )}
    </section>
  );
}

function Drinks() {
  const params = useSearchParams();
  const router = useRouter();
  const typ = params.get("typ") === "vin" ? "vin" : "ol";
  const kind = KINDS[typ];
  const raw = OLD[params.get("vy")] || params.get("vy");
  const view = VIEWS.some(([v]) => v === raw) ? raw : "lar";
  const [usage, setUsage] = useState({ beer: {}, wine: {} });
  useEffect(() => { api("/api/beer-usage").then((d) => setUsage({ beer: d.usage || {}, wine: d.wine || {} })).catch(() => {}); }, []);
  const go = (t, v) => router.replace(`/dryck?typ=${t}&vy=${v}`, { scroll: false });
  const u = usage[kind];

  return (
    <div className="narrow dryck">
      <div className="hero">
        <span className="kicker">Dryck</span>
        <h1>{kind === "beer" ? "Öl och mat" : "Vin och mat"}</h1>
        <p className="muted" style={{ margin: 0 }}>{kind === "beer" ? "Byggt på Pelles material: smakkartan, släktträdet, öltypskorten och texterna om öl och mat." : "Från grunden: druvor, smakstilar och vin till maten, med en provningslogg som lär sig vad ni gillar."}</p>
      </div>
      <div className="boxseg drinktabs" role="tablist">
        {[["ol", "Öl"], ["vin", "Vin"]].map(([t, l]) => <button key={t} type="button" role="tab" aria-selected={typ === t} onClick={() => go(t, view)}>{l}</button>)}
      </div>
      <div className="boxseg vtabs" role="tablist">
        {VIEWS.map(([v, l]) => <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => go(typ, v)}>{l}</button>)}
      </div>

      {view === "lar" && <School kind={kind} />}
      {view === "karta" && (
        <section className="dsec">
          {kind === "beer" && <p className="hint">Smakreferensen från Liten Ölguide. Vänster är fruktigt, höger maltigt, uppåt sött och nedåt beskt. Färgen är ölets färg. Tryck på en stil, eller välj en familj för att se namnen.</p>}
          {kind === "beer" ? <BeerMap usage={u} /> : <WineMap usage={u} />}
        </section>
      )}
      {view === "trad" && (
        <section className="dsec">
          <p className="hint">{kind === "beer" ? <>Pelles släktträd över ölstilarna, Allt om Ölstilar 2 från 2012: från jäsningssätt via familjer till stilar och exempel. <a href="/ol/allt-om-olstilar.jpg" target="_blank" rel="noopener noreferrer">Visa originalet</a>.</> : "Vinets släktträd: färg, stil och druvor, med områden att leta efter på etiketten."} Tryck på plus för att fälla ut, och på en färgad punkt för att öppna kortet.</p>
          <BeerTree usage={u} kind={kind} tree={kind === "wine" ? WINE_TREE : undefined} />
        </section>
      )}
      {view === "kort" && <Cards kind={kind} usage={u} />}
      {view === "mat" && <Principles kind={kind} />}
      {view === "provat" && <Tasted kind={kind} />}
    </div>
  );
}

export default function DrinkPage() {
  return <Suspense fallback={null}><Drinks /></Suspense>;
}
