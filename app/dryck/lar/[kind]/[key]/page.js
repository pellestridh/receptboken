"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSettings } from "@/components/useSettings";
import { useApp } from "@/components/Providers";
import { SCHOOL, lessonFor } from "@/data/school";
import { DIMS, grapeByKey } from "@/data/wine";
import { BEER_DIMS } from "@/data/beerSchool";
import { PRINCIPLES } from "@/data/beer";
import { ProfileBars, swatch } from "@/components/Wine";
import AromaWheel from "@/components/AromaWheel";

export default function Lesson() {
  const { kind: slug, key } = useParams();
  const kind = slug === "ol" ? "beer" : "wine";
  const S = SCHOOL[kind];
  const l = lessonFor(kind, key);
  const { toast } = useApp();
  const [settings, save] = useSettings();
  const [ans, setAns] = useState({});
  const home = `/dryck?typ=${slug}&vy=lar`;
  if (!l) return <div className="narrow"><div className="empty">Lektionen finns inte. <Link href={home}>Tillbaka</Link></div></div>;
  const prog = settings[S.progressKey]?.[l.key];
  const answered = Object.keys(ans).length;
  const right = l.quiz.filter((q, i) => ans[i] === q.c).length;
  const idx = S.lessons.findIndex((x) => x.key === l.key);
  const next = S.lessons[idx + 1];
  const finish = () => save({ [S.progressKey]: { [l.key]: { done: true, quiz: right } } }).then(() => toast(next ? "Bra jobbat. Nästa lektion väntar." : "Hela kursen klar.")).catch((e) => toast(e.message));
  const D = kind === "beer" ? BEER_DIMS : DIMS;

  return (
    <article className={"narrow lessonpg " + kind}>
      <span className="kicker"><Link href={home}>{kind === "beer" ? "Ölskolan" : "Vinskolan"}</Link> · {l.level === "fordjupning" ? "Fördjupning" : "Grundkurs"} · Lektion {l.n} av {S.lessons.length}</span>
      <h1>{l.title}</h1>
      <p className="lead">{l.short}</p>

      {l.wheel && <section className="bsec"><h2>Doftcirkeln</h2><p>{l.wheel}</p><AromaWheel kind={kind} /></section>}

      {l.body.map((b) => <section key={b.h} className="bsec"><h2>{b.h}</h2><p>{b.t}</p></section>)}

      {(l.dims || l.key === "prova" && kind === "beer") && <section className="bsec"><h2>Känn efter</h2><div className="dimcards">{D.map((d) => (
        <div key={d.key} className="card2"><h3>{d.name}</h3><p className="dscale"><span>{d.lo}</span><i /><span>{d.hi}</span></p><p>{d.how}</p></div>
      ))}</div></section>}

      {l.grapes && <section className="bsec"><h2>Druvorna</h2><div className="gcards">{l.grapes.map((k) => { const g = grapeByKey(k); return (
        <Link key={k} href={`/dryck/vin/druva/${k}`} className="gcard"><div className="gcard-h"><i className="sw big" style={{ "--sw": swatch(g.color) }} /><b>{g.name}</b></div><ProfileBars p={g.p} /><p className="muted">{g.smell}</p></Link>
      ); })}</div></section>}

      {l.rules && <section className="bsec"><h2>Reglerna</h2><ol className="rules">{l.rules.map((r) => <li key={r.t}><b>{r.t}</b><span>{r.d}</span></li>)}</ol></section>}
      {l.principles && <section className="bsec"><h2>Pelles sex tumregler</h2><ol className="rules">{PRINCIPLES.tips.map((r) => <li key={r.t}><b>{r.t}</b><span>{r.d}</span></li>)}</ol></section>}
      {l.table && <section className="bsec"><h2>På etiketten står …</h2><div className="ctable">{l.table.map(([a, b]) => <div key={a}><b>{a}</b><span>{b}</span></div>)}</div></section>}
      {l.links && <section className="bsec"><div className="frow">{l.links.map(([t, h]) => <Link key={h} className="chip" href={h.replace("/dryck?vy=", "/dryck?typ=ol&vy=")}>{t} ›</Link>)}</div></section>}

      <section className="bsec exercise"><h2>Övning vid middagen</h2><p>{l.exercise}</p><p><Link href={`/dryck?typ=${slug}&vy=provat`}>{kind === "beer" ? "Logga en öl ›" : "Logga ett vin ›"}</Link></p></section>

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
        {next && <Link className="btn ghost" href={`/dryck/lar/${slug}/${next.key}`}>Nästa: {next.title}</Link>}
      </div>
    </article>
  );
}
