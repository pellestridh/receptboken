import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { addShopping } from "@/lib/shoppingDb";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

const list = () => db()(`select id, name, selected from staples where hh = $1 order by position, name`, [hh()]);

export async function GET() {
  try { return ok({ staples: await list() }); } catch (e) { return fail(e, 500); }
}

// { add: "namn" } | { remove: id } | { toggle: id, selected } | { toShopping: [id] }
export async function POST(req) {
  try {
    const sql = db();
    const b = await body(req);
    if (b.add) {
      for (const name of String(b.add).split(/[,\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 50)) {
        const [{ max }] = await sql(`select coalesce(max(position), -1) as max from staples where hh = $1`, [hh()]);
        await sql(`insert into staples (id, name, position, hh) values ($1, $2, $3, $4)`, [rid(), name.slice(0, 80), Number(max) + 1, hh()]);
      }
    }
    if (b.remove) await sql(`delete from staples where id = $1 and hh = $2`, [b.remove, hh()]);
    if (b.toggle) await sql(`update staples set selected = $2 where id = $1 and hh = $3`, [b.toggle, !!b.selected, hh()]);
    if (b.toShopping) {
      const rows = await sql(`select name from staples where id = any($1) and hh = $2`, [b.toShopping, hh()]);
      await addShopping(rows.map((s) => ({ name: s.name, unit: "", q: null, aisle: "Baslistan", from: "Baslistan" })));
    }
    return ok({ staples: await list() });
  } catch (e) {
    return fail(e);
  }
}
