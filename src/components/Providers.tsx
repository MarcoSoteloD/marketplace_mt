"use client";

import { SessionProvider } from "next-auth/react";
import { CartSynchronizer } from "./CartSynchronizer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSynchronizer /> {/* <--- AQUÍ VIVE LA SINCRONIZACIÓN */}
      {children}
    </SessionProvider>
  );
}