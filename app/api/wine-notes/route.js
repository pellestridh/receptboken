import { listWineNotes, addWineNote, explainTasting } from "@/lib/wineNotes";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// ?recept=id&typ=wine|beer
export async function GET(req) {
  try {
    const u = new URL(req.url).searchParams;
    return ok({ notes: await listWineNotes(u.get("recept"), u.get("typ")) });
  } catch (e) { return fail(e); }
}
export async function POST(req) {
  try { const b = await body(req); if (b.action === "why") return ok({ why: await explainTasting(String(b.id || "")) }); const id = await addWineNote(b); return ok({ id, notes: await listWineNotes(b.recipeId || null, b.recipeId ? null : b.kind || null) }); } catch (e) { return fail(e); }
}
