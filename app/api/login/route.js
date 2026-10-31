import { NextResponse } from "next/server";
import { COOKIE, tokenFor } from "@/lib/auth";

export async function POST(req) {
  const { code } = await req.json().catch(() => ({}));
  const expected = process.env.FAMILY_CODE;
  if (!expected) return NextResponse.json({ error: "FAMILY_CODE är inte satt i Vercel." }, { status: 500 });
  if (!code || String(code).trim() !== expected) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Fel kod. Försök igen." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await tokenFor(expected), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
