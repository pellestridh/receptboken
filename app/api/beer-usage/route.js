import { drinkUsage } from "@/lib/drinkUsage";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

// { usage: ölstilar (bakåtkompatibelt), wine: druvor }
export async function GET() {
  try { const u = await drinkUsage(); return ok({ usage: u.beer, wine: u.wine }); } catch (e) { return fail(e); }
}
