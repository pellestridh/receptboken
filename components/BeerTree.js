"use client";
import { useState } from "react";
import Link from "next/link";
import { TREE } from "@/data/beerTree";
import { styleByKey } from "@/data/beer";
import { Glass } from "@/components/BeerBits";

function Node({ node, depth, usage }) {
  const [open, setOpen] = useState(depth < 1);
  const s = node.k ? styleByKey(node.k) : null;
  const kids = node.c || [];
  const u = node.k ? (usage[node.k] || []).length : 0;
  return (
    <li className={"tn d" + depth}>
      <div className="trow">
        {kids.length > 0
          ? <button type="button" className="tog" aria-expanded={open} aria-label={open ? "Fäll ihop" : "Fäll ut"} onClick={() => setOpen(!open)}>{open ? "−" : "+"}</button>
          : <span className="tog none" />}
        {s ? <Link href={`/dryck/ol/${s.key}`} className="tname link"><Glass s={s} size={13} />{node.n}</Link>
          : <button type="button" className="tname" onClick={() => kids.length && setOpen(!open)}>{node.n}</button>}
        {u > 0 && <span className="uses">{u}</span>}
        {node.ex?.length > 0 && <span className="tex">{node.ex.join(" · ")}</span>}
      </div>
      {open && kids.length > 0 && <ul>{kids.map((c) => <Node key={c.n} node={c} depth={depth + 1} usage={usage} />)}</ul>}
    </li>
  );
}

export default function BeerTree({ usage = {} }) {
  return (
    <div className="btree">
      {TREE.map((root) => (
        <section key={root.n} className={"troot t-" + root.tone}>
          <h3>{root.n}</h3>
          <ul>{root.c.map((c) => <Node key={c.n} node={c} depth={0} usage={usage} />)}</ul>
        </section>
      ))}
    </div>
  );
}
