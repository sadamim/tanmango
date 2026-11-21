import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/web/dashboard", "/web/feed", "/web/workshops", "/web/courses", "/web/messages", "/admin"];

/** Bounce signed-out visitors away from the app, and signed-in ones away from login/sign-up. */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get("tm_session")?.value);
  const { pathname } = req.nextUrl;

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/")) && !hasSession) {
    const url = new URL("/web/login", req.url);
    url.searchParams.set("afterLoginRedirectTo", pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/web/login" || pathname === "/web/sign-up") && hasSession) {
    return NextResponse.redirect(new URL("/web/dashboard/getstarted", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/web/:path*", "/admin/:path*"] };
