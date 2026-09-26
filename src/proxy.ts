import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Seluruh app di balik login. Viewer: baca saja. Admin: /admin + mutasi API.
// Ini pemeriksaan pertama; halaman & route handler memverifikasi ulang.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (!session) {
    if (isApi) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const needsAdmin =
    pathname.startsWith("/admin") ||
    (isApi && req.method !== "GET" && req.method !== "HEAD");
  if (needsAdmin && session.role !== "admin") {
    if (isApi) return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
