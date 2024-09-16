"use server";

import { decrypt } from "@/app/session";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function disconnect() {
  "use server";

  const cookieStore = cookies();

  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const { accessToken, scopes } = await decrypt<{ accessToken: string }>(
    cookieStore.get("accessToken")?.value
  );

  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );

  console.log("Revoking token...", { accessToken, scopes });
  await google.revokeToken(accessToken);

  cookieStore.delete("accessToken");
  console.log("Token revoked");
}

export async function listProjects() {
  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  cookies().set({
    name: "state",
    value: state,
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  cookies().set({
    name: "codeVerifier",
    value: codeVerifier,
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  console.log(
    "oauth step 1: created state and codeVerifier, saved them to cookies",
    {
      state,
      codeVerifier,
    }
  );

  // create Google OAuth URL
  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );
  const scopes = ["https://www.googleapis.com/auth/firebase.readonly"];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  console.log("oauth step 2: redirecting to Google OAuth URL...", url.href);
  redirect(url.href);
}
