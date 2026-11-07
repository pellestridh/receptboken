import { db } from "@/lib/db";
import { askJson } from "@/lib/claude";
import { DISHES, DISH_KEYS, DISH_GUIDE } from "@/lib/dishes";
import { HOLIDAYS, HOLIDAY_KEYS } from "@/lib/holidays";

const LIST = DISHES.map((d) => `${d.key} = ${d.name}`).join("\n");
export const DISH_RULE = `Typ av rätt ("dishes"): en eller två av nycklarna ${DISH_KEYS.join(", ")}. Välj det man skulle leta under i en receptlåda. ${DISH_GUIDE}`;

// Sätter typ av rätt på recept som saknar det, upp till 30 åt gången.
export async function classifyMissing(limit = 30) {
  const sql = db();
  const rows = await sql(
    `select id, title, type, body->>'lede' as lede, body->'groups' as groups from recipes
     where deleted_at is null and not (body ? 'dishes') order by created_at limit $1`, [limit]
  );
  if (!rows.length) return { done: 0, left: 0 };
  const items = rows.map((r) => ({
    id: r.id, title: r.title, type: r.type, lede: r.lede,
    ingredients: (r.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).slice(0, 14).join(", "),
  }));
  const out = await askJson({
    system: `Du sorterar en svensk familjs recept i en receptlåda. För varje recept, ange typ av rätt med en eller två nycklar:\n${LIST}\n\n${DISH_GUIDE} Svara bara med JSON: {"result": [{"id": "...", "dishes": ["..."]}]}`,
    content: JSON.stringify(items),
    schema: { type: "object", properties: { result: { type: "array", items: { type: "object", properties: { id: { type: "string" }, dishes: { type: "array", items: { type: "string", enum: DISH_KEYS } } }, required: ["id", "dishes"] } } }, required: ["result"] },
    toolName: "save_dishes", maxTokens: 3000, textOnly: true,
  });
  const res = Array.isArray(out?.result) ? out.result : Array.isArray(out) ? out : [];
  let done = 0;
  for (const r of rows) {
    const hit = res.find((x) => x?.id === r.id);
    const dishes = (hit?.dishes || []).filter((d) => DISH_KEYS.includes(d)).slice(0, 2);
    await sql(`update recipes set body = jsonb_set(body, '{dishes}', $2::jsonb) where id = $1`, [r.id, JSON.stringify(dishes)]);
    done++;
  }
  const [{ n }] = await sql(`select count(*)::int as n from recipes where deleted_at is null and not (body ? 'dishes')`);
  return { done, left: n };
}

// Märker högtider (jul, nyår, påsk, midsommar, alla hjärtans dag) på recept som saknar märkningen. Tom lista om ingen.
export async function classifyHolidays(limit = 40) {
  const sql = db();
  const rows = await sql(
    `select id, title, kitchen, type, body->>'lede' as lede, body->'groups' as groups from recipes
     where deleted_at is null and not (body ? 'holidays') order by created_at limit $1`, [limit]
  );
  if (!rows.length) return { done: 0, left: 0 };
  const items = rows.map((r) => ({ id: r.id, title: r.title, kitchen: r.kitchen, type: r.type, lede: r.lede,
    ingredients: (r.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).slice(0, 12).join(", ") }));
  const out = await askJson({
    system: `Du hjälper en svensk familj att hitta recept till högtider. För varje recept, ange vilka högtider det passar på ett självklart sätt i Sverige: ${HOLIDAYS.map((h) => `${h.key} = ${h.name}`).join(", ")}. Var sparsam: bara traditionella rätter eller sådant man typiskt lagar just då, till exempel Janssons frestelse och julskinka till jul, sill och färskpotatis till midsommar, lamm och ägg till påsk, hummer och skaldjur till nyår, något festligt och romantiskt som chokladfondant till alla hjärtans dag. De flesta vardagsrätter får en tom lista. Svara bara med JSON: {"result": [{"id": "...", "holidays": []}]}`,
    content: JSON.stringify(items),
    schema: { type: "object", properties: { result: { type: "array", items: { type: "object", properties: { id: { type: "string" }, holidays: { type: "array", items: { type: "string", enum: HOLIDAY_KEYS } } }, required: ["id", "holidays"] } } }, required: ["result"] },
    toolName: "save_holidays", maxTokens: 3000, textOnly: true,
  });
  const res = Array.isArray(out?.result) ? out.result : [];
  for (const r of rows) {
    const hit = res.find((x) => x?.id === r.id);
    const hol = (hit?.holidays || []).filter((k) => HOLIDAY_KEYS.includes(k)).slice(0, 3);
    await sql(`update recipes set body = jsonb_set(body, '{holidays}', $2::jsonb) where id = $1`, [r.id, JSON.stringify(hol)]);
  }
  const [{ n }] = await sql(`select count(*)::int as n from recipes where deleted_at is null and not (body ? 'holidays')`);
  return { done: rows.length, left: n };
}

// Svårighetsgrad för recept som saknar den.
export async function classifyDifficulty(limit = 40) {
  const sql = db();
  const rows = await sql(
    `select id, title, minutes, body->'groups' as groups, body->'steps' as steps from recipes
     where deleted_at is null and not (body ? 'difficulty') order by created_at limit $1`, [limit]
  );
  if (!rows.length) return { done: 0, left: 0 };
  const items = rows.map((r) => ({ id: r.id, title: r.title, minutes: r.minutes,
    ingredients: (r.groups || []).reduce((n, g) => n + (g.items || []).length, 0),
    steps: (r.steps || []).map((s) => s.title).filter(Boolean).join(", ").slice(0, 200) }));
  const out = await askJson({
    system: `Bedöm hur svår varje rätt är för en van hemmakock. enkel = få moment och svårt att misslyckas. medel = några moment eller teknik som att bryna, reda eller baka. avancerad = många moment, exakt timing eller svår teknik. Svara bara med JSON: {"result": [{"id": "...", "difficulty": "enkel"}]}`,
    content: JSON.stringify(items),
    schema: { type: "object", properties: { result: { type: "array", items: { type: "object", properties: { id: { type: "string" }, difficulty: { type: "string", enum: ["enkel", "medel", "avancerad"] } }, required: ["id", "difficulty"] } } }, required: ["result"] },
    toolName: "save_difficulty", maxTokens: 2500, textOnly: true,
  });
  const res = Array.isArray(out?.result) ? out.result : [];
  for (const r of rows) {
    const hit = res.find((x) => x?.id === r.id);
    const d = ["enkel", "medel", "avancerad"].includes(hit?.difficulty) ? hit.difficulty : "medel";
    await sql(`update recipes set body = jsonb_set(body, '{difficulty}', to_jsonb($2::text)) where id = $1`, [r.id, d]);
  }
  const [{ n }] = await sql(`select count(*)::int as n from recipes where deleted_at is null and not (body ? 'difficulty')`);
  return { done: rows.length, left: n };
}
