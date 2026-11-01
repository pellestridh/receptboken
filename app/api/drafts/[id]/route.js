import { hh } from "@/lib/household";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const [d] = await db()(`select body from drafts where id = $1 and hh = $2`, [params.id, hh()]);
    if (!d) return fail("Utkastet finns inte längre.", 404);
    return ok({ recipe: d.body });
  } catch (e) {
    return fail(e, 500);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await db()(`delete from drafts where id = $1 and hh = $2`, [params.id, hh()]);
    return ok({ ok: true });
  } catch (e) {
    return fail(e, 500);
  }
}
