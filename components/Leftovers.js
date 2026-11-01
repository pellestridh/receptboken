"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { leftovers } from "@/lib/leftovers";
import { mins } from "@/lib/format";

function Ideas({ p, menu }) {
  const { toast } = useApp();
  const [ideas, setIdeas] = useState(null);
  const [busy, setBusy] = useState(false);
  const ask = () => {
    setBusy(true);
    api("/api/leftover-ideas", { method: "POST", json: { ingredient: p.name, menu: menu.items.map((i) => i.title).filter(Boolean) } })
      .then((d) => setIdeas(d.ideas)).catch((e) => toast(e.message)).finally(() => setBusy(false));
  };
  if (!ideas) return <button type="button" className="link" disabled={busy} onClick={ask}>{busy ? "Claude funderar …" : `Be Claude om nya rätter med ${p.name.toLowerCase()}`}</button>;
  return (
    <div className="ideas">{ideas.map((x) => (
      <div key={x.title} className="idea">
        <b>{x.title}</b>{x.minutes ? <span className="muted"> · {mins(x.minutes)}</span> : null}
        {x.why && <p>{x.why}</p>}
        <Link className="link" href={`/nytt?ide=${encodeURIComponent(`Skriv ett komplett recept på ${x.title} för fyra personer. ${x.why} Använd ${p.name.toLowerCase()}.`)}`}>Skapa receptet ›</Link>
      </div>
    ))}</div>
  );
}

export default function Leftovers({ menu, recipes, setMenus }) {
  const { toast } = useApp();
  const items = useMemo(() => {
    const inMenu = menu.items.map((i) => recipes.find((r) => r.id === i.recipeId)).filter(Boolean);
    return leftovers(inMenu, recipes);
  }, [menu, recipes]);
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const add = (r) => api(`/api/menus/${menu.id}`, { method: "PATCH", json: { addItem: { day: menu.items.at(-1)?.day || null, nextDay: true, recipeId: r.id } } })
    .then((d) => { setMenus(d.menus); toast(`${r.title} ligger på menyn`); }).catch((e) => toast(e.message));
  const shown = open ? items : items.slice(0, 2);

  return (
    <div className="leftovers">
      <h3>Räcker till mer</h3>
      <p className="hint">Råvaror ni köper i större mängd än menyn behöver. Lägg till en rätt till som använder resten.</p>
      {shown.map((p) => (
        <div key={p.key} className="lo">
          <div className="lo-h"><b>{p.name}</b><span className="muted">används i {p.using.map((r) => r.title).join(" och ")}</span></div>
          {p.note && <p className="lo-n">{p.note}</p>}
          {p.cands.length > 0 && (
            <div className="lo-c">{p.cands.map((r) => (
              <span key={r.id} className="lo-r">
                <Link href={`/recept/${r.id}`}>{r.title}</Link>
                <button type="button" className="chip" onClick={() => add(r)}>+ Lägg till</button>
              </span>
            ))}</div>
          )}
          <Ideas p={p} menu={menu} />
        </div>
      ))}
      {items.length > 2 && <button type="button" className="link" onClick={() => setOpen(!open)}>{open ? "Visa färre" : `Visa ${items.length - 2} till`}</button>}
    </div>
  );
}
