import { inspirationList } from "@/lib/inspiration";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok(await inspirationList()); } catch (e) { return fail(e); }
}
