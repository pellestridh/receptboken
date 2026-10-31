import { db } from "@/lib/db";

export const DEFAULTS = {
  lightKcal: 500,
  allergies: [
    { who: "Pelle", what: "cashewnötter" },
    { who: "Pelle", what: "pistagenötter" },
  ],
};

export async function readSettings() {
  try {
    const rows = await db()(`select key, value from settings`);
    return { ...DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function writeSetting(key, value) {
  await db()(`insert into settings (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value`, [key, JSON.stringify(value)]);
}

export const allergyKey = (allergies) => (allergies || []).map((a) => a.what.toLowerCase().trim()).sort().join("|");

export function allergyText(allergies) {
  if (!allergies?.length) return "";
  return allergies.map((a) => `${a.who ? a.who + " är" : "Någon i familjen är"} allergisk mot ${a.what}`).join(". ") + ".";
}
