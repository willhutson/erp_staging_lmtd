"use client";

import { SessionProvider } from "next-auth/react";
import { LtdToaster } from "@/components/ltd/primitives/ltd-toast";
import { InstanceProvider } from "@/lib/instance-context";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InstanceProvider>
        {children}
        <LtdToaster />
      </InstanceProvider>
    </SessionProvider>
  );
}
