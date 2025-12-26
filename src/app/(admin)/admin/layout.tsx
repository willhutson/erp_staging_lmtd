"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@/lib/refine/data-provider";
import {
  createAccessControlProvider,
  UserPermissions,
} from "@/lib/refine/access-control-provider";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PermissionLevel } from "@prisma/client";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

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
      // TODO: Load user's assigned policies from API
      policies: [],
    };
  };

  const accessControlProvider = createAccessControlProvider(getUserPermissions);

  // Define resources
  const resources = [
    {
      name: "users",
      list: "/admin/users",
      show: "/admin/users/:id",
      edit: "/admin/users/:id/edit",
      create: "/admin/users/create",
      meta: {
        label: "Users",
        icon: <Users className="h-4 w-4" />,
      },
    },
    {
      name: "clients",
      list: "/admin/clients",
      show: "/admin/clients/:id",
      edit: "/admin/clients/:id/edit",
      create: "/admin/clients/create",
      meta: {
        label: "Clients",
        icon: <Building2 className="h-4 w-4" />,
      },
    },
    {
      name: "projects",
      list: "/admin/projects",
      show: "/admin/projects/:id",
      edit: "/admin/projects/:id/edit",
      create: "/admin/projects/create",
      meta: {
        label: "Projects",
        icon: <FolderKanban className="h-4 w-4" />,
      },
    },
    {
      name: "access-policies",
      list: "/admin/access-policies",
      show: "/admin/access-policies/:id",
      edit: "/admin/access-policies/:id/edit",
      create: "/admin/access-policies/create",
      meta: {
        label: "Access Policies",
        icon: <Shield className="h-4 w-4" />,
      },
    },
    {
      name: "audit-logs",
      list: "/admin/audit-logs",
      show: "/admin/audit-logs/:id",
      meta: {
        label: "Audit Logs",
        icon: <FileText className="h-4 w-4" />,
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
      },
    },
  ];

  return (
    <Refine
      dataProvider={dataProvider}
      routerProvider={routerProvider}
      accessControlProvider={accessControlProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">Admin Panel</h1>
          </div>

          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Resources
              </span>
            </div>

            {resources.map((resource) => (
              <Link
                key={resource.name}
                href={resource.list || "#"}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
              >
                {resource.meta?.icon}
                {resource.meta?.label || resource.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t">
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
