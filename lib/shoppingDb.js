import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { aisleFor } from "@/lib/aisles";

const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);

export async function listShopping() {
  const rows = await db()(`select * from shopping_items where hh = $1 order by created_at`, [hh()]);
  return rows.map((r) => ({
    id: r.id, name: r.name, unit: r.unit, q: r.q, q2: r.q2, amt: r.amt, aisle: r.aisle,
    pantry: r.pantry, from: r.from_recipes || [], done: r.done,
  }));
}

// Lägger till varor och slår ihop med samma vara och enhet som redan finns i listan.
// Avbockade varor är redan köpta, så de rensas bort när nya varor läggs till. Då blandas inte förra veckans handling med nästa.
export async function addShopping(items) {
  const sql = db();
  if ((items || []).some((it) => it?.name)) await sql(`delete from shopping_items where hh = $1 and done`, [hh()]);
  const current = await listShopping();
  for (const it of items || []) {
    if (!it?.name) continue;
    const key = it.name.toLowerCase() + "|" + (it.unit || "");
    const ex = current.find((x) => !x.done && x.name.toLowerCase() + "|" + (x.unit || "") === key);
    const from = it.from ? [].concat(it.from) : [];
    if (ex && ex.q != null && it.q != null) {
      const q = r2(ex.q + it.q);
      const q2 = ex.q2 != null || it.q2 != null ? r2((ex.q2 ?? ex.q) + (it.q2 ?? it.q)) : null;
      const f = [...new Set([...ex.from, ...from])];
      await sql(`update shopping_items set q=$2, q2=$3, from_recipes=$4 where id=$1 and hh=$5`, [ex.id, q, q2, JSON.stringify(f), hh()]);
      Object.assign(ex, { q, q2, from: f });
    } else if (ex && (ex.q == null || it.q == null)) {
      const f = [...new Set([...ex.from, ...from])];
      await sql(`update shopping_items set from_recipes=$2 where id=$1 and hh=$3`, [ex.id, JSON.stringify(f), hh()]);
      ex.from = f;
    } else {
      const row = {
        id: rid(), name: it.name, unit: it.unit || "", q: r2(it.q ?? null), q2: r2(it.q2 ?? null),
        amt: it.amt || "", pantry: !!it.pantry, aisle: it.aisle || aisleFor(it.name, it.pantry), from, done: false,
      };
      await sql(
        `insert into shopping_items (id,name,unit,q,q2,amt,aisle,pantry,from_recipes,hh) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [row.id, row.name, row.unit, row.q, row.q2, row.amt, row.aisle, row.pantry, JSON.stringify(row.from), hh()]
      );
      current.push(row);
    }
  }
  return listShopping();
}
