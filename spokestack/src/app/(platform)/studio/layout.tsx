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
    const session = await getSession();

    if (!session) {
      redirect("/login");
    }

    const supabaseUser = await getUser();
    if (!supabaseUser) {
      redirect("/login");
    }

    // Find user in database - try supabaseId first, then email
    let user = await prisma.user.findFirst({
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
    console.error("Studio layout error:", error);
    // Redirect to hub on error
    redirect("/hub?error=studio_error");
  }
}
