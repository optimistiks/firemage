import { decrypt } from "@/app/session";
import { cookies } from "next/headers";

export async function DisconnectGoogle() {
  const cookieStore = cookies();
  try {
    const decrypted = await decrypt<{ accessToken: string }>(
      cookieStore.get("accessToken")?.value
    );
    return <>Token: {decrypted.accessToken}</>;
  } catch (err) {
    return (
      <>No token, error: {err instanceof Error ? err.message : "unknown"}</>
    );
  }
}
