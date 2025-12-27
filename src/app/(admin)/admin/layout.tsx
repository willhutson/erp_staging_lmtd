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
  ChevronDown,
  Bell,
  Brain,
  BarChart3,
  MessageSquare,
  Plug,
  Wrench,
  Globe,
  Check,
  X,
  Minus,
  UserCircle,
  CalendarOff,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllResources, getModuleWithResources } from "@config/resources";
import type { SpokeStackModule } from "@config/resources/types";
import { useState } from "react";
import { ThemeToggle } from "@/components/ltd/primitives/theme-toggle";
import { useInstance } from "@/lib/instance-context";

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
  UserCircle,
  CalendarOff,
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

// Module color map for visual distinction
const moduleColorMap: Record<SpokeStackModule, string> = {
  CORE: "text-blue-500",
  CONTENT_ENGINE: "text-purple-500",
  ANALYTICS: "text-green-500",
  MESSAGING: "text-yellow-500",
  ACCESS_CONTROL: "text-orange-500",
  INTEGRATIONS: "text-pink-500",
};

// Status indicator component
function StatusIndicator({ api, page }: { api: "done" | "partial" | "none"; page: "done" | "partial" | "none" }) {
  const getIcon = (status: "done" | "partial" | "none") => {
    switch (status) {
      case "done":
        return <Check className="h-3 w-3 text-green-500" />;
      case "partial":
        return <Minus className="h-3 w-3 text-yellow-500" />;
      case "none":
        return <X className="h-3 w-3 text-red-400/60" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        API{getIcon(api)}
      </span>
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        UI{getIcon(page)}
      </span>
    </div>
  );
}

// Resource status mapping (what's built vs what's not)
const resourceStatus: Record<string, { api: "done" | "partial" | "none"; page: "done" | "partial" | "none" }> = {
  // Core
  users: { api: "done", page: "done" },
  clients: { api: "done", page: "done" },
  projects: { api: "done", page: "done" },
  "audit-logs": { api: "done", page: "done" },
  // Content Engine
  skills: { api: "done", page: "done" },
  "doc-templates": { api: "done", page: "done" },
  // Analytics
  "analytics-dashboards": { api: "done", page: "done" },
  "analytics-widgets": { api: "done", page: "done" },
  // Messaging
  "notification-rules": { api: "done", page: "done" },
  "email-templates": { api: "none", page: "none" },
  // Access Control
  "access-policies": { api: "done", page: "done" },
  // Integrations
  webhooks: { api: "none", page: "none" },
  "google-config": { api: "partial", page: "none" },
  "slack-config": { api: "partial", page: "none" },
};

// Instance selector for multi-tenant
function InstanceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentInstance, setInstance, instances: availableInstances } = useInstance();

  const handleSelectInstance = (id: string) => {
    setInstance(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-ltd-surface-3 hover:bg-ltd-surface-3/80 transition-colors"
      >
        <div
          className="h-4 w-4 rounded"
          style={{ backgroundColor: currentInstance.branding.primaryColor }}
        />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-ltd-text-1">{currentInstance.name}</div>
          <div className="text-[10px] text-ltd-text-3">{currentInstance.domain}</div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-ltd-text-2 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-ltd-surface-2 border border-ltd-border-1 rounded-lg shadow-lg z-50">
          {availableInstances.map((instance) => {
            const isActive = instance.id === currentInstance.id;
            return (
              <button
                key={instance.id}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 hover:bg-ltd-surface-3 first:rounded-t-lg",
                  isActive && "bg-ltd-primary/10"
                )}
                onClick={() => handleSelectInstance(instance.id)}
              >
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: instance.branding.primaryColor }}
                />
                <div className="flex-1 text-left">
                  <div className="text-sm text-ltd-text-1">{instance.name}</div>
                  <div className="text-[10px] text-ltd-text-3">{instance.domain}</div>
                </div>
                {isActive && <Check className="h-4 w-4 text-ltd-primary" />}
              </button>
            );
          })}
          <div className="border-t border-ltd-border-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-primary hover:bg-ltd-surface-3 rounded-b-lg">
              <span className="text-lg leading-none">+</span>
              Create New Instance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <div className="flex min-h-screen bg-ltd-surface-1">
        {/* Sidebar */}
        <aside className="w-72 border-r border-ltd-border-1 bg-ltd-surface-2 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-ltd-border-1">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2 text-sm text-ltd-text-2 hover:text-ltd-text-1 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Back to App
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ltd-primary to-[#7B61FF] flex items-center justify-center">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-ltd-text-1">SpokeStack</h1>
                <span className="text-[10px] uppercase tracking-wider text-ltd-text-3">Admin Console</span>
              </div>
            </div>

            {/* Instance Selector */}
            <InstanceSelector />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            {/* Dashboard */}
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive("/admin") && pathname === "/admin"
                  ? "bg-ltd-primary text-ltd-primary-text"
                  : "text-ltd-text-1 hover:bg-ltd-surface-3"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Dashboard Builder */}
            <Link
              href="/admin/builder"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive("/admin/builder")
                  ? "bg-ltd-primary text-ltd-primary-text"
                  : "text-ltd-text-1 hover:bg-ltd-surface-3"
              )}
            >
              <PenTool className="h-4 w-4" />
              Dashboard Builder
            </Link>

            {/* Render resources grouped by module */}
            {modulesWithResources
              .filter((m) => m.resources.length > 0)
              .map((module) => {
                const ModuleIcon = moduleIconMap[module.name];
                const moduleColor = moduleColorMap[module.name];
                // Get legacy resources for this module
                const moduleLegacy = legacyResources.filter(
                  (r) => r.meta.module === module.name
                );
                const hasResources = module.resources.length > 0 || moduleLegacy.length > 0;

                if (!hasResources) return null;

                return (
                  <div key={module.name} className="mt-6">
                    <div className="flex items-center gap-2 px-3 pb-2">
                      <ModuleIcon className={cn("h-3.5 w-3.5", moduleColor)} />
                      <span className="text-[10px] font-semibold text-ltd-text-3 uppercase tracking-wider">
                        {module.label}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {/* Registry resources */}
                      {module.resources.map((resource) => {
                        const Icon = iconMap[resource.icon] || FileText;
                        const path = `/admin/${resource.name}`;
                        const status = resourceStatus[resource.name];
                        return (
                          <Link
                            key={resource.name}
                            href={path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                              isActive(path)
                                ? "bg-ltd-primary/10 text-ltd-primary font-medium"
                                : "text-ltd-text-1 hover:bg-ltd-surface-3"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{resource.labelPlural}</span>
                            {status && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <StatusIndicator api={status.api} page={status.page} />
                              </div>
                            )}
                          </Link>
                        );
                      })}

                      {/* Legacy resources */}
                      {moduleLegacy.map((resource) => {
                        const status = resourceStatus[resource.name];
                        return (
                          <Link
                            key={resource.name}
                            href={resource.list}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                              isActive(resource.list)
                                ? "bg-ltd-primary/10 text-ltd-primary font-medium"
                                : "text-ltd-text-1 hover:bg-ltd-surface-3"
                            )}
                          >
                            {resource.meta.icon}
                            <span className="flex-1">{resource.meta.label}</span>
                            {status && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <StatusIndicator api={status.api} page={status.page} />
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
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
              const moduleColor = moduleColorMap[moduleName as SpokeStackModule];
              const moduleLabel = moduleName === "ACCESS_CONTROL" ? "Access Control" : "Messaging";

              return (
                <div key={moduleName} className="mt-6">
                  <div className="flex items-center gap-2 px-3 pb-2">
                    <ModuleIcon className={cn("h-3.5 w-3.5", moduleColor)} />
                    <span className="text-[10px] font-semibold text-ltd-text-3 uppercase tracking-wider">
                      {moduleLabel}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {moduleLegacy.map((resource) => {
                      const status = resourceStatus[resource.name];
                      return (
                        <Link
                          key={resource.name}
                          href={resource.list}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                            isActive(resource.list)
                              ? "bg-ltd-primary/10 text-ltd-primary font-medium"
                              : "text-ltd-text-1 hover:bg-ltd-surface-3"
                          )}
                        >
                          {resource.meta.icon}
                          <span className="flex-1">{resource.meta.label}</span>
                          {status && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <StatusIndicator api={status.api} page={status.page} />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User info + Theme Toggle */}
          <div className="p-4 border-t border-ltd-border-1 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-ltd-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-ltd-primary">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ltd-text-1 truncate">{session.user.name}</div>
                <div className="text-[10px] text-ltd-text-3 uppercase tracking-wider">
                  {session.user.permissionLevel}
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto bg-ltd-surface-1">
          {children}
        </main>
      </div>
    </Refine>
  );
}
