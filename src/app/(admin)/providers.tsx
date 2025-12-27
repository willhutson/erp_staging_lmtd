"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--ltd-surface-2)",
            border: "1px solid var(--ltd-border-1)",
            color: "var(--ltd-text-1)",
          },
          className: "admin-toast",
        }}
        theme="system"
      />
    </SessionProvider>
  );
}
