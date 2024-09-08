import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "./app/session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    // https://developers.google.com/identity/protocols/oauth2/web-server#node.js_1
    // create "state" parameter for Google OAuth and save it in an encrypted cookie
    // we use Web Crypto API for the sake of Edge Runtime, not the node "crypto" module
    const state = crypto.randomUUID();
  console.log("new session state", state)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ state, expiresAt });
    const response = NextResponse.next();
    response.cookies.set({
      name: "session",
      value: session,
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
