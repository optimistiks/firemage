import { DisconnectGoogleButton } from "@/app/DisconnectGoogleButton";
import { decrypt } from "@/app/session";
import { cookies } from "next/headers";

export async function DisconnectGoogle() {
  console.log("disconnect google render");
  const cookieStore = cookies();
  try {
    await decrypt<{ accessToken: string }>(
      cookieStore.get("accessToken")?.value
    );
    return <DisconnectGoogleButton />;
  } catch (err) {
    return (
      <>No token, error: {err instanceof Error ? err.message : "unknown"}</>
    );
  }
}
