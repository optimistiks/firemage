import "server-only";

import { EncryptJWT, jwtDecrypt, base64url } from "jose";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const secretKey = process.env.SESSION_SECRET;
const encodedKey = base64url.decode(secretKey);

export async function encrypt(
  payload: Record<string, unknown>,
  expiresAt: Date
) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .encrypt(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  const { payload, protectedHeader } = await jwtDecrypt(session, encodedKey);
  console.log("decrypted", { payload, protectedHeader });
  return payload;
}
