import { redirect } from "next/navigation";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { TenantProvider } from "@/lib/tenant-context";
import { getTenant } from "@/lib/get-tenant";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get tenant configuration for this domain
  let tenant;
  try {
    tenant = await getTenant();
  } catch (error) {
    console.error("Error getting tenant:", error);
    // Use default tenant config
    tenant = {
      id: "default",
      slug: "spokestack",
      name: "SpokeStack",
      logo: null,
      logoMark: null,
      favicon: null,
      primaryColor: "#52EDC7",
      secondaryColor: "#1BA098",
      domain: null,
      customDomain: null,
      subdomain: null,
      enabledModules: [],
      settings: {},
      tier: "pro" as const,
      organizationId: "",
    };
  }

  // Get user from database (must be pre-created via admin panel)
  const supabaseUser = await getUser();
  let user = null;

  if (supabaseUser) {
    try {
      // Build OR conditions, filtering out undefined email
      const orConditions: { supabaseId?: string; email?: string }[] = [
        { supabaseId: supabaseUser.id }
      ];
      if (supabaseUser.email) {
        orConditions.push({ email: supabaseUser.email });
      }

      // Find user by supabaseId or email, scoped to tenant's organization if available
      const whereClause: Record<string, unknown> = {
        OR: orConditions
      };

      // If tenant has an organizationId, scope user lookup to that org
      if (tenant.organizationId) {
        whereClause.organizationId = tenant.organizationId;
      }

      user = await prisma.user.findFirst({
        where: whereClause
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
    <TenantProvider tenant={tenant}>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: user?.name,
            email: user?.email,
            avatarUrl: user?.avatarUrl,
          }}
          tenant={tenant}
        />
        <SidebarInset>
          <Header tenant={tenant} />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TenantProvider>
  );
}
