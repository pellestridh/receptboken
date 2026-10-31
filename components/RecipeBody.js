"use client";
import { useEffect, useState } from "react";
import { amtText, stepItem } from "@/lib/format";
import { lsGet, lsSet } from "@/lib/api";
import { useApp } from "@/components/Providers";

// Ingredienser och moment. interactive = bockbara rader och timers (kökläge).
export default function RecipeBody({ recipe, factor = 1, interactive = false, id }) {
  const { timers, toggleTimer, timerText } = useApp();
  const key = `rb-checks-${id}`;
  const [ck, setCk] = useState({ i: {}, s: {} });
  useEffect(() => { if (interactive) setCk(lsGet(key, { i: {}, s: {} })); }, [interactive, key]);
  const flip = (kind, k) => {
    const n = { ...ck, [kind]: { ...ck[kind], [k]: !ck[kind][k] } };
    setCk(n); lsSet(key, n);
  };
  const reset = () => { const n = { i: {}, s: {} }; setCk(n); lsSet(key, n); };
  const [tab, setTab] = useState("ing");

  return (
    <>
      <div className="seg" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "ing"} onClick={() => setTab("ing")}>Ingredienser</button>
        <button type="button" role="tab" aria-selected={tab === "steps"} onClick={() => { setTab("steps"); window.scrollTo({ top: Math.max(0, (document.querySelector(".seg")?.getBoundingClientRect().top || 0) + window.scrollY - 80) }); }}>Gör så här</button>
      </div>
      <div className="rmain" data-tab={tab}>
        <aside className="ingbox">
          <h2>Ingredienser</h2>
          {(recipe.groups || []).map((g, gi) => (
            <div className="grp" key={gi}>
              {g.name && <h3>{g.name}</h3>}
              <ul className="ing">
                {g.items.map((it, ii) => {
                  const k = `${gi}-${ii}`;
                  const txt = (<><span className="amt">{amtText(it, factor)}</span><span>{it.name}{it.note && <small>{it.note}</small>}</span></>);
                  return (
                    <li key={k}>
                      {interactive ? (
                        <label><input type="checkbox" checked={!!ck.i[k]} onChange={() => flip("i", k)} />{txt}</label>
                      ) : <div className="row">{txt}</div>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>
        <section>
          <ol className="steps">
            {(recipe.steps || []).map((s, si) => (
              <li className="step" key={si}>
                <div className="head"><span className="num">{si + 1}</span><h3>{s.title}{s.sub && <small>{s.sub}</small>}</h3></div>
                <ol>
                  {s.items.map((raw, ii) => {
                    const o = stepItem(raw), k = `${si}-${ii}`, tk = `${id}|${k}`;
                    const t = timers[tk];
                    const timer = o.timer ? (
                      <button type="button" className={"timer" + (t ? " run" : "") + (t?.ring ? " ring" : "")}
                        onClick={(e) => { e.stopPropagation(); if (interactive) toggleTimer(tk, o.timer, o.label || s.title); }}>
                        {timerText(tk, o.timer)}
                      </button>
                    ) : null;
                    return interactive ? (
                      <li key={k} className={"si" + (ck.s[k] ? " done" : "")} tabIndex={0}
                        onClick={() => flip("s", k)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip("s", k); } }}>
                        {o.t}{timer}
                      </li>
                    ) : <li key={k} className="si pv">{o.t}{timer}</li>;
                  })}
                </ol>
              </li>
            ))}
          </ol>
          {recipe.restaurantTips?.length > 0 && (
            <div className="tips resto"><h2>Som på restaurang</h2><ul>{recipe.restaurantTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          )}
          {recipe.tips?.length > 0 && (
            <div className="tips"><h2>Bra att veta</h2><ul>{recipe.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          )}
          {recipe.changes?.length > 0 && (
            <div className="tips"><h2>Ändrat från originalet</h2><ul>{recipe.changes.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          )}
          {interactive && <p style={{ marginTop: "1rem" }}><button className="link" type="button" onClick={reset}>Rensa alla bockar</button></p>}
        </section>
      </div>
    </>
  );
}
