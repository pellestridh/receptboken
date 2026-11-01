import { NextResponse } from "next/server";

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(e, status = 400) {
  const message = e instanceof Error ? e.message : String(e);
  console.error("[api]", message);
  return NextResponse.json({ error: message }, { status: e?.status || status });
}

export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}
