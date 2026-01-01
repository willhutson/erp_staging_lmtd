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
    } catch (dbError) {
      console.error("Studio: Database query failed:", dbError);
      redirect("/hub?error=db_error");
    }

    // If user not in DB, redirect to hub instead of login loop
    if (!user) {
      console.error("Studio: User not found in database for:", supabaseUser.email);
      redirect("/hub?error=user_not_found");
    }

    return <>{children}</>;
  } catch (error) {
    // Re-throw redirect errors (Next.js uses these internally)
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Studio layout unexpected error:", error);
    redirect("/hub?error=studio_error");
  }
}
