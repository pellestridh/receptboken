import { db, rid } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";
import { aisleFor } from "@/lib/aisles";

export const dynamic = "force-dynamic";

const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);

async function list() {
  const rows = await db()(`select * from shopping_items order by created_at`);
  return rows.map((r) => ({
    id: r.id, name: r.name, unit: r.unit, q: r.q, q2: r.q2, amt: r.amt, aisle: r.aisle,
    pantry: r.pantry, from: r.from_recipes || [], done: r.done,
  }));
}

export async function GET() {
  try { return ok({ items: await list() }); } catch (e) { return fail(e, 500); }
}

// { items: [{name, unit, q, q2, amt, pantry, from}] } eller { custom: "namn" }
export async function POST(req) {
  try {
    const sql = db();
    const b = await body(req);
    if (b.custom) {
      const name = String(b.custom).trim().slice(0, 120);
      if (name) await sql(`insert into shopping_items (id,name,aisle) values ($1,$2,'Egna varor')`, [rid(), name]);
      return ok({ items: await list() });
    }
    const current = await list();
    for (const it of b.items || []) {
      if (!it?.name) continue;
      const key = it.name.toLowerCase() + "|" + (it.unit || "");
      const ex = current.find((x) => !x.done && x.name.toLowerCase() + "|" + (x.unit || "") === key);
      const from = it.from ? [].concat(it.from) : [];
      if (ex && ex.q != null && it.q != null) {
        const q = r2(ex.q + it.q);
        const q2 = ex.q2 != null || it.q2 != null ? r2((ex.q2 ?? ex.q) + (it.q2 ?? it.q)) : null;
        const f = [...new Set([...ex.from, ...from])];
        await sql(`update shopping_items set q=$2, q2=$3, from_recipes=$4 where id=$1`, [ex.id, q, q2, JSON.stringify(f)]);
        Object.assign(ex, { q, q2, from: f });
      } else if (ex && ex.q == null && it.q == null) {
        const f = [...new Set([...ex.from, ...from])];
        await sql(`update shopping_items set from_recipes=$2 where id=$1`, [ex.id, JSON.stringify(f)]);
        ex.from = f;
      } else {
        const row = {
          id: rid(), name: it.name, unit: it.unit || "", q: r2(it.q ?? null), q2: r2(it.q2 ?? null),
          amt: it.amt || "", pantry: !!it.pantry, aisle: aisleFor(it.name, it.pantry), from, done: false,
        };
        await sql(
          `insert into shopping_items (id,name,unit,q,q2,amt,aisle,pantry,from_recipes) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [row.id, row.name, row.unit, row.q, row.q2, row.amt, row.aisle, row.pantry, JSON.stringify(row.from)]
        );
        current.push(row);
      }
    }
    return ok({ items: await list() });
  } catch (e) {
    return fail(e);
  }
}

// ?scope=done (avbockade) eller ?scope=all
export async function DELETE(req) {
  try {
    const scope = new URL(req.url).searchParams.get("scope");
    if (scope === "all") await db()(`delete from shopping_items`);
    else await db()(`delete from shopping_items where done`);
    return ok({ items: await list() });
  } catch (e) {
    return fail(e, 500);
  }
}
