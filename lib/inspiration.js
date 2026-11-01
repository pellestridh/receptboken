import { db } from "@/lib/db";
import { hh, listHouseholds } from "@/lib/household";
import { readSettings } from "@/lib/settings";
import { findDuplicate } from "@/lib/dupes";
import { keywordHits } from "@/lib/allergens";

// Hushåll som valt att visa sina recept som inspiration, utom det egna.
export async function sharingHouseholds() {
  const me = hh();
  const all = await listHouseholds();
  const rows = await db()(`select key, value from settings where key = 'shareInspiration' or key like '%/shareInspiration'`);
  const on = new Set(rows.filter((r) => r.value === true).map((r) => (r.key.includes("/") ? r.key.split("/")[0] : "hem")));
  return all.filter((h) => h.id !== me && on.has(h.id));
}

export async function inspirationList() {
  const hhs = await sharingHouseholds();
  if (!hhs.length) return { households: [], recipes: [] };
  const sql = db();
  const rows = await sql(
    `select r.id, r.hh, r.title, r.kitchen, r.type, r.minutes, r.accent, r.image_url, r.source_name, r.source_url, r.created_at,
            r.body->>'short' as short, r.body->'groups' as groups, r.body->'dishes' as dishes, (r.body->'nutrition'->>'kcal')::int as kcal,
            n.rating, n.times_cooked
     from recipes r left join notes n on n.recipe_id = r.id
     where r.deleted_at is null and r.hh = any($1) order by r.created_at desc limit 400`, [hhs.map((h) => h.id)]
  );
  const mine = await sql(`select id, title, source_url as "sourceUrl" from recipes where deleted_at is null and hh = $1`, [hh()]);
  const { allergies } = await readSettings();
  const name = Object.fromEntries(hhs.map((h) => [h.id, h.name]));
  const recipes = rows.map((r) => {
    const have = findDuplicate(mine, { url: r.source_url, title: r.title });
    const hits = [...new Set(keywordHits({ groups: r.groups || [] }, allergies).map((h) => h.allergen))];
    return {
      id: r.id, from: r.hh, fromName: name[r.hh], title: r.title, kitchen: r.kitchen, type: r.type, minutes: r.minutes, accent: r.accent,
      image: r.image_url, source: r.source_name, short: r.short || "", dishes: r.dishes || null, kcal: r.kcal,
      rating: r.rating || 0, timesCooked: r.times_cooked || 0, createdAt: r.created_at,
      ingredients: (r.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).join(" "),
      have: have ? { id: have.id, title: have.title } : null, allergens: hits.length ? { hits } : null,
    };
  });
  return { households: hhs, recipes };
}

export async function inspirationRecipe(id) {
  const hhs = await sharingHouseholds();
  const [r] = await db()(`select hh, body from recipes where id = $1 and deleted_at is null`, [id]);
  const from = r && hhs.find((h) => h.id === r.hh);
  if (!from) { const e = new Error("Receptet är inte delat som inspiration."); e.status = 404; throw e; }
  const { allergies } = await readSettings();
  const hits = [...new Set(keywordHits(r.body, allergies).map((h) => h.allergen))];
  const [n] = await db()(`select rating, times_cooked from notes where recipe_id = $1`, [id]);
  return { recipe: r.body, from, hits, rating: n?.rating || 0, timesCooked: n?.times_cooked || 0 };
}
