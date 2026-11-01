import { NextResponse } from "next/server";
import { COOKIE, cookieFor, codeHash } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req) {
  const { code } = await req.json().catch(() => ({}));
  const expected = process.env.FAMILY_CODE;
  if (!expected) return NextResponse.json({ error: "FAMILY_CODE är inte satt i Vercel." }, { status: 500 });
  const c = String(code || "").trim();
  let hh = null;
  if (c && c === expected) hh = "hem";
  else if (c) {
    try {
      const [row] = await db()(`select id from households where code_hash = $1`, [await codeHash(c)]);
      hh = row?.id || null;
    } catch {}
  }
  if (!hh) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Fel kod. Försök igen." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, household: hh });
  res.cookies.set(COOKIE, await cookieFor(hh), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
