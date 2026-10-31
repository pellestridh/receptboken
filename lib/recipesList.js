import { db } from "@/lib/db";

export async function listRecipes() {
  const rows = await db()(
    `select r.id, r.title, r.kitchen, r.type, r.base, r.minutes, r.servings, r.accent, r.image_url, r.source_name, r.source_url,
            r.body->>'short' as short, r.body->>'lede' as lede, r.body->'tags' as tags,
            r.body->'groups' as groups, r.body->'pairsWith' as pairs, r.body->'nutrition' as nutrition, r.created_at,
            n.rating, n.times_cooked, n.last_cooked
     from recipes r left join notes n on n.recipe_id = r.id
     where r.deleted_at is null`
  );
  return rows.map((r) => ({
    id: r.id, title: r.title, kitchen: r.kitchen, type: r.type, base: r.base,
    minutes: r.minutes, servings: r.servings, accent: r.accent, image: r.image_url,
    source: r.source_name, sourceUrl: r.source_url, short: r.short || r.lede || "", tags: r.tags || [], pairsWith: r.pairs || [],
    ingredients: (r.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).join(" "),
    kcal: r.nutrition?.kcal || null,
    rating: r.rating || 0, timesCooked: r.times_cooked || 0, lastCooked: r.last_cooked, createdAt: r.created_at,
  }));
}
