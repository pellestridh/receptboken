import { db } from "@/lib/db";
import { hh } from "@/lib/household";
import { styleFor } from "@/data/beer";
import { grapeFor } from "@/data/wine";

// Vilka ölstilar och druvor som föreslagits eller valts till vilka recept.
export async function drinkUsage() {
  const rows = await db()(`select id, title, image_url, accent, body->'drinks' as d from recipes where deleted_at is null and hh = $1 and body ? 'drinks'`, [hh()]);
  const out = { beer: {}, wine: {} };
  const add = (kind, text, r, how) => {
    const s = kind === "beer" ? styleFor(text) : grapeFor(text);
    if (!s) return;
    const list = (out[kind][s.key] ||= []);
    const ex = list.find((x) => x.id === r.id);
    if (!ex) list.push({ id: r.id, title: r.title, image: r.image_url, accent: r.accent, how });
    else if (how === "ert val") ex.how = how;
  };
  for (const r of rows) {
    for (const kind of ["beer", "wine"]) {
      const p = r.d?.[kind];
      if (p) {
        add(kind, `${p.style || ""} ${p.name || ""}`, r, "förslag");
        for (const a of p.alternatives || []) add(kind, `${a.style || ""} ${a.name || ""}`, r, "alternativ");
      }
      for (const o of r.d?.own?.[kind] || []) add(kind, `${o.name} ${o.note || ""}`, r, "ert val");
    }
  }
  return out;
}
