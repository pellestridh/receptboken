import { db, rid } from "@/lib/db";
import { generateDrinks } from "@/lib/drinks";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const NAMES = { wine: "vin", beer: "öl", nonAlcoholic: "alkoholfritt alternativ" };
const KINDS = ["wine", "beer", "nonAlcoholic"];

async function save(id, drinks) {
  await db()(`update recipes set body = jsonb_set(body, '{drinks}', $2::jsonb), updated_at = now() where id = $1`, [id, JSON.stringify(drinks)]);
  return drinks;
}

async function log(recipe, id, kind, verdict, suggested, choice, reason, author) {
  await db()(
    `insert into drink_feedback (id, recipe_id, recipe_title, kind, suggested, verdict, your_choice, reason, author) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [rid(), id, recipe.title, kind, suggested || null, verdict, choice || null, reason || null, String(author || "").slice(0, 40)]
  );
}

// { action: "generate" }
// { action: "feedback", kind, verdict: "up"|"down", reason? }        tumme upp, eller nytt förslag
// { action: "add", kind, name, note?, author? }                      lägg till eget
// { action: "removeOwn", kind, index }
export async function POST(req, { params }) {
  try {
    const id = params.id;
    const b = await body(req);
    const [row] = await db()(`select body from recipes where id = $1`, [id]);
    if (!row) return fail("Receptet finns inte.", 404);
    const recipe = row.body;

    if (b.action === "generate") {
      const fresh = await generateDrinks(recipe);
      fresh.own = recipe.drinks?.own || fresh.own;
      return ok({ drinks: await save(id, fresh) });
    }

    const kind = KINDS.includes(b.kind) ? b.kind : null;
    if (!kind) throw new Error("Okänd dryck.");
    const current = { own: { wine: [], beer: [], nonAlcoholic: [] }, ...(recipe.drinks || {}) };
    current.own = { wine: [], beer: [], nonAlcoholic: [], ...(current.own || {}) };
    const suggested = current[kind]?.name || current[kind]?.style || "";
    const reason = String(b.reason || "").trim().slice(0, 300);

    if (b.action === "feedback") {
      await log(recipe, id, kind, b.verdict === "up" ? "up" : "down", suggested, null, reason, b.author);
      if (b.verdict === "up") {
        current[kind] = { ...current[kind], liked: true };
      } else {
        const fresh = await generateDrinks(recipe, `Förslaget till ${NAMES[kind]} var "${suggested}" och föll inte i smaken${reason ? `: ${reason}` : ""}. Ge ett annat förslag till ${NAMES[kind]}.`);
        current[kind] = fresh[kind] || current[kind];
      }
      return ok({ drinks: await save(id, current) });
    }

    if (b.action === "add") {
      const name = String(b.name || "").trim().slice(0, 120);
      if (!name) throw new Error("Skriv namnet på drycken.");
      const note = String(b.note || "").trim().slice(0, 200);
      current.own[kind] = [...current.own[kind], { name, note, author: String(b.author || "").slice(0, 40) }];
      await log(recipe, id, kind, "added", suggested, name, note, b.author);
      return ok({ drinks: await save(id, current) });
    }

    if (b.action === "removeOwn") {
      current.own[kind] = current.own[kind].filter((_, i) => i !== Number(b.index));
      return ok({ drinks: await save(id, current) });
    }

    throw new Error("Okänd åtgärd.");
  } catch (e) {
    return fail(e);
  }
}
