"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { useSettings } from "@/components/useSettings";

export default function Households() {
  const { toast } = useApp();
  const [d, setD] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [arm, setArm] = useState(null);
  const [newCode, setNewCode] = useState({});
  const [settings, saveSettings] = useSettings();
  const [admin, setAdmin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [adminIn, setAdminIn] = useState("");
  useEffect(() => { try { const a = sessionStorage.getItem("rb-admin"); if (a) { setAdmin(a); setUnlocked(true); } } catch {} }, []);
  const unlock = (e) => {
    e.preventDefault();
    api("/api/households", { method: "POST", json: { check: true, admin: adminIn } })
      .then((x) => { setD(x); setAdmin(adminIn); setUnlocked(true); try { sessionStorage.setItem("rb-admin", adminIn); } catch {} ; setAdminIn(""); toast(d.adminSet ? "Upplåst" : "Administratörskoden är sparad. Glöm den inte."); })
      .catch((x) => toast(x.message));
  };
  useEffect(() => { api("/api/households").then(setD).catch(() => {}); }, []);
  if (!d) return null;
  const me = d.households.find((h) => h.id === d.current);
  const act = (json, msg) => api("/api/households", { method: "POST", json: { ...json, admin } }).then((x) => { setD(x); toast(msg); }).catch((e) => toast(e.message));

  return (
    <div className="panel">
      <h2 style={{ fontSize: "1.4rem" }}>Hushåll</h2>
      <p className="hint">Du är inloggad i <b>{me?.name || d.current}</b>. Varje hushåll har egen familjekod, egna recept, menyer, inköpslista, allergier och provningar. Recept kan kopieras mellan hushåll med Dela på receptet.</p>
      <label className="toggle">
        <input type="checkbox" checked={!!settings.shareInspiration} onChange={(e) => saveSettings({ shareInspiration: e.target.checked }).then(() => toast(e.target.checked ? "Era recept syns nu som inspiration" : "Era recept visas inte längre för andra")).catch((x) => toast(x.message))} />
        <span><b>Visa våra recept som inspiration</b><br /><span className="muted">De andra hushållen kan läsa era recept och spara kopior. Anteckningar, menyer och inköpslista syns aldrig.</span></span>
      </label>
      {d.current === "hem" && !unlocked && (
        <form className="adminlock" onSubmit={unlock}>
          <b>{d.adminSet ? "Hantera hushåll" : "Välj en administratörskod"}</b>
          <p className="hint">{d.adminSet ? "Bara den med administratörskoden kan lägga till hushåll, byta koder och ta bort." : "Koden behövs för att lägga till och ta bort hushåll. Välj en som bara du vet, minst sex tecken, och skilj den från familjekoden."}</p>
          <div className="arow">
            <input className="tin" type="password" style={{ maxWidth: "14rem" }} value={adminIn} onChange={(e) => setAdminIn(e.target.value)} placeholder="Administratörskod" autoComplete="off" />
            <button className="btn" type="submit" disabled={adminIn.trim().length < 6}>{d.adminSet ? "Lås upp" : "Spara koden"}</button>
          </div>
        </form>
      )}
      {d.current === "hem" && unlocked && (
        <>
          <form className="arow" onSubmit={(e) => { e.preventDefault(); act({ homeName: e.target.hn.value }, "Namnet är sparat"); }}>
            <input name="hn" className="tin" style={{ maxWidth: "16rem" }} defaultValue={me?.name} placeholder="Ert hushålls namn" aria-label="Ert hushålls namn" />
            <button className="btn ghost" type="submit">Spara namnet</button>
          </form>
          <p className="hint" style={{ marginTop: "-.4rem" }}>Så heter ni för de andra hushållen, till exempel Mamma och pappa.</p>
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
