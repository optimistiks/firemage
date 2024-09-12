import { cookies } from "next/headers";
import { decrypt } from "../session";
import { ArcticFetchError, Google, OAuth2RequestError } from "arctic";

export default async function GoogleOAuthRedirectPage({ searchParams }: {
  searchParams: { code: string, state: string };
}) {
  const code = searchParams.code;
  const state = searchParams.state;

  const cookieStore = cookies();

  const stateCookie = await decrypt(cookieStore.get("state")?.value);
  const codeVerifierCookie = await decrypt(
    cookieStore.get("codeVerifier")?.value
  );

  if (
    code === null ||
    stateCookie.state === null ||
    state !== stateCookie.state ||
    codeVerifierCookie.codeVerifier == null
  ) {
    // 400
    throw new Error("Invalid request");
  }

  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  try {
    const google = new Google(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      "http://localhost:3000/google-oauth-redirect"
    );
    const tokens = await google.validateAuthorizationCode(
      code,
      codeVerifierCookie.codeVerifier as string
    );
    const accessToken = tokens.accessToken();
    console.log({ accessToken });
  } catch (e) {
    console.log(e);
    if (e instanceof OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
      const code = e.code;
      console.log({ code });
      // ...
    }
    if (e instanceof ArcticFetchError) {
      // Failed to call `fetch()`
      const cause = e.cause;
      console.log({ cause });
      // ...
    }
    // Parse error
    throw e;
  }

  return <div>Google OAuth Redirect</div>;
}
