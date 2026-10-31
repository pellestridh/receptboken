import { db, rid } from "@/lib/db";
import { listRecipes } from "@/lib/recipesList";
import { loadMenus } from "@/lib/menus";
import { suggestMany, menuDays, iso, weekNumber } from "@/lib/suggest";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok({ menus: await loadMenus() }); } catch (e) { return fail(e, 500); }
}

const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

// { kind: "vecka" | "helg" | "middag", servings? }
export async function POST(req) {
  try {
    const sql = db();
    const { kind = "vecka", servings, kcalMin, kcalMax } = await body(req);
    const kcal = Number(kcalMin) > 0 && Number(kcalMax) >= Number(kcalMin) ? { min: Math.round(Number(kcalMin)), max: Math.round(Number(kcalMax)) } : null;
    if (!["vecka", "helg", "middag"].includes(kind)) throw new Error("Okänd menytyp.");
    const days = menuDays(kind);
    const recipes = (await listRecipes()).filter((r) => !r.allergens?.hits?.length);
    // Undvik rätter som redan ligger i menyer de senaste två veckorna
    const recent = await sql(`select distinct recipe_id from menu_items i join menus m on m.id = i.menu_id where m.created_at > now() - interval '14 days'`);
    const pool = recipes.filter((r) => !recent.some((x) => x.recipe_id === r.id));
    const use = pool.length >= 4 ? pool : recipes;
    const n = kind === "middag" ? 6 : Number(servings) || 2;
    const id = rid();
    let title, slots;
    if (kind === "vecka") {
      title = `Vecka ${weekNumber(days[0])}`;
      const picks = suggestMany(use, days.map(() => "vardag"), Date.now(), kcal);
      slots = days.map((d, i) => ({ day: iso(d), course: null, recipe: picks[i] }));
    } else if (kind === "helg") {
      title = `Helgen ${days[0].getDate()} ${MONTHS[days[0].getMonth()]}`;
      const picks = suggestMany(use, days.map(() => "helg"), Date.now(), kcal);
      slots = days.map((d, i) => ({ day: iso(d), course: null, recipe: picks[i] }));
    } else {
      title = `Middag ${days[0].getDate()} ${MONTHS[days[0].getMonth()]}`;
      const picks = suggestMany(use, ["forratt", "helg", "dessert"], Date.now(), kcal);
      slots = ["Förrätt", "Varmrätt", "Dessert"].map((c, i) => ({ day: iso(days[0]), course: c, recipe: picks[i] }));
    }
    await sql(`insert into menus (id, kind, title, start_date, servings, kcal_min, kcal_max) values ($1,$2,$3,$4,$5,$6,$7)`, [id, kind, title, iso(days[0]), n, kcal?.min || null, kcal?.max || null]);
    for (let i = 0; i < slots.length; i++) {
      await sql(
        `insert into menu_items (id, menu_id, recipe_id, day, course, servings, position) values ($1,$2,$3,$4,$5,$6,$7)`,
        [rid(), id, slots[i].recipe?.id || null, slots[i].day, slots[i].course, n, i]
      );
    }
    return ok({ id, menus: await loadMenus() });
  } catch (e) {
    return fail(e);
  }
}
