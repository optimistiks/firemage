import "server-only";

import { EncryptJWT, jwtDecrypt, base64url, JWTPayload } from "jose";

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

export async function decrypt<T extends JWTPayload>(
  session: string | undefined = ""
): Promise<T & JWTPayload> {
  const { payload, protectedHeader } = await jwtDecrypt<T>(session, encodedKey);
  console.log("decrypted", { payload, protectedHeader });
  return payload;
}
