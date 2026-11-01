import { beerUsage } from "@/lib/beerUsage";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok({ usage: await beerUsage() }); } catch (e) { return fail(e); }
}
