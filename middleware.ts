import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Hitting middleware for path:", pathname);

  // Get token from cookie (use the new cookie name)
  const token = request.cookies.get("app_session_token")?.value;
  console.log(
    "Token from app_session_token cookie:",
    token ? "Present" : "Absent",
  );

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/farmers") ||
    pathname.startsWith("/staff");

  const isAuthRoute = pathname === "/login";

  if (isProtectedRoute && !token) {
    console.log(
      "Middleware: No app_session_token, redirecting to /login from protected route",
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    console.log(
      "Middleware: app_session_token present, redirecting to /dashboard from auth route",
    );
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
