import { NextResponse } from "next/server";
import { COOKIE, householdFrom } from "@/lib/auth";

const OPEN = ["/login", "/api/login", "/api/shortcut", "/manifest.webmanifest", "/icon", "/apple-touch-icon", "/favicon", "/logo-", "/ol/"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const headers = new Headers(req.headers);
  headers.delete("x-hh"); // får aldrig komma från klienten
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next({ request: { headers } });
  const hh = await householdFrom(req.cookies.get(COOKIE)?.value);
  if (hh) {
    headers.set("x-hh", hh);
    return NextResponse.next({ request: { headers } });
  }
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
