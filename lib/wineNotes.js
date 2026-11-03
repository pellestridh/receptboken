import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { grapeFor, DIMS } from "@/data/wine";
import { BEER_DIMS } from "@/data/beerSchool";
import { styleFor } from "@/data/beer";
import { askJson } from "@/lib/claude";
import { spectrumFor } from "@/data/beerSpectrum";

const clamp = (v, lo, hi) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : null; };
const row = (r) => ({ id: r.id, recipeId: r.recipe_id, recipeTitle: r.recipe_title, wine: r.wine, style: r.style, color: r.color, grape: r.grape,
  kind: r.kind || "wine", rating: r.rating, match: r.match, dims: r.dims || {}, aromas: r.aromas || [], note: r.note, price: r.price, author: r.author, why: r.why || null, createdAt: r.created_at });

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

// Varför passade (eller passade inte) drycken till rätten? Förklaras med samma principer som skolan och sparas på provningen.
export async function explainTasting(id) {
  const [n] = await db()(`select * from wine_notes where id = $1 and hh = $2`, [id, hh()]);
  if (!n) throw new Error("Provningen finns inte.");
  if (!n.recipe_id) throw new Error("Provningen är inte kopplad till något recept.");
  const [r] = await db()(`select title, body from recipes where id = $1 and hh = $2`, [n.recipe_id, hh()]);
  const b = r?.body || {};
  const dish = { title: r?.title || n.recipe_title, kitchen: b.kitchen, lede: b.lede, ingredients: (b.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).slice(0, 30), steps: (b.steps || []).map((s) => s.text || s).join(" ").slice(0, 900) };
  const beer = n.kind === "beer";
  const st = beer ? styleFor(`${n.style || ""} ${n.wine}`) : grapeFor(`${n.wine} ${n.style || ""}`);
  const sp = beer && st ? spectrumFor(st.key) : null;
  const drink = { namn: n.wine, stil: n.style, [beer ? "ölstil" : "druva"]: st?.name, profil: sp ? `beska ${sp.b}/100, fruktighet ${sp.f}/100. ${sp.d}` : st?.smell || undefined,
    betyg: n.rating, passade: n.match, känsla: n.dims, dofter: n.aromas, omdöme: n.note };
  const out = await askJson({
    system: `Du är en pedagogisk sommelier och ölexpert. Familjen har provat en ${beer ? "öl" : "vin"} till en rätt och satt betyg på hur bra det passade (1–5). Förklara på svenska varför det passade så bra eller dåligt, så att de lär sig tänka själva. De är vanliga matintresserade, inte sommelierer eller ölnördar: skriv enkelt och vardagligt, som till en vän vid middagsbordet, och undvik facktermer. Använd principerna: intensitet, smakkroken (det som speglar), kontrast, syra eller kolsyra mot fett, beska eller tanniner mot protein och fett, sötma mot hetta, umami, regionalt. Var konkret: nämn rättens egenskaper och dryckens egenskaper som möttes. Om det passade dåligt, förklara vad som krockade och vad som hade fungerat bättre. Svara bara med JSON: {"why":"2–4 meningar","met":["2–4 korta par: rättens egenskap ↔ dryckens egenskap"],"principle":"den viktigaste principen, ett eller två ord","next":"en mening: vad de ska leta efter nästa gång, med en stil eller druva"}`,
    content: `Rätt: ${JSON.stringify(dish)}\nDryck: ${JSON.stringify(drink)}`,
    schema: { type: "object", properties: { why: { type: "string" }, met: { type: "array", items: { type: "string" } }, principle: { type: "string" }, next: { type: "string" } }, required: ["why"] },
    toolName: "why", maxTokens: 700, textOnly: true,
  });
  const why = {
    why: String(out?.why || "").slice(0, 700),
    met: (Array.isArray(out?.met) ? out.met : []).map((x) => String(x).slice(0, 90)).filter(Boolean).slice(0, 4),
    principle: String(out?.principle || "").slice(0, 40),
    next: String(out?.next || "").slice(0, 240),
  };
  await db()(`update wine_notes set why = $1 where id = $2 and hh = $3`, [JSON.stringify(why), id, hh()]);
  return why;
}
