import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";
import { onBought, onUnbought } from "@/lib/pantry";
import { parseAmount } from "@/lib/amount";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const sql = db();
    const b = await body(req);
    // Ändra mängden på en vara, till exempel "2 st" eller "500 g".
    if (typeof b.amount === "string") {
      const a = parseAmount(b.amount);
      await sql(`update shopping_items set q = $2, q2 = $3, unit = $4, amt = $5 where id = $1 and hh = $6`, [params.id, a.q, a.q2, a.unit || "", a.amt || "", hh()]);
      return ok({ ok: true, ...a });
    }
    const { done } = b;
    const [item] = await sql(
      `update shopping_items set done = $2, done_at = case when $2 then now() else null end where id = $1 and hh = $3 returning id, name, q, unit`,
      [params.id, !!done, hh()]
    );
    // Avbockningar sparas som köp, grunden för köpmönster längre fram.
    if (item && done) await sql(`insert into purchases (id, item_name, hh) values ($1, $2, $3)`, [rid(), item.name, hh()]);
    // Det som blir över av förpackningen hamnar i Kvar hemma, och tas bort igen om man ångrar.
    try { if (item && done) await onBought(item); else if (item) await onUnbought(item.id); } catch {}
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await db()(`delete from shopping_items where id = $1 and hh = $2`, [params.id, hh()]);
    return ok({ ok: true });
  } catch (e) {
    return fail(e, 500);
  }
}
