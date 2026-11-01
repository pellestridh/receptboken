import { db } from "@/lib/db";
import { styleFor } from "@/data/beer";

// Vilka ölstilar som föreslagits eller valts till vilka recept.
export async function beerUsage() {
  const rows = await db()(`select id, title, image_url, accent, body->'drinks' as d from recipes where deleted_at is null and body ? 'drinks'`);
  const out = {};
  const add = (text, r, how) => {
    const s = styleFor(text);
    if (!s) return;
    const list = (out[s.key] ||= []);
    if (!list.some((x) => x.id === r.id)) list.push({ id: r.id, title: r.title, image: r.image_url, accent: r.accent, how });
    else if (how === "ert val") list.find((x) => x.id === r.id).how = how;
  };
  for (const r of rows) {
    const b = r.d?.beer;
    if (b) {
      add(`${b.style || ""} ${b.name || ""}`, r, "förslag");
      for (const a of b.alternatives || []) add(`${a.style || ""} ${a.name || ""}`, r, "alternativ");
    }
    for (const o of r.d?.own?.beer || []) add(`${o.name} ${o.note || ""}`, r, "ert val");
  }
  return out;
}
