"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export const allergyKey = (allergies) => (allergies || []).map((a) => a.what.toLowerCase().trim()).sort().join("|");

// Varningar och märkning överst i receptet. Räknas fram om de saknas eller om familjens allergier ändrats.
export default function Allergens({ id, allergens: initial, allergies, onChange }) {
  const [a, setA] = useState(initial || null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const key = allergyKey(allergies);

  useEffect(() => { setA(initial || null); }, [initial]);
  useEffect(() => {
    if (started.current || !allergies) return;
    if (initial && initial.forAllergies === key) return;
    started.current = true;
    setBusy(true);
    api(`/api/recipes/${id}/allergens`, { method: "POST" })
      .then((d) => { setA(d.allergens); onChange?.(d.allergens); })
      .catch(() => {})
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initial, key]);

  if (!a) return busy ? <p className="hint"><span className="spinner" />Kontrollerar allergener …</p> : null;
  return (
    <div className="allergy">
      {a.hits?.length > 0 && (
        <div className="alert danger" role="alert">
          <b>Innehåller {[...new Set(a.hits.map((h) => h.allergen))].join(" och ")}</b>
          <span>{a.hits.map((h) => h.ingredient).join(", ")}. Byt ut innan ni lagar, eller tryck Ändra och be Claude ersätta det.</span>
        </div>
      )}
      {a.mayContain?.length > 0 && (
        <div className="alert caution">
          <b>Kan innehålla {[...new Set(a.mayContain.map((h) => h.allergen))].join(" och ")}</b>
          <span>{a.mayContain.map((h) => `${h.ingredient}${h.why ? ` (${h.why})` : ""}`).join(", ")}. Kontrollera innehållsförteckningen när ni handlar.</span>
        </div>
      )}
      <div className="tags">
        <span className={"tag " + (a.gluten === "nej" ? "ok-tag" : "")} title={a.glutenWhy || ""}>{a.gluten === "nej" ? "Glutenfri" : a.gluten === "ja" ? "Innehåller gluten" : "Kan innehålla gluten"}</span>
        <span className={"tag " + (a.lactose === "nej" ? "ok-tag" : "")} title={a.lactoseWhy || ""}>{a.lactose === "nej" ? "Laktosfri" : a.lactose === "ja" ? "Innehåller laktos" : "Lite laktos"}</span>
        {a.other?.length > 0 && <span className="tag">Även: {a.other.join(", ")}</span>}
      </div>
    </div>
  );
}
