import { getOffers } from "@/lib/offers";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try { return ok({ stores: await getOffers() }); } catch (e) { return fail(e); }
}
// { refresh: storeKey }
export async function POST(req) {
  try { const b = await body(req); return ok({ stores: await getOffers({ force: true, only: b.refresh || null }) }); } catch (e) { return fail(e); }
}
