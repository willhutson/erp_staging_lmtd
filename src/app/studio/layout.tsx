import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/layout/StudioShell";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

function StudioAuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-ltd-surface-1">
      <div className="max-w-md w-full p-8 rounded-lg border border-red-500/30 bg-red-500/5">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">
            Unable to verify your session. Please try logging in again.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2 bg-ltd-primary text-ltd-primary-text rounded-md font-medium hover:bg-ltd-primary-dark transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    return <StudioShell>{children}</StudioShell>;
  } catch (error) {
    console.error("Studio layout auth error:", error);
    return <StudioAuthError />;
  }
}
