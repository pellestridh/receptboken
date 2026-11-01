import { deleteWineNote } from "@/lib/wineNotes";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  try { await deleteWineNote(params.id); return ok({ ok: true }); } catch (e) { return fail(e); }
}
