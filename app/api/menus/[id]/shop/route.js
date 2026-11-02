import { hh, ownMenu, ownRecipe } from "@/lib/household";
import { db } from "@/lib/db";
import { shoppingItems } from "@/lib/shopping";
import { addShopping } from "@/lib/shoppingDb";
import { aisleFor } from "@/lib/aisles";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// Lägger alla rätter i menyn i inköpslistan, plus valda varor ur baslistan. { staples: [id] }
export async function POST(req, { params }) {
  try {
    const sql = db();
    const { staples = [] } = await body(req);
    await ownMenu(params.id);
    const items = await sql(`select recipe_id, servings from menu_items where menu_id = $1 and recipe_id is not null`, [params.id]);
    const ids = [...new Set(items.map((i) => i.recipe_id))];
    const bodies = ids.length ? await sql(`select id, body from recipes where id = any($1) and hh = $2`, [ids, hh()]) : [];
    const byId = Object.fromEntries(bodies.map((b) => [b.id, b.body]));
    const all = items.flatMap((i) => (byId[i.recipe_id] ? shoppingItems(byId[i.recipe_id], i.servings) : []));
    if (staples.length) {
      const rows = await sql(`select name, aisle from staples where id = any($1) and hh = $2`, [staples, hh()]);
      all.push(...rows.map((s) => ({ name: s.name, unit: "", q: null, amt: "", aisle: s.aisle || aisleFor(s.name), from: "Baslistan" })));
    }
    const list = await addShopping(all);
    return ok({ items: list, added: all.length });
  } catch (e) {
    return fail(e);
  }
}
