"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";

// Kopierar receptet till ett annat hushåll, till exempel barnens.
export default function ShareRecipe({ id }) {
  const { toast } = useApp();
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
    if (!list) api("/api/households").then((d) => setList(d.households.filter((h) => h.id !== d.current))).catch(() => setList([]));
  };
  const share = (h) => api(`/api/recipes/${id}/share`, { method: "POST", json: { to: h.id } })
    .then((d) => { toast(`Kopierat till ${d.to}`); setOpen(false); }).catch((e) => toast(e.message));
  return (
    <span className="sharewrap">
      <button className="chip tool" type="button" aria-expanded={open} onClick={toggle}>Dela</button>
      {open && (
        <span className="sharemenu">
          {list === null ? <span className="muted">Hämtar …</span>
            : list.length ? list.map((h) => <button key={h.id} type="button" onClick={() => share(h)}>Kopiera till {h.name}</button>)
            : <span className="muted">Inga andra hushåll än. Lägg till under Inställningar.</span>}
        </span>
      )}
    </span>
  );
}
