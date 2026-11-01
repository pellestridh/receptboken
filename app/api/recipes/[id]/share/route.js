import { ownRecipe, listHouseholds } from "@/lib/household";
import { copyRecipe } from "@/lib/copyRecipe";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// Kopierar receptet till ett annat hushåll. { to }
export async function POST(req, { params }) {
  try {
    const { to } = await body(req);
    await ownRecipe(params.id);
    const target = (await listHouseholds()).find((h) => h.id === to);
    if (!target) throw new Error("Hushållet finns inte.");
    const id = await copyRecipe(params.id, to);
    return ok({ id, to: target.name });
  } catch (e) {
    return fail(e);
  }
}
