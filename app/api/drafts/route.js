import { hh } from "@/lib/household";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db()(`select id, body->>'title' as title, source_url, created_at from drafts where hh = $1 order by created_at desc`, [hh()]);
    return ok({ drafts: rows });
  } catch (e) {
    return fail(e, 500);
  }
}
