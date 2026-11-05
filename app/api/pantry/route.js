import { listPantry, addPantry } from "@/lib/pantry";
import { ok, fail, body } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() { try { return ok({ items: await listPantry() }); } catch (e) { return fail(e, 500); } }
export async function POST(req) { try { await addPantry(await body(req)); return ok({ items: await listPantry() }); } catch (e) { return fail(e); } }
