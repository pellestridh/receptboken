import { db } from "@/lib/db";
import { ownRecipe } from "@/lib/household";
import { computeNutrition } from "@/lib/nutrition";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(_req, { params }) {
  try {
    const sql = db();
    await ownRecipe(params.id);
    const [row] = await sql(`select body from recipes where id = $1`, [params.id]);
    if (!row) return fail("Receptet finns inte.", 404);
    const nutrition = await computeNutrition(row.body);
    await sql(`update recipes set body = jsonb_set(body, '{nutrition}', $2::jsonb) where id = $1`, [params.id, JSON.stringify(nutrition)]);
    return ok({ nutrition });
  } catch (e) {
    return fail(e);
  }
}
