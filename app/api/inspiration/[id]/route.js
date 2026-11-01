import { inspirationRecipe } from "@/lib/inspiration";
import { copyRecipe } from "@/lib/copyRecipe";
import { hh } from "@/lib/household";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try { return ok(await inspirationRecipe(params.id)); } catch (e) { return fail(e); }
}

// Spara en kopia i den egna receptboken.
export async function POST(_req, { params }) {
  try {
    await inspirationRecipe(params.id); // kontrollerar att det är delat
    const id = await copyRecipe(params.id, hh());
    return ok({ id });
  } catch (e) {
    return fail(e);
  }
}
