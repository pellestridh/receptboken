"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";

export default function Households() {
  const { toast } = useApp();
  const [d, setD] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [arm, setArm] = useState(null);
  const [newCode, setNewCode] = useState({});
  useEffect(() => { api("/api/households").then(setD).catch(() => {}); }, []);
  if (!d) return null;
  const me = d.households.find((h) => h.id === d.current);
  const act = (json, msg) => api("/api/households", { method: "POST", json }).then((x) => { setD(x); toast(msg); }).catch((e) => toast(e.message));

  return (
    <div className="panel">
      <h2 style={{ fontSize: "1.4rem" }}>Hushåll</h2>
      <p className="hint">Du är inloggad i <b>{me?.name || d.current}</b>. Varje hushåll har egen familjekod, egna recept, menyer, inköpslista, allergier och provningar. Recept kan kopieras mellan hushåll med Dela på receptet.</p>
      {d.current === "hem" && (
        <>
          <ul className="nlist">
            {d.households.filter((h) => h.id !== "hem").map((h) => (
              <li key={h.id} className="hhrow">
                <b>{h.name}</b>
                <form className="arow" onSubmit={(e) => { e.preventDefault(); act({ id: h.id, code: newCode[h.id] }, "Ny kod sparad").then(() => setNewCode({ ...newCode, [h.id]: "" })); }}>
                  <input className="tin" style={{ maxWidth: "11rem" }} value={newCode[h.id] || ""} onChange={(e) => setNewCode({ ...newCode, [h.id]: e.target.value })} placeholder="Ny kod" />
                  <button className="btn ghost" type="submit" disabled={!newCode[h.id]}>Byt kod</button>
                  {arm === h.id
                    ? <button className="link" type="button" onClick={() => act({ remove: h.id }, `${h.name} är borttaget`)}>Tryck igen för att ta bort</button>
                    : <button className="link" type="button" onClick={() => { setArm(h.id); setTimeout(() => setArm(null), 4000); }}>Ta bort</button>}
                </form>
              </li>
            ))}
            {d.households.length < 2 && <li className="muted">Inga andra hushåll än.</li>}
          </ul>
          <form className="arow" onSubmit={(e) => { e.preventDefault(); act({ name, code }, `${name} är tillagt`).then(() => { setName(""); setCode(""); }); }}>
            <input className="tin" style={{ maxWidth: "14rem" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn, till exempel Filip och My" />
            <input className="tin" style={{ maxWidth: "11rem" }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Deras familjekod" />
            <button className="btn" type="submit" disabled={!name.trim() || code.trim().length < 6}>Lägg till hushåll</button>
          </form>
          <p className="hint">Koden är minst sex tecken. Ge den till dem, så loggar de in med den på receptboken-six.vercel.app. Ta bort eller byt kod stoppar nya inloggningar med den gamla koden. Enheter som redan är inloggade fortsätter att fungera, och hushållets recept ligger kvar.</p>
        </>
      )}
    </div>
  );
}
