"use client";

import { disconnect } from "./actions";

export function DisconnectGoogleButton() {
  console.log("disconnect google button render");
  return <button onClick={() => disconnect()}>Disconnect Google</button>;
}
