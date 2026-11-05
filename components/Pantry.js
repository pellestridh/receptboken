"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { packFor } from "@/lib/packages";

const daysLeft = (d) => Math.ceil((new Date(d) - Date.now()) / 864e5);
const fmt = (q) => String(Math.round(q * 10) / 10).replace(".", ",");
export const whenText = (x) => {
  if (!x.useBy) return "";
  const d = daysLeft(x.useBy);
  if (x.frozen) return `i frysen, håller till ${new Date(x.useBy).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`;
  return d < 0 ? "bör ha använts" : d === 0 ? "använd i dag" : d === 1 ? "använd senast i morgon" : `använd inom ${d} dagar`;
};

// Recept som använder varan, de bäst betygsatta och längst sedan lagade först.
export function recipesFor(name, recipes, n = 3) {
  const p = packFor(name), w = name.toLowerCase().split(/[ ,]/)[0];
  const hit = (r) => { const h = `${r.title} ${r.ingredients}`.toLowerCase(); return p ? p.re.test(h) : h.includes(w); };
  return (recipes || []).filter((r) => hit(r) && !r.allergens?.hits?.length)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || String(a.lastCooked || "").localeCompare(String(b.lastCooked || ""))).slice(0, n);
}

// Kvar hemma: rester efter köp och det man själv lägger in. Används när nya varor läggs i inköpslistan.
export default function Pantry({ recipes }) {
  const { toast } = useApp();
  const [items, setItems] = useState(null);
  const [f, setF] = useState({ name: "", q: "", unit: "", frozen: false });
  useEffect(() => { api("/api/pantry").then((d) => setItems(d.items)).catch((e) => toast(e.message)); }, [toast]);
  const act = (id, json) => api(`/api/pantry/${id}`, { method: "POST", json }).then((d) => setItems(d.items)).catch((e) => toast(e.message));
  const add = (e) => { e.preventDefault(); api("/api/pantry", { method: "POST", json: { ...f, q: f.q === "" ? null : Number(String(f.q).replace(",", ".")) } }).then((d) => { setItems(d.items); setF({ name: "", q: "", unit: "", frozen: false }); }).catch((er) => toast(er.message)); };
  const fridge = (items || []).filter((x) => !x.frozen), frozen = (items || []).filter((x) => x.frozen);

  const Row = ({ x }) => {
    const d = x.useBy ? daysLeft(x.useBy) : 99;
    const sugg = recipesFor(x.name, recipes);
    return (
      <li className={"pnrow" + (!x.frozen && d <= 2 ? " soon" : "")}>
        <div className="pn-t">
          <b>{x.name}{x.q != null && <span className="muted"> {fmt(x.q)} {x.unit}</span>}</b>
          <span className="pn-w">{whenText(x)}</span>
          {sugg.length > 0 && !x.frozen && <span className="pn-s">Passar i {sugg.map((r, i) => <span key={r.id}>{i > 0 && ", "}<Link href={`/recept/${r.id}`}>{r.title}</Link></span>)}</span>}
        </div>
        <div className="pn-a">
          <button type="button" className="link" onClick={() => act(x.id, { freeze: !x.frozen })}>{x.frozen ? "Tina" : "Frys"}</button>
          <button type="button" className="link" onClick={() => act(x.id, { remove: true })}>Slut</button>
        </div>
      </li>
    );
  };

  return (
    <div className="pantry">
      <p className="hint">Det som blir kvar av förpackningarna när ni bockar av i inköpslistan hamnar här, med förslag på rätter. Det som finns här räknas av nästa gång ni lägger varor i inköpslistan.</p>
      <form className="pnadd" onSubmit={add}>
        <input className="tin" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Till exempel tomatsås" aria-label="Vara" />
        <input className="tin pnq" value={f.q} inputMode="decimal" onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Mängd" aria-label="Mängd" />
        <input className="tin pnu" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} placeholder="g, dl, burk" aria-label="Enhet" />
        <label className="pnf"><input type="checkbox" checked={f.frozen} onChange={(e) => setF({ ...f, frozen: e.target.checked })} /> I frysen</label>
        <button className="btn" type="submit" disabled={!f.name.trim()}>Lägg till</button>
      </form>
      {!items && <div className="empty">Hämtar …</div>}
      {items && !items.length && <div className="empty">Inget kvar hemma just nu.</div>}
      {fridge.length > 0 && <><h2 className="pnh">I kylen och skafferiet</h2><ul className="pnlist">{fridge.map((x) => <Row key={x.id} x={x} />)}</ul></>}
      {frozen.length > 0 && <><h2 className="pnh">I frysen</h2><ul className="pnlist">{frozen.map((x) => <Row key={x.id} x={x} />)}</ul></>}
    </div>
  );
}

// Startsidan: det som snart måste användas, med rätter.
export function UseSoon({ recipes }) {
  const [items, setItems] = useState([]);
  useEffect(() => { api("/api/pantry").then((d) => setItems(d.items || [])).catch(() => {}); }, []);
  const soon = items.filter((x) => !x.frozen && x.useBy && daysLeft(x.useBy) <= 3).slice(0, 3);
  if (!soon.length) return null;
  return (
    <section className="usesoon">
      <div className="section-h"><h2>Använd snart</h2><Link href="/inkop?vy=hemma" className="muted">Kvar hemma ›</Link></div>
      <ul>{soon.map((x) => { const r = recipesFor(x.name, recipes, 2); return (
        <li key={x.id}><b>{x.name}{x.q != null ? `, ${fmt(x.q)} ${x.unit}` : ""}</b> <span className="pn-w">{whenText(x)}</span>{r.length > 0 && <span className="pn-s">: {r.map((y, i) => <span key={y.id}>{i > 0 && " eller "}<Link href={`/recept/${y.id}`}>{y.title}</Link></span>)}</span>}</li>
      ); })}</ul>
    </section>
  );
}
