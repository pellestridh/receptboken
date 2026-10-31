import { db, saveRecipe, uniqueSlug } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db()(
      `select r.id, r.title, r.kitchen, r.type, r.base, r.minutes, r.servings, r.accent, r.image_url, r.source_name, r.source_url,
              r.body->>'short' as short, r.body->>'lede' as lede, r.body->'tags' as tags,
              r.body->'groups' as groups, r.body->'pairsWith' as pairs, r.created_at,
              n.rating, n.times_cooked, n.last_cooked
       from recipes r left join notes n on n.recipe_id = r.id
       where r.deleted_at is null`
    );
    const recipes = rows.map((r) => ({
      id: r.id, title: r.title, kitchen: r.kitchen, type: r.type, base: r.base,
      minutes: r.minutes, servings: r.servings, accent: r.accent, image: r.image_url,
      source: r.source_name, sourceUrl: r.source_url, short: r.short || r.lede || "", tags: r.tags || [], pairsWith: r.pairs || [],
      ingredients: (r.groups || []).flatMap((g) => (g.items || []).map((i) => i.name)).join(" "),
      rating: r.rating || 0, timesCooked: r.times_cooked || 0, lastCooked: r.last_cooked, createdAt: r.created_at,
    }));
    return ok({ recipes });
  } catch (e) {
    return fail(e, 500);
  }
}

export async function POST(req) {
  try {
    const { recipe } = await body(req);
    if (!recipe?.title) throw new Error("Receptet saknar rubrik.");
    const id = await uniqueSlug(recipe.title);
    await saveRecipe(id, recipe);
    return ok({ id });
  } catch (e) {
    return fail(e);
  }
}
