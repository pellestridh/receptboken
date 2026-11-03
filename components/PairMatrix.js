"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import { WINE_TYPES, BEER_TYPES, MATRIX } from "@/data/pairMatrix";
import { DISH_PAIRS } from "@/data/pairings";
import { CHEESE_BOTH, DESSERT_BOTH } from "@/data/wineExtra";
import { styleByKey, styleColor } from "@/data/beer";
import { grapeByKey } from "@/data/wine";
import { swatch } from "@/components/Wine";

function Pick({ kind, k, label }) {
  if (kind === "beer") { const s = styleByKey(k); return s ? <Link className="pmchip" href={`/dryck/ol/${s.key}`}><i style={{ background: styleColor(s) }} />{s.short || s.name}</Link> : null; }
  const g = grapeByKey(k); return g ? <Link className="pmchip" href={`/dryck/vin/druva/${k}`}><i style={{ background: swatch(g.color) }} />{label || g.name}</Link> : null;
}

function Detail({ kind, row }) {
  const beer = kind === "beer";
  if (row.dish) {
    const d = DISH_PAIRS.find((x) => x.dish === row.dish);
    return d ? <><div className="pmchips">{d[kind].map((k) => <Pick key={k} kind={kind} k={k} />)}</div><p>{d.why[kind]}</p></> : null;
  }
  const list = row.cheese ? CHEESE_BOTH.filter((x) => x.cat === row.cheese) : DESSERT_BOTH.filter((x) => x.cat === row.dessert);
  return (
    <ul className="pmlist">{list.map((x) => (
      <li key={x.cheese || x.dessert}>
        <b>{x.cheese || x.dessert}{x.own && <span className="owntag">Er favorit</span>}</b>
        <span className="pmchips">{beer ? x.beers.map((k) => <Pick key={k} kind="beer" k={k} />) : <Pick kind="wine" k={x.wineKey} label={x.wine} />}</span>
        {(beer ? x.why : x.whyWine) && <p className="muted">{beer ? x.why : x.whyWine}</p>}
      </li>
    ))}</ul>
  );
}

// Mat mot dryck i ett rutnät: liten prick passar, stor prick passar riktigt bra. Tryck på en rad för tipsen.
export default function PairMatrix({ kind }) {
  const types = kind === "beer" ? BEER_TYPES : WINE_TYPES;
  const [open, setOpen] = useState(null);
  return (
    <div className="pmwrap">
      <table className={"pm " + kind}>
        <thead>
          <tr><th className="pmcorner"><span className="muted">Tryck på en rad</span></th>{types.map((t) => (
            <th key={t.key} className="pmh"><span className="pmbottle" style={{ background: t.color }} /><span className="pmhl">{t.name}</span></th>
          ))}</tr>
        </thead>
        <tbody>
          {MATRIX.map((g) => (
            <Fragment key={g.group}>
              <tr className="pmgroup"><th colSpan={types.length + 1}>{g.group}</th></tr>
              {g.rows.map((r) => {
                const on = open === r.key;
                return (
                  <Fragment key={r.key}>
                    <tr className={"pmrow" + (on ? " on" : "")} onClick={() => setOpen(on ? null : r.key)}>
                      <th><button type="button" aria-expanded={on}><span className="pmi" aria-hidden="true">{r.icon}</span>{r.name}</button></th>
                      {r[kind].map((v, i) => <td key={i}>{v > 0 && <i className={"pmdot" + (v > 1 ? " big" : "")} style={{ background: types[i].color }} title={`${types[i].name}: ${v > 1 ? "passar riktigt bra" : "passar"}`} />}</td>)}
                    </tr>
                    {on && <tr className="pmdetail"><td colSpan={types.length + 1}><Detail kind={kind} row={r} /></td></tr>}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
      <p className="pmkey muted"><i className="pmdot" /> passar <i className="pmdot big" /> passar riktigt bra</p>
      <div className="pmlegend">{types.map((t) => (
        <div key={t.key} className="pmleg"><b><span className="pmbottle sm" style={{ background: t.color }} />{t.name}</b><span className="pmchips">{t.items.map((k) => <Pick key={k} kind={kind} k={k} />)}</span></div>
      ))}</div>
    </div>
  );
}
