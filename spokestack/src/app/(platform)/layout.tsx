import { redirect } from "next/navigation";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get user from database (must be pre-created via admin panel)
  const supabaseUser = await getUser();
  let user = null;

  if (supabaseUser) {
    try {
      // Find user by supabaseId or email
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { supabaseId: supabaseUser.id },
            { email: supabaseUser.email ?? undefined }
          ]
        }
      });

      // Link supabaseId if user found by email but not yet linked
      if (user && !user.supabaseId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { supabaseId: supabaseUser.id }
        });
      }
    } catch (error) {
      console.error("Error fetching user from database:", error);
      // Continue without user data - they can still access the app
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user?.name,
          email: user?.email,
          avatarUrl: user?.avatarUrl,
        }}
      />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
