import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "traqr-user";
const PUBLIC = ["/login", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (PUBLIC.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const userId = request.cookies.get(COOKIE_NAME)?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
