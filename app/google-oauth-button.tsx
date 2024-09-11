import Link from "next/link";
import { Google } from "arctic";
import { cookies } from "next/headers";
import { decrypt } from "./session";

export async function GoogleOAuthButton() {
  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const [state, codeVerifier] = await Promise.all([
    decrypt(cookies().get("state")?.value).then((payload) => payload.state),
    decrypt(cookies().get("codeVerifier")?.value).then(
      (payload) => payload.codeVerifier
    ),
  ]);

  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );

  const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
  const url = google.createAuthorizationURL(
    state as string,
    codeVerifier as string,
    scopes
  );

  return <Link href={url.href}>Google OAuth</Link>;
}
