"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@/lib/refine/data-provider";
import {
  createAccessControlProvider,
  UserPermissions,
} from "@/lib/refine/access-control-provider";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import type { PermissionLevel } from "@config/resources/types";
import {
  Users,
  Building2,
  FolderKanban,
  Shield,
  FileText,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  Bell,
  Brain,
  BarChart3,
  MessageSquare,
  Plug,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllResources, getModuleWithResources } from "@config/resources";
import type { SpokeStackModule } from "@config/resources/types";

// Icon map for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Building2,
  FolderKanban,
  Shield,
  FileText,
  LayoutDashboard,
  Settings,
  Bell,
  Brain,
  BarChart3,
  MessageSquare,
  Plug,
  Wrench,
};

// Module icon map
const moduleIconMap: Record<SpokeStackModule, React.ComponentType<{ className?: string }>> = {
  CORE: LayoutDashboard,
  CONTENT_ENGINE: Brain,
  ANALYTICS: BarChart3,
  MESSAGING: MessageSquare,
  ACCESS_CONTROL: Shield,
  INTEGRATIONS: Plug,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin access (LEADERSHIP+)
  const permissionLevel = session.user.permissionLevel as PermissionLevel;
  const hasAdminAccess =
    permissionLevel === "ADMIN" ||
    permissionLevel === "LEADERSHIP" ||
    permissionLevel === "TEAM_LEAD";

  if (!hasAdminAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access the admin panel.
          </p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build user permissions for access control
  const getUserPermissions = (): UserPermissions | null => {
    if (!session?.user) return null;
    return {
      permissionLevel: session.user.permissionLevel as PermissionLevel,
      policies: [],
    };
  };

  const accessControlProvider = createAccessControlProvider(getUserPermissions);

  // Get resources from registry
  const registeredResources = getAllResources();
  const modulesWithResources = getModuleWithResources();

  // Build Refine resources from registry
  const refineResources = registeredResources.map((r) => {
    const Icon = iconMap[r.icon] || FileText;
    return {
      name: r.name,
      list: `/admin/${r.name}`,
      show: `/admin/${r.name}/:id`,
      edit: r.edit ? `/admin/${r.name}/:id/edit` : undefined,
      create: r.create ? `/admin/${r.name}/create` : undefined,
      meta: {
        label: r.labelPlural,
        icon: <Icon className="h-4 w-4" />,
        module: r.module,
      },
    };
  });

  // Add legacy resources (access-policies, notification-rules) until migrated
  const legacyResources = [
    {
      name: "access-policies",
      list: "/admin/access-policies",
      show: "/admin/access-policies/:id",
      edit: "/admin/access-policies/:id/edit",
      create: "/admin/access-policies/create",
      meta: {
        label: "Access Policies",
        icon: <Shield className="h-4 w-4" />,
        module: "ACCESS_CONTROL" as SpokeStackModule,
      },
    },
    {
      name: "notification-rules",
      list: "/admin/notification-rules",
      create: "/admin/notification-rules/create",
      edit: "/admin/notification-rules/:id/edit",
      meta: {
        label: "Notification Rules",
        icon: <Bell className="h-4 w-4" />,
        module: "MESSAGING" as SpokeStackModule,
      },
    },
  ];

  const allResources = [...refineResources, ...legacyResources];

  // Check if current path matches a resource
  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Refine
      dataProvider={dataProvider}
      routerProvider={routerProvider}
      accessControlProvider={accessControlProvider}
      resources={allResources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Wrench className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">SpokeStack Admin</h1>
          </div>

          <nav className="space-y-1 flex-1">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted",
                isActive("/admin") && pathname === "/admin" && "bg-muted font-medium"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Render resources grouped by module */}
            {modulesWithResources
              .filter((m) => m.resources.length > 0)
              .map((module) => {
                const ModuleIcon = moduleIconMap[module.name];
                // Get legacy resources for this module
                const moduleLegacy = legacyResources.filter(
                  (r) => r.meta.module === module.name
                );
                const hasResources = module.resources.length > 0 || moduleLegacy.length > 0;

                if (!hasResources) return null;

                return (
                  <div key={module.name} className="pt-4">
                    <div className="flex items-center gap-2 px-3 pb-2">
                      <ModuleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {module.label}
                      </span>
                    </div>

                    {/* Registry resources */}
                    {module.resources.map((resource) => {
                      const Icon = iconMap[resource.icon] || FileText;
                      const path = `/admin/${resource.name}`;
                      return (
                        <Link
                          key={resource.name}
                          href={path}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted",
                            isActive(path) && "bg-muted font-medium"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {resource.labelPlural}
                        </Link>
                      );
                    })}

                    {/* Legacy resources */}
                    {moduleLegacy.map((resource) => (
                      <Link
                        key={resource.name}
                        href={resource.list}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted",
                          isActive(resource.list) && "bg-muted font-medium"
                        )}
                      >
                        {resource.meta.icon}
                        {resource.meta.label}
                      </Link>
                    ))}
                  </div>
                );
              })}

            {/* Show modules without registry resources but with legacy */}
            {["ACCESS_CONTROL", "MESSAGING"].map((moduleName) => {
              const hasRegistryResources = modulesWithResources.some(
                (m) => m.name === moduleName && m.resources.length > 0
              );
              if (hasRegistryResources) return null;

              const moduleLegacy = legacyResources.filter(
                (r) => r.meta.module === moduleName
              );
              if (moduleLegacy.length === 0) return null;

              const ModuleIcon = moduleIconMap[moduleName as SpokeStackModule];
              const moduleLabel = moduleName === "ACCESS_CONTROL" ? "Access Control" : "Messaging";

              return (
                <div key={moduleName} className="pt-4">
                  <div className="flex items-center gap-2 px-3 pb-2">
                    <ModuleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {moduleLabel}
                    </span>
                  </div>
                  {moduleLegacy.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.list}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted",
                        isActive(resource.list) && "bg-muted font-medium"
                      )}
                    >
                      {resource.meta.icon}
                      {resource.meta.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>

          <div className="pt-4 border-t">
            <div className="px-3 py-2 text-sm">
              <div className="font-medium">{session.user.name}</div>
              <div className="text-xs text-muted-foreground">
                {session.user.permissionLevel}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </Refine>
  );
}
