import { db, rid } from "@/lib/db";
import { hh } from "@/lib/household";
import { addShopping } from "@/lib/shoppingDb";
import { aisleFor } from "@/lib/aisles";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

async function list() {
  const rows = await db()(`select id, name, selected, aisle from staples where hh = $1 order by position, name`, [hh()]);
  return rows.map((r) => ({ ...r, aisle: r.aisle || aisleFor(r.name) }));
}

// Varor som ofta bockas av i inköpslistan men inte finns i baslistan.
async function frequent(staples) {
  try {
    const have = new Set(staples.map((s) => s.name.toLowerCase()));
    const rows = await db()(
      `select lower(item_name) as name, count(*)::int as n from purchases where hh = $1 and bought_at > now() - interval '120 days'
       group by lower(item_name) having count(*) >= 2 order by n desc limit 30`, [hh()]);
    return rows.filter((r) => !have.has(r.name)).slice(0, 10).map((r) => r.name);
  } catch { return []; }
}

const reply = async () => { const s = await list(); return { staples: s, frequent: await frequent(s) }; };

export async function GET() {
  try { return ok(await reply()); } catch (e) { return fail(e, 500); }
}

// { add: "namn, namn" } | { remove: id } | { toggle: id, selected } | { rename: id, name } | { setAisle: id, aisle }
// | { selectNone: true } | { toShopping: [id] }
export async function POST(req) {
  try {
    const sql = db();
    const b = await body(req);
    const H = hh();
    if (b.add) {
      const existing = new Set((await list()).map((s) => s.name.toLowerCase()));
      for (const raw of String(b.add).split(/[,\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 50)) {
        const name = raw.slice(0, 80);
        if (existing.has(name.toLowerCase())) continue;
        const [{ max }] = await sql(`select coalesce(max(position), -1) as max from staples where hh = $1`, [H]);
        await sql(`insert into staples (id, name, position, hh, selected, aisle) values ($1, $2, $3, $4, false, null)`, [rid(), name, Number(max) + 1, H]);
        existing.add(name.toLowerCase());
      }
    }
    if (b.remove) await sql(`delete from staples where id = $1 and hh = $2`, [b.remove, H]);
    if (b.toggle) await sql(`update staples set selected = $2 where id = $1 and hh = $3`, [b.toggle, !!b.selected, H]);
    if (b.rename && String(b.name || "").trim()) await sql(`update staples set name = $2 where id = $1 and hh = $3`, [b.rename, String(b.name).trim().slice(0, 80), H]);
    if (b.setAisle) await sql(`update staples set aisle = $2 where id = $1 and hh = $3`, [b.setAisle, String(b.aisle || "").slice(0, 40) || null, H]);
    if (b.selectNone) await sql(`update staples set selected = false where hh = $1`, [H]);
    if (Array.isArray(b.toShopping) && b.toShopping.length) {
      const rows = (await list()).filter((s) => b.toShopping.includes(s.id));
      await addShopping(rows.map((s) => ({ name: s.name, unit: "", q: null, aisle: s.aisle, from: "Baslistan" })));
      await sql(`update staples set selected = false where id = any($1) and hh = $2`, [b.toShopping, H]);
    }
    return ok(await reply());
  } catch (e) {
    return fail(e);
  }
}
