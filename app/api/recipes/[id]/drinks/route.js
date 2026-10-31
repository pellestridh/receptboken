import { db, rid } from "@/lib/db";
import { generateDrinks } from "@/lib/drinks";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const NAMES = { wine: "Vin", beer: "Öl", nonAlcoholic: "Alkoholfritt" };

async function save(id, drinks) {
  await db()(`update recipes set body = jsonb_set(body, '{drinks}', $2::jsonb), updated_at = now() where id = $1`, [id, JSON.stringify(drinks)]);
  return drinks;
}

// { action: "generate" }
// { action: "feedback", kind: "wine"|"beer"|"nonAlcoholic", verdict: "up"|"down", yourChoice?, reason?, author? }
export async function POST(req, { params }) {
  try {
    const sql = db();
    const id = params.id;
    const b = await body(req);
    const [row] = await sql(`select body from recipes where id = $1`, [id]);
    if (!row) return fail("Receptet finns inte.", 404);
    const recipe = row.body;

    if (b.action === "generate") {
      return ok({ drinks: await save(id, await generateDrinks(recipe)) });
    }

    if (b.action === "feedback") {
      const kind = ["wine", "beer", "nonAlcoholic"].includes(b.kind) ? b.kind : null;
      if (!kind) throw new Error("Okänd dryck.");
      const current = recipe.drinks || {};
      const suggested = current[kind]?.style || "";
      const choice = String(b.yourChoice || "").trim().slice(0, 200);
      const reason = String(b.reason || "").trim().slice(0, 300);
      await sql(
        `insert into drink_feedback (id, recipe_id, recipe_title, kind, suggested, verdict, your_choice, reason, author) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [rid(), id, recipe.title, kind, suggested, b.verdict === "up" ? "up" : "down", choice || null, reason || null, String(b.author || "").slice(0, 40)]
      );
      const next = { ...current };
      if (b.verdict === "up") {
        next[kind] = { ...current[kind], liked: true };
      } else if (choice) {
        next[kind] = { style: choice, why: reason || "Ert eget val.", examples: [], own: true };
      } else {
        const fresh = await generateDrinks(recipe, `Förslaget till ${NAMES[kind].toLowerCase()} var "${suggested}" och föll inte i smaken${reason ? `: ${reason}` : ""}. Ge ett annat ${NAMES[kind].toLowerCase()}förslag.`);
        next[kind] = fresh[kind];
      }
      return ok({ drinks: await save(id, next) });
    }
    throw new Error("Okänd åtgärd.");
  } catch (e) {
    return fail(e);
  }
}
