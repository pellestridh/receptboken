"use client";
import { useEffect, useMemo, useState } from "react";
import { api, lsGet, lsSet } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { AISLE_ORDER } from "@/lib/aisles";

const GROUPS = AISLE_ORDER.filter((a) => !["Baslistan", "Skafferi", "Egna varor"].includes(a));

// Baslistan: det ni brukar handla. Bocka i det som behövs och lägg i inköpslistan.
export default function Staples({ shopping = [], onAdded }) {
  const { toast } = useApp();
  const [d, setD] = useState(null);
  const [edit, setEdit] = useState(false);
  const [sort, setSort] = useState("grupp");
  const [add, setAdd] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setSort(lsGet("rb-staple-sort", "grupp")); api("/api/staples").then(setD).catch((e) => toast(e.message)); }, [toast]);
  const act = (json) => api("/api/staples", { method: "POST", json }).then((x) => { setD(x); return x; }).catch((e) => { toast(e.message); return null; });
  const staples = d?.staples || [];
  const onList = useMemo(() => new Set(shopping.filter((i) => !i.done).map((i) => i.name.toLowerCase())), [shopping]);
  const chosen = staples.filter((s) => s.selected && !onList.has(s.name.toLowerCase()));

  const toggle = (s) => {
    setD((x) => ({ ...x, staples: x.staples.map((y) => (y.id === s.id ? { ...y, selected: !y.selected } : y)) }));
    api("/api/staples", { method: "POST", json: { toggle: s.id, selected: !s.selected } }).catch(() => {});
  };
  const toList = async () => {
    setBusy(true);
    const x = await act({ toShopping: chosen.map((s) => s.id) });
    setBusy(false);
    if (x) { toast(`${chosen.length} ${chosen.length === 1 ? "vara" : "varor"} ligger i inköpslistan`); onAdded?.(); }
  };
  const submit = (e) => { e.preventDefault(); if (add.trim()) act({ add }).then((x) => x && setAdd("")); };
  const setSorting = (v) => { setSort(v); lsSet("rb-staple-sort", v); };

  const groups = sort === "az"
    ? [["", [...staples].sort((a, b) => a.name.localeCompare(b.name, "sv"))]]
    : [...new Set([...GROUPS, ...staples.map((s) => s.aisle)])].map((g) => [g, staples.filter((s) => s.aisle === g).sort((a, b) => a.name.localeCompare(b.name, "sv"))]).filter(([, xs]) => xs.length);

  return (
    <div className="staples">
      <p className="hint">Det ni brukar handla oavsett meny. Bocka i det som behövs, så läggs det i inköpslistan i rätt avdelning.</p>

      <form className="addrow" onSubmit={submit}>
        <input className="tin" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Lägg till i baslistan, t.ex. mjölk, kaffe" autoComplete="off" enterKeyHint="done" />
        <button className="btn" type="submit" disabled={!add.trim()}>Lägg till</button>
      </form>
      {d?.frequent?.length > 0 && (
        <div className="frow freq"><span className="muted">Ni köper ofta:</span>{d.frequent.map((n) => <button key={n} type="button" className="chip" onClick={() => act({ add: n })}>+ {n}</button>)}</div>
      )}

      {staples.length > 0 && (
        <div className="stbar">
          <div className="boxseg small" role="tablist">
            {[["grupp", "Varugrupper"], ["az", "A–Ö"]].map(([v, l]) => <button key={v} type="button" role="tab" aria-selected={sort === v} onClick={() => setSorting(v)}>{l}</button>)}
          </div>
          {edit
            ? <button className="btn" type="button" onClick={() => setEdit(false)}>Klar</button>
            : <button className="btn ghost" type="button" onClick={() => setEdit(true)}>Redigera</button>}
        </div>
      )}

      {!d && <div className="empty">Hämtar …</div>}
      {d && !staples.length && <div className="empty">Baslistan är tom. Skriv det ni brukar handla ovan, flera på en gång med kommatecken.</div>}

      {groups.map(([g, xs]) => (
        <div className="sgroup" key={g || "az"}>
          {g && <h2>{g}</h2>}
          <ul className="stlist">
            {xs.map((s) => {
              const there = onList.has(s.name.toLowerCase());
              return edit ? (
                <li key={s.id} className="strow edit">
                  <input className="tin" defaultValue={s.name} aria-label="Namn" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== s.name) act({ rename: s.id, name: v }); }} />
                  <select className="tin" value={s.aisle} aria-label="Varugrupp" onChange={(e) => act({ setAisle: s.id, aisle: e.target.value })}>
                    {[...new Set([...GROUPS, s.aisle])].map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button type="button" className="del" aria-label={`Ta bort ${s.name}`} onClick={() => act({ remove: s.id })}>✕</button>
                </li>
              ) : (
                <li key={s.id} className={"strow" + (s.selected && !there ? " on" : "") + (there ? " there" : "")}>
                  <button type="button" role="checkbox" aria-checked={!!s.selected && !there} disabled={there} onClick={() => toggle(s)}>
                    <span className="ck" aria-hidden="true">{s.selected && !there ? "✓" : ""}</span>
                    <span className="nm">{s.name}</span>
                    {there ? <span className="tag">I listan</span> : sort === "az" ? <span className="muted gr">{s.aisle}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!edit && chosen.length > 0 && (
        <div className="stickyact">
          <button className="btn big" type="button" disabled={busy} onClick={toList}>{busy ? "Lägger till …" : `Lägg ${chosen.length} ${chosen.length === 1 ? "vara" : "varor"} i inköpslistan`}</button>
          <button className="link" type="button" onClick={() => act({ selectNone: true })}>Avmarkera</button>
        </div>
      )}
    </div>
  );
}
