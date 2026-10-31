import { NextResponse } from "next/server";
import { COOKIE, isAuthed } from "@/lib/auth";

const OPEN = ["/login", "/api/login", "/api/shortcut", "/manifest.webmanifest", "/icon", "/apple-touch-icon", "/favicon"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const ok = await isAuthed(req.cookies.get(COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Du behöver logga in." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
