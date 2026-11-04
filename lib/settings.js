import { db } from "@/lib/db";
import { hh } from "@/lib/household";

// Inställningar per hushåll. Hushållet "hem" har nycklar utan prefix, andra "id/nyckel".
const prefix = () => (hh() === "hem" ? "" : hh() + "/");

export const DEFAULTS = {
  lightKcal: 500,
  drinkTaste: "Till pizza vill vi ha rött vin, gärna ett kraftigt med stor kropp. Smakrik pizza kräver smakrikt vin.",
  allergies: [
    { who: "Pelle", what: "cashewnötter" },
    { who: "Pelle", what: "pistagenötter" },
  ],
};

export async function readSettings() {
  try {
    const p = prefix();
    const base = p ? { ...DEFAULTS, allergies: [], drinkTaste: "" } : DEFAULTS;
    const rows = await db()(`select key, value from settings`);
    const mine = rows.filter((r) => (p ? r.key.startsWith(p) : !r.key.includes("/"))).map((r) => [r.key.slice(p.length), r.value]);
    return { ...base, ...Object.fromEntries(mine), household: hh() };
  } catch {
    return { ...DEFAULTS, household: hh() };
  }
}

// Inställningar som skickas till webbläsaren, utan hemligheter.
export async function publicSettings() {
  const { adminHash, ...rest } = await readSettings();
  return rest;
}

export async function writeSetting(key, value) {
  await db()(`insert into settings (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value`, [prefix() + key, JSON.stringify(value)]);
}

export const allergyKey = (allergies) => (allergies || []).map((a) => a.what.toLowerCase().trim()).sort().join("|");

export function allergyText(allergies) {
  if (!allergies?.length) return "";
  return allergies.map((a) => `${a.who ? a.who + " är" : "Någon i familjen är"} allergisk mot ${a.what}`).join(". ") + ".";
}
