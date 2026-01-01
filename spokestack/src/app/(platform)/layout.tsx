import { redirect } from "next/navigation";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { TenantProvider } from "@/lib/tenant-context";
import { getTenant } from "@/lib/get-tenant";
import type { TenantConfig } from "@/lib/tenant";

// Default tenant configuration
const DEFAULT_TENANT: TenantConfig = {
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
  tier: "pro",
  organizationId: "",
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrap everything in try-catch to prevent server errors
  try {
    const session = await getSession();

    if (!session) {
      redirect("/login");
    }

    // Get tenant configuration for this domain
    let tenant: TenantConfig = DEFAULT_TENANT;
    try {
      tenant = await getTenant();
    } catch (error) {
      console.error("Error getting tenant:", error);
    }

    // Get user from database
    const supabaseUser = await getUser();
    let user = null;

    if (supabaseUser) {
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { supabaseId: supabaseUser.id },
              ...(supabaseUser.email ? [{ email: supabaseUser.email }] : [])
            ],
            ...(tenant.organizationId ? { organizationId: tenant.organizationId } : {})
          }
        });

        if (user && !user.supabaseId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: supabaseUser.id }
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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
  } catch (error) {
    console.error("Platform layout error:", error);
    // Return minimal layout on error
    return (
      <div className="min-h-screen bg-background">
        <main className="p-6">{children}</main>
      </div>
    );
  }
}
