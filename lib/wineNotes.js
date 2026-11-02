import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { grapeFor, DIMS } from "@/data/wine";
import { BEER_DIMS } from "@/data/beerSchool";
import { styleFor } from "@/data/beer";

const clamp = (v, lo, hi) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : null; };
const row = (r) => ({ id: r.id, recipeId: r.recipe_id, recipeTitle: r.recipe_title, wine: r.wine, style: r.style, color: r.color, grape: r.grape,
  kind: r.kind || "wine", rating: r.rating, match: r.match, dims: r.dims || {}, aromas: r.aromas || [], note: r.note, price: r.price, author: r.author, createdAt: r.created_at });

// Provningar av vin och öl. kind: "wine" | "beer" | null (båda).
export async function listWineNotes(recipeId, kind = null) {
  const rows = recipeId
    ? await db()(`select * from wine_notes where recipe_id = $1 and hh = $2 order by created_at desc`, [recipeId, hh()])
    : await db()(`select * from wine_notes where hh = $1 order by created_at desc limit 500`, [hh()]);
  return rows.map(row).filter((n) => !kind || n.kind === kind);
}

export async function addWineNote(b) {
  const kind = b.kind === "beer" ? "beer" : "wine";
  const wine = String(b.wine || "").trim().slice(0, 120);
  if (!wine) throw new Error(kind === "beer" ? "Skriv ölets namn." : "Skriv vinets namn.");
  const dims = {};
  for (const d of kind === "beer" ? BEER_DIMS : DIMS) { const v = clamp(b.dims?.[d.key], 0, 5); if (v) dims[d.key] = v; }
  let title = null;
  if (b.recipeId) { const [r] = await db()(`select title from recipes where id = $1 and hh = $2`, [b.recipeId, hh()]); title = r?.title || null; }
  const guess = kind === "beer" ? styleFor(`${b.style || ""} ${wine}`) : grapeFor(`${wine} ${b.style || ""}`);
  const grape = String(b.grape || guess?.key || "").slice(0, 30) || null;
  const id = rid();
  await db()(
    `insert into wine_notes (id, recipe_id, recipe_title, wine, style, color, grape, rating, match, dims, aromas, note, price, author, hh, kind)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [id, b.recipeId || null, title, wine, String(b.style || "").slice(0, 120) || null, String(b.color || "").slice(0, 20) || null, grape,
     clamp(b.rating, 1, 5), b.recipeId ? clamp(b.match, 1, 5) : null, JSON.stringify(dims),
     JSON.stringify((Array.isArray(b.aromas) ? b.aromas : []).slice(0, 12).map((x) => String(x).slice(0, 40))),
     String(b.note || "").trim().slice(0, 600) || null, clamp(b.price, 0, 100000), String(b.author || "").slice(0, 40) || null, hh(), kind]
  );
  return id;
}

export async function deleteWineNote(id) {
  await db()(`delete from wine_notes where id = $1 and hh = $2`, [id, hh()]);
}

// Exempel till dryckesförslagen, så att vinförslagen lär sig av era provningar.
export async function wineExamples(limit = 30) {
  try {
    const rows = await db()(`select recipe_title, wine, style, rating, match, note, kind from wine_notes where hh = $2 order by created_at desc limit $1`, [limit, hh()]);
    if (!rows.length) return "";
    const lines = rows.map((r) => `- ${r.kind === "beer" ? "Öl" : "Vin"}: ${r.wine}${r.style ? ` (${r.style})` : ""}: ${r.rating || "?"}/5${r.recipe_title ? `, till ${r.recipe_title} ${r.match || "?"}/5` : ""}${r.note ? `. "${r.note.slice(0, 140)}"` : ""}`);
    return `\n\nFamiljens provade viner och öl med betyg (drycken i sig, och hur den passade till rätten). Föreslå i den andan, och undvik det som fått lågt betyg:\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}
