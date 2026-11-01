import { headers } from "next/headers";
import { db } from "@/lib/db";

// Hushållet för den här förfrågan. Sätts av middleware utifrån cookien.
export function hh() {
  try { return headers().get("x-hh") || "hem"; } catch { return "hem"; }
}

function notFound(what) {
  const e = new Error(`${what} finns inte.`);
  e.status = 404;
  return e;
}

export async function ownRecipe(id) {
  const [r] = await db()(`select 1 from recipes where id = $1 and hh = $2`, [id, hh()]);
  if (!r) throw notFound("Receptet");
}

export async function ownMenu(id) {
  const [m] = await db()(`select 1 from menus where id = $1 and hh = $2`, [id, hh()]);
  if (!m) throw notFound("Menyn");
}

export async function listHouseholds() {
  try {
    const rows = await db()(`select id, name from households order by created_at`);
    return [{ id: "hem", name: process.env.HOME_NAME || "Hem" }, ...rows];
  } catch {
    return [{ id: "hem", name: "Hem" }];
  }
}
