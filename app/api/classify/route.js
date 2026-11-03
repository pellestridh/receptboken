import { classifyMissing, classifyHolidays } from "@/lib/classify";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try { const a = await classifyMissing(); const b = await classifyHolidays(); return ok({ done: a.done + b.done, left: a.left + b.left }); } catch (e) { return fail(e); }
}
