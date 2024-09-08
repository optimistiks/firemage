"use client";

import { useContext, useEffect, useState } from "react";
import { GoogleGsiContext } from "./google-gsi-provider";

export function ExampleComponent() {
  const gsi = useContext(GoogleGsiContext);

  const [gsiClient, setGsiClient] =
    useState<google.accounts.oauth2.CodeClient | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
      throw new Error("NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is not set");
    }
    if (!gsi) {
      return;
    }
    setGsiClient(
      gsi.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        ux_mode: "popup",
        callback: (response) => {
            console.log("response from google", response);
        },
        error_callback: (error) => {
            console.log("error from google", error);
        }
      })
    );
  }, [gsi]);

  return (
    <div>
        <div>

      Has GSI: {gsi ? "Yes" : "No"}
        </div>
     {gsiClient && <button onClick={() => gsiClient.requestCode()}>Authorize with Google</button>} 
    </div>
  );
}
