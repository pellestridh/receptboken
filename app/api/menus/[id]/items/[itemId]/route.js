import { db } from "@/lib/db";
import { loadMenus } from "@/lib/menus";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// { recipeId?: string | null, servings? }
export async function PATCH(req, { params }) {
  try {
    const sql = db();
    const b = await body(req);
    if ("recipeId" in b) await sql(`update menu_items set recipe_id = $3 where id = $2 and menu_id = $1`, [params.id, params.itemId, b.recipeId || null]);
    if (b.servings) {
      const n = Math.max(1, Math.min(40, Math.round(Number(b.servings))));
      await sql(`update menu_items set servings = $3 where id = $2 and menu_id = $1`, [params.id, params.itemId, n]);
    }
    return ok({ menus: await loadMenus() });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await db()(`delete from menu_items where id = $2 and menu_id = $1`, [params.id, params.itemId]);
    return ok({ menus: await loadMenus() });
  } catch (e) {
    return fail(e, 500);
  }
}
