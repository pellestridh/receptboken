import { ownMenu, ownRecipe } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { loadMenus } from "@/lib/menus";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// { title?, servings? (sätts på alla rätter), addItem?: { day, course } }
export async function PATCH(req, { params }) {
  try {
    const sql = db();
    const b = await body(req);
    await ownMenu(params.id);
    if (b.title) await sql(`update menus set title = $2 where id = $1`, [params.id, String(b.title).slice(0, 80)]);
    if (b.servings) {
      const n = Math.max(1, Math.min(40, Math.round(Number(b.servings))));
      await sql(`update menus set servings = $2 where id = $1`, [params.id, n]);
      await sql(`update menu_items set servings = $2 where menu_id = $1`, [params.id, n]);
    }
    if (b.addItem) {
      const [m] = await sql(`select servings from menus where id = $1`, [params.id]);
      const [{ max }] = await sql(`select coalesce(max(position), -1) as max from menu_items where menu_id = $1`, [params.id]);
      if (b.addItem.recipeId) await ownRecipe(b.addItem.recipeId);
      let day = b.addItem.day || null;
      if (b.addItem.nextDay && day) { const d = new Date(day + "T12:00:00"); d.setDate(d.getDate() + 1); day = d.toISOString().slice(0, 10); }
      await sql(`insert into menu_items (id, menu_id, recipe_id, day, course, servings, position) values ($1,$2,$3,$4,$5,$6,$7)`,
        [rid(), params.id, b.addItem.recipeId || null, day, b.addItem.course || null, m?.servings || 2, Number(max) + 1]);
    }
    return ok({ menus: await loadMenus() });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const sql = db();
    await ownMenu(params.id);
    await sql(`delete from menu_items where menu_id = $1`, [params.id]);
    await sql(`delete from menus where id = $1`, [params.id]);
    return ok({ menus: await loadMenus() });
  } catch (e) {
    return fail(e, 500);
  }
}
