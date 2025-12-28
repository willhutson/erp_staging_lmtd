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

  // Get or create user in database
  const supabaseUser = await getUser();
  let user = null;

  if (supabaseUser) {
    user = await prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: {
        email: supabaseUser.email!,
        lastLoginAt: new Date(),
      },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
        name:
          supabaseUser.user_metadata.name ||
          supabaseUser.user_metadata.full_name,
        avatarUrl: supabaseUser.user_metadata.avatar_url,
        lastLoginAt: new Date(),
      },
    });
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
