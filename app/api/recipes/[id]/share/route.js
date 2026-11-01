import { db, saveRecipe, uniqueSlug } from "@/lib/db";
import { ownRecipe, listHouseholds } from "@/lib/household";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// Kopierar receptet till ett annat hushåll. { to }
export async function POST(req, { params }) {
  try {
    const { to } = await body(req);
    await ownRecipe(params.id);
    const target = (await listHouseholds()).find((h) => h.id === to);
    if (!target) throw new Error("Hushållet finns inte.");
    const sql = db();
    const [r] = await sql(`select body from recipes where id = $1`, [params.id]);
    const copy = { ...r.body };
    delete copy.drinks; // dryckesförslagen lär sig av varje hushålls smak
    const id = await uniqueSlug(copy.title);
    const [img] = await sql(`select mime, data from recipe_images where recipe_id = $1`, [params.id]);
    if (img) {
      await sql(`insert into recipe_images (recipe_id, mime, data, updated_at) values ($1,$2,$3,now()) on conflict (recipe_id) do nothing`, [id, img.mime, img.data]);
      copy.image = `/api/images/${id}?v=1`;
    }
    await saveRecipe(id, { ...copy, __hh: to });
    return ok({ id, to: target.name });
  } catch (e) {
    return fail(e);
  }
}
