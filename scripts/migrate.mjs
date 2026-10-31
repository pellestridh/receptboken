// Skapar och uppdaterar databasens tabeller. Körs automatiskt vid varje bygge på Vercel.
// Fyller databasen med recepten i data/seed.json första gången.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.log("[migrate] Ingen DATABASE_URL, hoppar över migrering.");
  process.exit(0);
}
const sql = neon(url);

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
console.log("[migrate] Klart.");
