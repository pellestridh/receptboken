import { ownRecipe } from "@/lib/household";
import { db, saveRecipe } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const sql = db();
    await ownRecipe(params.id);
    const [r] = await sql(`select body from recipes where id = $1 and deleted_at is null`, [params.id]);
    if (!r) return fail("Receptet finns inte.", 404);
    const [n] = await sql(`select rating, times_cooked, last_cooked from notes where recipe_id = $1`, [params.id]);
    const entries = await sql(`select id, author, text, created_at from note_entries where recipe_id = $1 order by created_at desc`, [params.id]);
    return ok({
      recipe: r.body,
      notes: { rating: n?.rating || 0, timesCooked: n?.times_cooked || 0, lastCooked: n?.last_cooked || null, entries },
    });
  } catch (e) {
    return fail(e, e?.status || 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const b = await body(req);
    // Bara nytt namn: ändra rubriken utan att röra resten av receptet.
    if (!b.recipe && typeof b.title === "string") {
      const title = b.title.replace(/\s+/g, " ").trim().slice(0, 120);
      if (!title) throw new Error("Skriv ett namn på receptet.");
      await ownRecipe(params.id);
      await db()(`update recipes set title = $2, body = jsonb_set(body, '{title}', to_jsonb($2::text)), updated_at = now() where id = $1`, [params.id, title]);
      return ok({ id: params.id, title });
    }
    const { recipe } = b;
    if (!recipe?.title) throw new Error("Receptet saknar rubrik.");
    await ownRecipe(params.id);
    await saveRecipe(params.id, recipe);
    return ok({ id: params.id });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await ownRecipe(params.id);
    await db()(`update recipes set deleted_at = now() where id = $1`, [params.id]);
    return ok({ ok: true });
  } catch (e) {
    return fail(e, 500);
  }
}
