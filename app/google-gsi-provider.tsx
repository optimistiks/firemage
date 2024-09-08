'use client'

import Script from "next/script";
import { createContext, useState } from "react";

export const GoogleGsiContext = createContext<typeof google | null>(null);

export function GoogleGsiProvider({ children }: { children: React.ReactNode }) {
    const [gsi, setGsi] = useState<typeof google | null>(null);
  return <GoogleGsiContext.Provider value={gsi}>{children}
        <Script src="https://accounts.google.com/gsi/client" onReady={() => setGsi(google)} />
  </GoogleGsiContext.Provider>;
}