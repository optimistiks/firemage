import { NextRequest, NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { encrypt } from "./app/session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
      throw new Error("GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set");
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const [state, codeVerifier] = await Promise.all([
      encrypt({ state: generateState() }, expiresAt),
      encrypt({ codeVerifier: generateCodeVerifier() }, expiresAt),
    ]);

    const response = NextResponse.next();

    response.cookies.set({
      name: "state",
      value: state,
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set({
      name: "codeVerifier",
      value: codeVerifier,
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
