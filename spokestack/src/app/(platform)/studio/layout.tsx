import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export interface StudioUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  organizationId: string;
  permissionLevel: string;
}

// Studio layout handles authentication for all studio routes
// Child pages can rely on being authenticated without calling auth() again
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Step 1: Get Supabase session
    let session;
    try {
      session = await getSession();
    } catch (sessionError) {
      console.error("Studio: Failed to get session:", sessionError);
      redirect("/hub?error=session_failed");
    }

    if (!session) {
      redirect("/login");
    }

    // Step 2: Get Supabase user
    let supabaseUser;
    try {
      supabaseUser = await getUser();
    } catch (userError) {
      console.error("Studio: Failed to get user:", userError);
      redirect("/hub?error=user_fetch_failed");
    }

    if (!supabaseUser) {
      redirect("/login");
    }

    // Step 3: Find user in database
    let user;
    try {
      // Try supabaseId first
      user = await prisma.user.findFirst({
        where: { supabaseId: supabaseUser.id }
      });

      // If not found by supabaseId, try email
      if (!user && supabaseUser.email) {
        user = await prisma.user.findFirst({
          where: { email: supabaseUser.email }
        });

        // Link supabaseId for future lookups
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: supabaseUser.id }
          });
        }
      }
    } catch (dbError: unknown) {
      // Log detailed DB error
      const dbErrorInfo = {
        name: dbError instanceof Error ? dbError.name : "Unknown",
        message: dbError instanceof Error ? dbError.message : String(dbError),
        code: (dbError as { code?: string })?.code,
        meta: (dbError as { meta?: unknown })?.meta,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.slice(0, 30),
      };
      console.error("Studio: Database query failed:", JSON.stringify(dbErrorInfo, null, 2));

      // Include more error details in redirect (200 chars)
      const errMsg = dbError instanceof Error ? dbError.message.slice(0, 200) : "unknown";
      redirect(`/hub?error=db_error&msg=${encodeURIComponent(errMsg)}`);
    }

    // If user not in DB, redirect to hub instead of login loop
    if (!user) {
      console.error("Studio: User not found in database for:", supabaseUser.email);
      redirect("/hub?error=user_not_found");
    }

    return <>{children}</>;
  } catch (error: unknown) {
    // Re-throw redirect errors (Next.js uses these internally)
    if (isRedirectError(error)) {
      throw error;
    }

    // Log detailed error info for debugging
    const errorInfo = {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      digest: (error as { digest?: string })?.digest,
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : undefined,
    };
    console.error("Studio layout unexpected error:", JSON.stringify(errorInfo, null, 2));

    // Include error name in redirect for debugging
    const errorName = error instanceof Error ? error.name : "unknown";
    redirect(`/hub?error=studio_error&type=${encodeURIComponent(errorName)}`);
  }
}
