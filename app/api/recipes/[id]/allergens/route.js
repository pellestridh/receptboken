import { db } from "@/lib/db";
import { ownRecipe } from "@/lib/household";
import { computeAllergens } from "@/lib/allergens";
import { readSettings } from "@/lib/settings";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(_req, { params }) {
  try {
    const sql = db();
    await ownRecipe(params.id);
    const [row] = await sql(`select body from recipes where id = $1`, [params.id]);
    if (!row) return fail("Receptet finns inte.", 404);
    const { allergies } = await readSettings();
    const allergens = await computeAllergens(row.body, allergies);
    await sql(`update recipes set body = jsonb_set(body, '{allergens}', $2::jsonb) where id = $1`, [params.id, JSON.stringify(allergens)]);
    return ok({ allergens });
  } catch (e) {
    return fail(e);
  }
}
