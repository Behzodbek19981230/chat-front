import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token_chat")?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  // Agar token bo'lmasa va login sahifasida bo'lmasa → login pagega yo'naltiramiz
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Agar token bo'lsa va login sahifasida bo'lsa → dashboardga o'tkazamiz
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Himoyalangan route’larni belgilash
export const config = {
  matcher: [ "/", ],
};
