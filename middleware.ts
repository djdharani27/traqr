import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/session", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("__session")?.value;

  if (!sessionCookie) {
    console.log("[AUTH] middleware: no __session cookie for", pathname, "→ redirecting to /login");
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
