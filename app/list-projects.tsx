"use server";

import { generateCodeVerifier, generateState, Google } from "arctic";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function create() {}

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
  console.log("GENERATED AND SAVED", { state, codeVerifier });

  cookies().set({
    name: "postOAuthAction",
    value: "listProjects",
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  // create Google OAuth URL
  const google = new Google(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/google-oauth-redirect"
  );
  const scopes = ["https://www.googleapis.com/auth/firebase.readonly"];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  redirect(url.href);
}
