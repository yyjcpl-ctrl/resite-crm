import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLogin = request.cookies.get("isLogin")?.value;

  const protectedRoutes = ["/dashboard", "/properties", "/demand", "/add-property"];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // ❌ not logged in → redirect to login
  if (isProtected && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/properties/:path*", "/demand/:path*", "/add-property/:path*"],
};
