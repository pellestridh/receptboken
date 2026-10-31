"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { shrink } from "@/lib/image";
import { useApp } from "@/components/Providers";

// Receptets bild, med knappar för att fota, välja eller hämta en bild.
export default function RecipeImage({ id, image, hasSource, onChange }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState("");
  const [menu, setMenu] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy("Sparar bilden …"); setMenu(false);
    try {
      const data = await shrink(file, 1400, 0.82);
      const d = await api(`/api/recipes/${id}/image`, { method: "POST", json: { data, mime: "image/jpeg" } });
      onChange(d.image); toast("Bilden är sparad");
    } catch (e) { toast(e.message); } finally { setBusy(""); }
  }
  async function act(json, msg) {
    setBusy(msg); setMenu(false);
    try { const d = await api(`/api/recipes/${id}/image`, { method: "POST", json }); onChange(d.image); }
    catch (e) { toast(e.message); } finally { setBusy(""); }
  }

  const controls = (
    <div className="imgctl">
      <label className="chip" htmlFor={`cam-${id}`}>Ta foto</label>
      <label className="chip" htmlFor={`lib-${id}`}>Välj bild</label>
      {hasSource && <button type="button" className="chip" onClick={() => act({ fromSource: true }, "Hämtar bilden …")}>Hämta från källan</button>}
      {image && <button type="button" className="chip" onClick={() => act({ remove: true }, "Tar bort …")}>Ta bort bild</button>}
      <input id={`cam-${id}`} className="vh" type="file" accept="image/*" capture="environment" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      <input id={`lib-${id}`} className="vh" type="file" accept="image/*" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );

  if (!image) {
    return (
      <div className="rhero empty-img">
        <div className="imgprompt">
          <b>Ingen bild än</b>
          <span>Fota rätten nästa gång ni lagar den, eller välj en bild.</span>
          {busy ? <span><span className="spinner" />{busy}</span> : controls}
        </div>
      </div>
    );
  }
  return (
    <div className="rhero">
      <img src={image} alt="" referrerPolicy="no-referrer" />
      <div className="imgbtn">
        {busy ? <span className="chip"><span className="spinner" />{busy}</span>
          : menu ? controls
          : <button type="button" className="chip" onClick={() => setMenu(true)}>Byt bild</button>}
      </div>
    </div>
  );
}
