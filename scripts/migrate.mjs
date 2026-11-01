// Skapar och uppdaterar databasens tabeller. Körs automatiskt vid varje bygge på Vercel.
// Fyller databasen med recepten i data/seed.json första gången.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.log("[migrate] Ingen DATABASE_URL, hoppar över migrering.");
  process.exit(0);
}
let sql;
if (url.startsWith("pglite")) {
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = new PGlite(url.split(":")[1] || "./.pglite");
  sql = async (text, params = []) => (await pg.query(text, params)).rows;
} else {
  sql = neon(url);
}

const statements = [
  `create table if not exists recipes (
    id text primary key,
    title text not null,
    kitchen text, type text, base text,
    minutes int, servings int, accent text,
    image_url text, source_name text, source_url text,
    body jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
  )`,
  `create table if not exists notes (
    recipe_id text primary key,
    rating int not null default 0,
    times_cooked int not null default 0,
    last_cooked timestamptz
  )`,
  `create table if not exists note_entries (
    id text primary key,
    recipe_id text not null,
    author text,
    text text not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists note_entries_recipe on note_entries(recipe_id)`,
  `create table if not exists shopping_items (
    id text primary key,
    name text not null,
    unit text not null default '',
    q double precision, q2 double precision,
    amt text not null default '',
    aisle text not null default '',
    pantry boolean not null default false,
    from_recipes jsonb not null default '[]',
    done boolean not null default false,
    done_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists purchases (
    id text primary key,
    item_name text not null,
    store text, price double precision,
    bought_at timestamptz not null default now(),
    source text not null default 'avbockning'
  )`,
  `create table if not exists drafts (
    id text primary key,
    body jsonb not null,
    source_url text,
    created_at timestamptz not null default now()
  )`,
];

statements.push(`create table if not exists recipe_images (
    recipe_id text primary key,
    mime text not null,
    data text not null,
    updated_at timestamptz not null default now()
  )`);

statements.push(
  `create table if not exists menus (
    id text primary key,
    kind text not null,
    title text not null,
    start_date date,
    servings int not null default 2,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists menu_items (
    id text primary key,
    menu_id text not null,
    recipe_id text,
    day date,
    course text,
    servings int not null default 2,
    position int not null default 0
  )`,
  `create index if not exists menu_items_menu on menu_items(menu_id)`,
  `create table if not exists drink_feedback (
    id text primary key,
    recipe_id text,
    recipe_title text,
    kind text not null,
    suggested text,
    verdict text not null,
    your_choice text,
    reason text,
    author text,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists foods (
    nummer int primary key,
    namn text not null
  )`,
  `create table if not exists food_nutrients (
    nummer int primary key,
    kcal double precision, protein double precision, carbs double precision, fat double precision,
    fetched_at timestamptz not null default now()
  )`,
  `create table if not exists settings (
    key text primary key,
    value jsonb not null
  )`,
  `create table if not exists wine_notes (
    id text primary key,
    recipe_id text,
    recipe_title text,
    wine text not null,
    style text,
    color text,
    grape text,
    rating int,
    match int,
    dims jsonb,
    aromas jsonb,
    note text,
    price int,
    author text,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists staples (
    id text primary key,
    name text not null,
    selected boolean not null default true,
    position int not null default 0
  )`
);

statements.push(
  `alter table menus add column if not exists kcal_min int`,
  `alter table menus add column if not exists kcal_max int`
);

for (const s of statements) await sql(s);

const [{ count }] = await sql(`select count(*)::int as count from recipes`);
if (count === 0) {
  const seed = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));
  for (const r of seed.recipes) {
    const { id, title, kitchen, type, base, minutes, servings, accent, source } = r;
    await sql(
      `insert into recipes (id,title,kitchen,type,base,minutes,servings,accent,source_name,source_url,body)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do nothing`,
      [id, title, kitchen, type, base, minutes, servings, accent, source?.name || null, source?.url || null, JSON.stringify(r)]
    );
  }
  console.log(`[migrate] La in ${seed.recipes.length} recept.`);
}
// Hämtar bilder från källsidan för recept som har en länk men ingen bild.
const missing = await sql(`select id, source_url, body from recipes where image_url is null and source_url is not null and deleted_at is null limit 50`);
if (missing.length) {
  const fetchImageFor = async (url) => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" } });
      if (!res.ok) return null;
      const html = await res.text();
      return html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] || null;
    } catch { return null; }
  };
  for (const r of missing) {
    const img = await fetchImageFor(r.source_url);
    if (!img) { console.log(`[migrate] Ingen bild hittades för ${r.id}`); continue; }
    await sql(`update recipes set image_url = $2, body = jsonb_set(body, '{image}', to_jsonb($2::text)) where id = $1`, [r.id, img]);
    console.log(`[migrate] Bild till ${r.id}`);
  }
}

console.log("[migrate] Klart.");
