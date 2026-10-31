import { db } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

const DEFAULTS = { lightKcal: 500 };

async function read() {
  const rows = await db()(`select key, value from settings`);
  return { ...DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export async function GET() {
  try { return ok({ settings: await read() }); } catch (e) { return fail(e, 500); }
}

export async function POST(req) {
  try {
    const b = await body(req);
    if (b.lightKcal != null) {
      const v = Math.max(100, Math.min(2000, Math.round(Number(b.lightKcal) || 500)));
      await db()(`insert into settings (key, value) values ('lightKcal', $1::jsonb) on conflict (key) do update set value = excluded.value`, [JSON.stringify(v)]);
    }
    return ok({ settings: await read() });
  } catch (e) {
    return fail(e);
  }
}
