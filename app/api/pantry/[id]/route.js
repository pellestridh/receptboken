import { listPantry, updatePantry } from "@/lib/pantry";
import { ok, fail, body } from "@/lib/http";
export const dynamic = "force-dynamic";
// { remove: true } | { freeze: bool } | { q }
export async function POST(req, { params }) { try { await updatePantry(params.id, await body(req)); return ok({ items: await listPantry() }); } catch (e) { return fail(e); } }
