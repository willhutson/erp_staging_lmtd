"use client";

import { SessionProvider } from "next-auth/react";
import { LtdToaster } from "@/components/ltd/primitives/ltd-toast";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <LtdToaster />
    </SessionProvider>
  );
}
