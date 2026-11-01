import { db } from "@/lib/db";
import { hh, listHouseholds } from "@/lib/household";
import { codeHash } from "@/lib/auth";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

const slug = (s) => String(s).toLowerCase().replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "hushall";

export async function GET() {
  try { return ok({ current: hh(), households: await listHouseholds() }); } catch (e) { return fail(e); }
}

// Bara hushållet "hem" kan lägga till och ta bort hushåll. { name, code } | { remove: id } | { id, code }
export async function POST(req) {
  try {
    if (hh() !== "hem") throw new Error("Bara huvudhushållet kan hantera hushåll.");
    const b = await body(req);
    const sql = db();
    if (typeof b.homeName === "string") {
      const n = b.homeName.trim().slice(0, 60);
      if (!n) throw new Error("Skriv ett namn.");
      await sql(`insert into settings (key, value) values ('householdName', $1::jsonb) on conflict (key) do update set value = excluded.value`, [JSON.stringify(n)]);
    } else if (b.remove) {
      if (b.remove === "hem") throw new Error("Huvudhushållet kan inte tas bort.");
      await sql(`delete from households where id = $1`, [b.remove]);
    } else {
      const code = String(b.code || "").trim();
      if (code.length < 6) throw new Error("Koden behöver vara minst sex tecken.");
      if (code === process.env.FAMILY_CODE) throw new Error("Välj en annan kod än er egen.");
      const h = await codeHash(code);
      const [taken] = await sql(`select id from households where code_hash = $1`, [h]);
      if (taken && taken.id !== b.id) throw new Error("Den koden används redan.");
      if (b.id) await sql(`update households set code_hash = $2 where id = $1`, [b.id, h]);
      else {
        const name = String(b.name || "").trim().slice(0, 60);
        if (!name) throw new Error("Skriv ett namn på hushållet.");
        let id = slug(name), n = 2;
        while (id === "hem" || (await sql(`select 1 from households where id = $1`, [id])).length) id = `${slug(name)}-${n++}`;
        await sql(`insert into households (id, name, code_hash) values ($1, $2, $3)`, [id, name, h]);
      }
    }
    return ok({ current: hh(), households: await listHouseholds() });
  } catch (e) {
    return fail(e);
  }
}
