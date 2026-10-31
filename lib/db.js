import { neon } from "@neondatabase/serverless";

let _sql = null;
export function db() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL saknas. Koppla Neon-databasen i Vercel.");
    _sql = url.startsWith("pglite") ? localDb(url) : neon(url);
  }
  return _sql;
}

// Bara för lokal testning: DATABASE_URL=pglite:./.pglite kör Postgres i processen.
function localDb(url) {
  let pg = null;
  return async (text, params = []) => {
    if (!pg) {
      const { PGlite } = await import(/* webpackIgnore: true */ "@electric-sql/pglite");
      pg = new PGlite(url.split(":")[1] || "./.pglite");
    }
    return (await pg.query(text, params)).rows;
  };
}

export function rid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Sparar ett recept. Kolumnerna dupliceras ur body så att listan kan läsas snabbt.
export async function saveRecipe(id, r) {
  const sql = db();
  const body = { ...r, id };
  await sql(
    `insert into recipes (id,title,kitchen,type,base,minutes,servings,accent,image_url,source_name,source_url,body,updated_at,deleted_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now(),null)
     on conflict (id) do update set title=$2,kitchen=$3,type=$4,base=$5,minutes=$6,servings=$7,accent=$8,
       image_url=$9,source_name=$10,source_url=$11,body=$12,updated_at=now(),deleted_at=null`,
    [
      id, body.title, body.kitchen || null, body.type || null, body.base || null,
      body.minutes || null, body.servings || null, body.accent || null,
      body.image || null, body.source?.name || null, body.source?.url || null,
      JSON.stringify(body),
    ]
  );
  return body;
}

export async function uniqueSlug(title) {
  const base =
    String(title || "recept").toLowerCase()
      .replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/[éè]/g, "e")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "recept";
  const sql = db();
  const rows = await sql(`select id from recipes where id = $1 or id like $2`, [base, base + "-%"]);
  const taken = new Set(rows.map((r) => r.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
