import { saveRecipe, uniqueSlug } from "@/lib/db";
import { listRecipes } from "@/lib/recipesList";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok({ recipes: await listRecipes() });
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
