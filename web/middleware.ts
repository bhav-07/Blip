import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = checkIfUserIsLoggedIn(request);

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoggedIn && pathname !== "/login" && pathname !== "/signup") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

function checkIfUserIsLoggedIn(request: NextRequest): boolean {
  const sessionToken = request.cookies.get("session_token");
  return !!sessionToken;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
