import "server-only";

import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(
  payload: Record<string, unknown>,
  expiresAt: Date
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  const { payload } = await jwtVerify(session, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload;
}
