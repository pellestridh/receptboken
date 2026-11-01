"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSettings } from "@/components/useSettings";
import { useApp } from "@/components/Providers";
import { lessonByKey, LESSONS, DIMS, grapeByKey } from "@/data/wine";
import { ProfileBars, swatch } from "@/components/Wine";

export default function Lesson() {
  const { lektion } = useParams();
  const l = lessonByKey(lektion);
  const { toast } = useApp();
  const [settings, save] = useSettings();
  const [ans, setAns] = useState({});
  if (!l) return <div className="narrow"><div className="empty">Lektionen finns inte. <Link href="/dryck/vin">Vinskolan</Link></div></div>;
  const prog = settings.wineProgress?.[l.key];
  const answered = Object.keys(ans).length;
  const right = l.quiz.filter((q, i) => ans[i] === q.c).length;
  const next = LESSONS.find((x) => x.n === l.n + 1);
  const finish = () => save({ wineProgress: { [l.key]: { done: true, quiz: right } } }).then(() => toast(next ? "Bra jobbat. Nästa lektion väntar." : "Hela Vinskolan klar.")).catch((e) => toast(e.message));

  return (
    <article className="narrow lessonpg">
      <span className="kicker"><Link href="/dryck/vin">Vinskolan</Link> · Lektion {l.n} av {LESSONS.length}</span>
      <h1>{l.title}</h1>
      <p className="lead">{l.short}</p>

      {l.body.map((b) => <section key={b.h} className="bsec"><h2>{b.h}</h2><p>{b.t}</p></section>)}

      {l.dims && <section className="bsec"><div className="dimcards">{DIMS.map((d) => (
        <div key={d.key} className="card2"><h3>{d.name}</h3><p className="dscale"><span>{d.lo}</span><i /><span>{d.hi}</span></p><p>{d.how}</p></div>
      ))}</div></section>}

      {l.grapes && <section className="bsec"><h2>Druvorna</h2><div className="gcards">{l.grapes.map((k) => { const g = grapeByKey(k); return (
        <Link key={k} href={`/dryck/vin/druva/${k}`} className="gcard"><div className="gcard-h"><i className="sw big" style={{ "--sw": swatch(g.color) }} /><b>{g.name}</b></div><ProfileBars p={g.p} /><p className="muted">{g.smell}</p></Link>
      ); })}</div></section>}

      {l.rules && <section className="bsec"><h2>Reglerna</h2><ol className="rules">{l.rules.map((r) => <li key={r.t}><b>{r.t}</b><span>{r.d}</span></li>)}</ol></section>}

      {l.table && <section className="bsec"><h2>På etiketten står …</h2><div className="ctable">{l.table.map(([a, b]) => <div key={a}><b>{a}</b><span>{b}</span></div>)}</div></section>}

      <section className="bsec exercise"><h2>Övning vid middagen</h2><p>{l.exercise}</p><p><Link href="/dryck/vin">Logga ett vin ›</Link></p></section>

      <section className="bsec quiz">
        <h2>Testa er själva</h2>
        {l.quiz.map((q, i) => (
          <div key={i} className="qq">
            <p><b>{i + 1}. {q.q}</b></p>
            <div className="qa">{q.a.map((a, j) => {
              const picked = ans[i] === j, show = ans[i] != null;
              return <button key={j} type="button" className={"chip" + (show && j === q.c ? " right" : "") + (picked && j !== q.c ? " wrong" : "")} disabled={show} onClick={() => setAns({ ...ans, [i]: j })}>{a}</button>;
            })}</div>
          </div>
        ))}
        {answered === l.quiz.length && <p className="qres"><b>{right} av {l.quiz.length} rätt.</b> {right === l.quiz.length ? "Snyggt." : "Läs igenom en gång till, det sitter snart."}</p>}
      </section>

      <div className="arow" style={{ marginTop: "1.5rem" }}>
        {prog?.done ? <span className="muted">Klar {prog.quiz != null ? `· ${prog.quiz} av ${l.quiz.length} rätt` : ""}</span>
          : <button className="btn" type="button" onClick={finish}>Markera som klar</button>}
        {next && <Link className="btn ghost" href={`/dryck/vin/${next.key}`}>Nästa: {next.title}</Link>}
      </div>
    </article>
  );
}
