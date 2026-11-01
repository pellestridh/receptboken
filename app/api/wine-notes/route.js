import { listWineNotes, addWineNote } from "@/lib/wineNotes";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try { return ok({ notes: await listWineNotes(new URL(req.url).searchParams.get("recept")) }); } catch (e) { return fail(e); }
}
export async function POST(req) {
  try { const b = await body(req); const id = await addWineNote(b); return ok({ id, notes: await listWineNotes(b.recipeId || null) }); } catch (e) { return fail(e); }
}
