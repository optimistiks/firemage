import { encrypt } from "@/app/session";
import { ArcticFetchError, Google, OAuth2RequestError } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  console.log("oauth step 3: received code and state from Google", {
    code,
    state,
  });

  const cookieStore = cookies();
  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("codeVerifier")?.value;
  console.log("oauth step 4: retrieved state and codeVerifier from cookies", {
    storedState,
    storedCodeVerifier,
  });

  if (
    code == null ||
    storedState == null ||
    state !== storedState ||
    storedCodeVerifier == null
  ) {
    console.log("oauth state or code mismatch");
    return new Response(`Invalid request`, {
      status: 400,
    });
  }

  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );

  try {
    console.log(
      "oauth step 5: validating authorization code & retrieving tokens..."
    );
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const accessToken = tokens.accessToken();
    const accessTokenExpiresInSeconds = tokens.accessTokenExpiresInSeconds();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
    const hasRefreshToken = tokens.hasRefreshToken();
    const scopes = tokens.scopes();

    console.log("oauth result: retrieved tokens", {
      accessToken,
      accessTokenExpiresInSeconds,
      accessTokenExpiresAt,
      hasRefreshToken,
      scopes,
    });

    if (
      "refresh_token_expires_in" in tokens.data &&
      typeof tokens.data.refresh_token_expires_in === "number"
    ) {
      const refreshTokenExpiresIn = tokens.data.refresh_token_expires_in;
      console.log({ refreshTokenExpiresIn });
    }

    if (hasRefreshToken) {
      const refreshToken = tokens.refreshToken();
      console.log({ refreshToken });
    } else {
      console.log("no refresh token");
    }

    try {
      const idToken = tokens.idToken();
      console.log({ idToken });
    } catch (err) {
      console.log("no id token");
    }

    const encryptedAccessToken = await encrypt(
      { accessToken, scopes },
      accessTokenExpiresAt
    );

    cookies().set({
      name: "accessToken",
      value: encryptedAccessToken,
      httpOnly: true,
      secure: true,
      expires: accessTokenExpiresAt,
      sameSite: "lax",
      path: "/",
    });
    console.log("encrypted access token & scopes & saved them to cookies", {
      encryptedAccessToken,
    });
  } catch (e) {
    console.log(e);
    if (e instanceof OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
      const code = e.code;
      console.log({ code });
    }
    if (e instanceof ArcticFetchError) {
      // Failed to call `fetch()`
      const cause = e.cause;
      console.log({ cause });
    }
    // Parse error
    return new Response(`Invalid request`, {
      status: 400,
    });
  }

  console.log("redirecting back to home page...");
  redirect("/");
}
