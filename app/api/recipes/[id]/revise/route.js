import { db } from "@/lib/db";
import { reviseRecipe } from "@/lib/importer";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req, { params }) {
  try {
    const { instruction } = await body(req);
    if (!instruction?.trim()) throw new Error("Skriv vad som ska ändras.");
    const [r] = await db()(`select body from recipes where id = $1`, [params.id]);
    if (!r) return fail("Receptet finns inte.", 404);
    const recipe = await reviseRecipe(r.body, instruction.trim());
    return ok({ recipe });
  } catch (e) {
    return fail(e);
  }
}
