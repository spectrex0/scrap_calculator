import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("userId")?.value;

  const protectedRoutes = ["/panel", "/dashboard", "/edit", "/settings","/api","admin"];

  const url = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some(r => url.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
