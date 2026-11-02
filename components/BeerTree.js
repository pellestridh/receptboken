"use client";
import { useState } from "react";
import Link from "next/link";
import { TREE } from "@/data/beerTree";
import { styleByKey, styleColor } from "@/data/beer";
import { grapeByKey } from "@/data/wine";
import { swatch } from "@/components/Wine";

const BEER = { tree: TREE, href: (k) => `/dryck/ol/${k}`, color: (k) => { const s = styleByKey(k); return s ? styleColor(s) : null; } };
const WINE = { href: (k) => `/dryck/vin/druva/${k}`, color: (k) => { const g = grapeByKey(k); return g ? swatch(g.color) : null; } };

function Node({ node, depth, usage, cfg }) {
  const [open, setOpen] = useState(depth < 1);
  const kids = node.c || [];
  const col = node.k ? cfg.color(node.k) : null;
  const u = node.k ? (usage[node.k] || []).length : 0;
  return (
    <li className={"tn d" + depth}>
      <div className="trow">
        {kids.length > 0
          ? <button type="button" className="tog" aria-expanded={open} aria-label={open ? "Fäll ihop" : "Fäll ut"} onClick={() => setOpen(!open)}>{open ? "−" : "+"}</button>
          : <span className="tog none" />}
        {col ? <Link href={cfg.href(node.k)} className="tname link"><i className="tdot" style={{ background: col }} />{node.n}</Link>
          : <button type="button" className="tname" onClick={() => kids.length && setOpen(!open)}>{node.n}</button>}
        {u > 0 && <span className="uses">{u}</span>}
        {node.ex?.length > 0 && <span className="tex">{node.ex.join(" · ")}</span>}
      </div>
      {open && kids.length > 0 && <ul>{kids.map((c) => <Node key={c.n} node={c} depth={depth + 1} usage={usage} cfg={cfg} />)}</ul>}
    </li>
  );
}

// Släktträd för öl (Pelles) eller vin. kind: "beer" | "wine"
export default function BeerTree({ usage = {}, kind = "beer", tree }) {
  const cfg = kind === "wine" ? { ...WINE, tree } : BEER;
  return (
    <div className={"btree" + (kind === "wine" ? " wtree" : "")}>
      {cfg.tree.map((root) => (
        <section key={root.n} className={"troot t-" + root.tone}>
          <h3>{root.n}</h3>
          <ul>{root.c.map((c) => <Node key={c.n} node={c} depth={0} usage={usage} cfg={cfg} />)}</ul>
        </section>
      ))}
    </div>
  );
}
