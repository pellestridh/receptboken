import { classifyMissing } from "@/lib/classify";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try { return ok(await classifyMissing()); } catch (e) { return fail(e); }
}
