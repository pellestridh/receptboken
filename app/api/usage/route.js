import { ok, fail } from "@/lib/http";
import { db } from "@/lib/db";
import { hh } from "@/lib/household";

export const dynamic = "force-dynamic";

// Förbrukning av Claude de senaste dagarna, per funktion. Bara för huvudhushållet.
export async function GET(req) {
  try {
    if (hh() !== "hem") return ok({ rows: null });
    const days = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get("dagar"), 10) || 7));
    const rows = await db()(
      `select feature, model, count(*)::int as calls, sum(input_tokens)::bigint as input, sum(output_tokens)::bigint as output
       from claude_usage where at > now() - ($1 || ' days')::interval group by feature, model order by feature`, [String(days)]
    );
    const [first] = await db()(`select min(at) as since from claude_usage`);
    return ok({ days, since: first?.since || null, rows: rows.map((r) => ({ ...r, input: Number(r.input), output: Number(r.output) })) });
  } catch (e) { return fail(e); }
}
