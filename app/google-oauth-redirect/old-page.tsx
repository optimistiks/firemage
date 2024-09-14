import { cookies } from "next/headers";
import { ArcticFetchError, Google, OAuth2RequestError } from "arctic";

export default async function GoogleOAuthRedirectPage({
  searchParams,
}: {
  searchParams: { code: string; state: string };
}) {
  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const code = searchParams.code;
  const state = searchParams.state;
  console.log("RECEIVED", { code, state });

  const cookieStore = cookies();

  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("codeVerifier")?.value;

  console.log("RETRIEVED", { storedState, storedCodeVerifier });

  if (
    code == null ||
    storedState == null ||
    state !== storedState ||
    storedCodeVerifier == null
  ) {
    throw new Error("Invalid request");
  }

  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const accessToken = tokens.accessToken();
    const accessTokenExpiresInSeconds = tokens.accessTokenExpiresInSeconds();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
    const hasRefreshToken = tokens.hasRefreshToken();

    console.log({
      accessToken,
      accessTokenExpiresInSeconds,
      accessTokenExpiresAt,
      hasRefreshToken,
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
    }

    try {
      const idToken = tokens.idToken();
      console.log({ idToken });
    } catch (err) {
      console.log(
        "no id token found",
        err instanceof Error ? err.message : "unknown"
      );
    }
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
    throw e;
  }

  return <div>Google OAuth Redirect</div>;
}
