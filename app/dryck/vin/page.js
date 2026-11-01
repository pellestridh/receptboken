"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useSettings } from "@/components/useSettings";
import { useApp } from "@/components/Providers";
import { LESSONS, GRAPES, tasteProfile } from "@/data/wine";
import { WineLog, WineNote, ProfileBars, swatch } from "@/components/Wine";

export default function WineSchool() {
  const { toast } = useApp();
  const [settings] = useSettings();
  const [notes, setNotes] = useState(null);
  const [logging, setLogging] = useState(false);
  const [sort, setSort] = useState("new");
  useEffect(() => { api("/api/wine-notes").then((d) => setNotes(d.notes)).catch(() => setNotes([])); }, []);
  const prog = settings.wineProgress || {};
  const doneN = LESSONS.filter((l) => prog[l.key]?.done).length;
  const next = LESSONS.find((l) => !prog[l.key]?.done);
  const profile = notes ? tasteProfile(notes) : null;
  const list = (notes || []).slice().sort((a, b) => sort === "best" ? (b.rating || 0) - (a.rating || 0) : 0);
  const del = (id) => api(`/api/wine-notes/${id}`, { method: "DELETE" }).then(() => setNotes((n) => n.filter((x) => x.id !== id))).catch((e) => toast(e.message));

  return (
    <div className="narrow dryck">
      <div className="hero">
        <span className="kicker">Dryck</span>
        <h1>Vinskolan</h1>
        <p className="muted" style={{ margin: 0 }}>Sex korta lektioner, en övning vid middagsbordet till varje, och en provningslogg som lär sig vad ni gillar.</p>
      </div>
      <div className="boxseg vtabs drinktabs" role="tablist">
        <Link href="/dryck" role="tab" aria-selected="false">Öl</Link>
        <Link href="/dryck/vin" role="tab" aria-selected="true">Vin</Link>
      </div>

      <section className="progress panel">
        <div className="prog-h"><b>{doneN} av {LESSONS.length} lektioner</b>{next && <Link className="btn" href={`/dryck/vin/${next.key}`}>{doneN ? "Fortsätt" : "Börja"}: {next.title}</Link>}</div>
        <div className="prog-bar"><span style={{ width: `${(doneN / LESSONS.length) * 100}%` }} /></div>
      </section>

      <section className="lessons">
        {LESSONS.map((l) => (
          <Link key={l.key} href={`/dryck/vin/${l.key}`} className={"lesson" + (prog[l.key]?.done ? " done" : "")}>
            <span className="ln">{prog[l.key]?.done ? "✓" : l.n}</span>
            <span className="lt"><b>{l.title}</b><span className="muted">{l.short}</span></span>
          </Link>
        ))}
      </section>

      <section className="bsec">
        <div className="section-h" style={{ margin: 0 }}><h2>Provade viner</h2><button className="btn" type="button" onClick={() => setLogging(true)}>Logga ett vin</button></div>
        {logging && <div className="panel"><WineLog onSaved={(n) => setNotes(n)} onCancel={() => setLogging(false)} /></div>}
        {notes && !notes.length && !logging && <div className="empty">Inga viner loggade än. Logga nästa vin ni dricker, här eller direkt från ett recept under Att dricka till.</div>}
        {notes?.length > 1 && <div className="frow">{[["new", "Senaste"], ["best", "Bäst betyg"]].map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={sort === v} onClick={() => setSort(v)}>{l}</button>)}</div>}
        <div className="wnotes">{list.map((n) => <WineNote key={n.id} n={n} onDelete={del} />)}</div>
      </section>

      <section className="bsec">
        <h2>Er smakprofil</h2>
        {!profile ? <p className="muted">Profilen byggs av viner ni gett fyra eller fem stjärnor och där ni fyllt i Känn efter. Logga några viner så dyker den upp här.</p> : (
          <div className="duo">
            <div className="card2"><h3>Det ni gillar</h3><ProfileBars p={profile.avg} /><p className="hint">Av {profile.liked} {profile.liked === 1 ? "vin" : "viner"} med högt betyg.</p></div>
            <div className="card2">
              <h3>Era druvor</h3>
              {profile.ranked.length ? <ul className="glist">{profile.ranked.slice(0, 5).map((x) => <li key={x.g.key}><Link href={`/dryck/vin/druva/${x.g.key}`}>{x.g.name}</Link> <span className="muted">{x.avg.toFixed(1).replace(".", ",")} av 5, {x.n} st</span></li>)}</ul> : <p className="muted">Inga druvor igenkända än.</p>}
              {profile.suggest.length > 0 && <><h3 style={{ marginTop: ".8rem" }}>Prova härnäst</h3><p>{profile.suggest.map((g, i) => <span key={g.key}>{i > 0 && ", "}<Link href={`/dryck/vin/druva/${g.key}`}>{g.name}</Link></span>)}</p><p className="hint">Liknar profilen men har inte provats.</p></>}
            </div>
          </div>
        )}
      </section>

      <section className="bsec">
        <h2>Druvorna</h2>
        {[["vitt", "Vita"], ["rott", "Röda"], ["andra", "Mousserande, rosé och sött"]].map(([c, l]) => (
          <div key={c}><h3 className="gh">{l}</h3>
            <div className="frow">{GRAPES.filter((g) => c === "andra" ? !["vitt", "rott"].includes(g.color) : g.color === c).map((g) => (
              <Link key={g.key} href={`/dryck/vin/druva/${g.key}`} className="chip blink"><i className="sw" style={{ "--sw": swatch(g.color) }} />{g.name}</Link>
            ))}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
