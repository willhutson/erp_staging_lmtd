"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Settings,
  Megaphone,
  BarChart3,
  Headphones,
  Grid3X3,
  CreditCard,
  Globe,
  UserCircle,
  LogOut,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Palette,
  Plug,
  Shield,
  Layers,
  FileText,
  Clock,
  Palmtree,
  Target,
  Briefcase,
  Calendar,
  FolderKanban,
  Repeat,
  Radio,
  Home,
  MessageSquare,
  Eye,
  FileCheck,
  Presentation,
  Video,
  ImageIcon,
} from "lucide-react";
import type { TenantConfig } from "@/lib/tenant";

// Administration modules
const adminModules = [
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    href: "/admin",
    color: "text-slate-500",
    bgColor: "bg-slate-500",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Organizations", href: "/admin/organizations", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/roles", icon: UserCircle },
      { label: "Client Portals", href: "/admin/instances", icon: Layers },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
    ],
  },
  {
    id: "superadmin",
    label: "Super Admin",
    icon: Shield,
    href: "/superadmin",
    color: "text-red-500",
    bgColor: "bg-red-500",
    superAdminOnly: true,
    badge: "Staff",
    items: [
      { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
      { label: "Organizations", href: "/superadmin/organizations", icon: Building2 },
      { label: "Instances", href: "/superadmin/instances", icon: Layers },
      { label: "Domains", href: "/superadmin/domains", icon: Globe },
    ],
  },
];

// Module bundles with nested modules
const moduleBundles = [
  {
    id: "erp",
    label: "ERP",
    tagline: "Core Operations",
    icon: Briefcase,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500",
    modules: [
      {
        id: "briefs",
        label: "Briefs",
        icon: FileText,
        href: "/briefs",
        items: [
          { label: "All Briefs", href: "/briefs" },
          { label: "My Briefs", href: "/briefs/my" },
          { label: "Pending Review", href: "/briefs/pending" },
        ],
      },
      {
        id: "time",
        label: "Time",
        icon: Clock,
        href: "/time",
        items: [
          { label: "Timer", href: "/time" },
          { label: "Timesheet", href: "/time/timesheet" },
          { label: "Approvals", href: "/time/approvals" },
        ],
      },
      {
        id: "leave",
        label: "Leave",
        icon: Palmtree,
        href: "/leave",
        items: [
          { label: "My Leave", href: "/leave" },
          { label: "Calendar", href: "/leave/calendar" },
          { label: "Approvals", href: "/leave/approvals" },
        ],
      },
      {
        id: "team",
        label: "Team",
        icon: Users,
        href: "/team",
        items: [
          { label: "Directory", href: "/team" },
          { label: "Departments", href: "/team/departments" },
          { label: "Org Chart", href: "/team/org-chart" },
        ],
      },
      { id: "chat", label: "SpokeChat", icon: MessageSquare, href: "/chat" },
    ],
  },
  {
    id: "agency",
    label: "Agency",
    tagline: "Client Services",
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    modules: [
      { id: "clients", label: "Clients", icon: Building2, href: "/clients" },
      { id: "retainers", label: "Retainers", icon: Repeat, href: "/retainers" },
      { id: "projects", label: "Projects", icon: FolderKanban, href: "/projects" },
      { id: "resources", label: "Resources", icon: Calendar, href: "/resources" },
      { id: "crm", label: "CRM", icon: Handshake, href: "/crm" },
      { id: "rfp", label: "RFP Pipeline", icon: Target, href: "/rfp" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    tagline: "Digital Tools",
    icon: Megaphone,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    modules: [
      {
        id: "listening",
        label: "Listening",
        icon: Headphones,
        href: "/listening",
        items: [
          { label: "Overview", href: "/listening" },
          { label: "Trackers", href: "/listening/trackers" },
          { label: "Creators", href: "/listening/creators" },
          { label: "Content", href: "/listening/content" },
        ],
      },
      {
        id: "mediabuying",
        label: "Media Buying",
        icon: CreditCard,
        href: "/mediabuying",
        items: [
          { label: "Accounts", href: "/mediabuying/accounts" },
          { label: "Campaigns", href: "/mediabuying/campaigns" },
          { label: "Budgets", href: "/mediabuying/budgets" },
        ],
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/analytics",
        items: [
          { label: "Overview", href: "/analytics" },
          { label: "Campaigns", href: "/analytics/campaigns" },
          { label: "Platforms", href: "/analytics/platforms" },
        ],
      },
      {
        id: "builder",
        label: "Builder",
        icon: Palette,
        href: "/builder",
        items: [
          { label: "Dashboards", href: "/builder/dashboards" },
          { label: "Widgets", href: "/builder/widgets" },
          { label: "Templates", href: "/builder/templates" },
        ],
      },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    tagline: "Creative Workspace",
    icon: Sparkles,
    color: "text-violet-500",
    bgColor: "bg-violet-500",
    modules: [
      { id: "studio-dashboard", label: "Dashboard", icon: Sparkles, href: "/studio" },
      { id: "studio-docs", label: "Documents", icon: FileText, href: "/studio/docs" },
      { id: "studio-decks", label: "Pitch Decks", icon: Presentation, href: "/studio/decks" },
      { id: "studio-video", label: "Video Studio", icon: Video, href: "/studio/video" },
      { id: "studio-moodboard", label: "Moodboard", icon: ImageIcon, href: "/studio/moodboard" },
      { id: "studio-calendar", label: "Calendar", icon: Calendar, href: "/studio/calendar" },
      { id: "studio-skills", label: "AI Skills", icon: Sparkles, href: "/studio/skills" },
    ],
  },
  {
    id: "portal",
    label: "Client",
    tagline: "Clients Only",
    icon: Eye,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    badge: "Clients",
    modules: [
      { id: "portal-dashboard", label: "Dashboard", icon: Grid3X3, href: "/portal" },
      { id: "portal-approvals", label: "Approvals", icon: FileCheck, href: "/portal/approvals" },
      { id: "portal-deliverables", label: "Deliverables", icon: FolderKanban, href: "/portal/deliverables" },
      { id: "portal-reports", label: "Reports", icon: BarChart3, href: "/portal/reports" },
    ],
  },
];

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
  tenant?: TenantConfig;
}

export function AppSidebar({ user, tenant }: AppSidebarProps) {
  const pathname = usePathname();
  const [expandedBundles, setExpandedBundles] = useState<string[]>(["erp", "agency", "marketing", "studio", "portal"]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Check if this is the default SpokeStack tenant (super admin access)
  const isSpokeStackAdmin = !tenant?.organizationId || tenant?.id === "default";

  // Filter admin modules
  const filteredAdminModules = adminModules.filter((m) => {
    if (m.superAdminOnly) return isSpokeStackAdmin;
    return true;
  });

  // Check if path is within a bundle/module
  const isPathInBundle = (bundleId: string) => {
    const bundle = moduleBundles.find((b) => b.id === bundleId);
    if (!bundle) return false;
    return bundle.modules.some((m) => pathname.startsWith(m.href));
  };

  const isPathInModule = (moduleHref: string) => {
    return pathname.startsWith(moduleHref);
  };

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles((prev) =>
      prev.includes(bundleId)
        ? prev.filter((id) => id !== bundleId)
        : [...prev, bundleId]
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Use tenant branding or defaults
  const brandName = tenant?.name || "SpokeStack";
  const brandInitial = brandName.charAt(0).toUpperCase();
  const primaryColor = tenant?.primaryColor || "#52EDC7";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/hub" className="flex items-center gap-3">
          {tenant?.logoMark ? (
            <img src={tenant.logoMark} alt={brandName} className="h-8 w-8 rounded-lg" />
          ) : (
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-[#0A1628] font-bold text-sm">{brandInitial}</span>
            </div>
          )}
          <span className="font-semibold text-lg">{brandName}</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Hub Link */}
        <SidebarGroup className="pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/hub"}>
                <Link href="/hub">
                  <Home className="h-4 w-4" />
                  <span>Hub</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        {/* Administration */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredAdminModules.map((module) => {
                const Icon = module.icon;
                const isActive = pathname.startsWith(module.href);
                const isExpanded = expandedModules.includes(module.id) || isActive;

                return (
                  <Collapsible
                    key={module.id}
                    open={isExpanded}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", module.color)} />
                            <span>{module.label}</span>
                            {module.badge && (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                {module.badge}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {module.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === item.href}
                                >
                                  <Link href={item.href}>
                                    <ItemIcon className="h-3.5 w-3.5" />
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        {/* Module Bundles */}
        {moduleBundles.map((bundle) => {
          const BundleIcon = bundle.icon;
          const isBundleExpanded = expandedBundles.includes(bundle.id);
          const isBundleActive = isPathInBundle(bundle.id);

          return (
            <SidebarGroup key={bundle.id}>
              <Collapsible
                open={isBundleExpanded}
                onOpenChange={() => toggleBundle(bundle.id)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={cn(
                      "flex items-center justify-between cursor-pointer hover:bg-accent rounded-md px-2 py-1.5 transition-colors",
                      isBundleActive && "bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1 rounded", bundle.bgColor + "/10")}>
                        <BundleIcon className={cn("h-3.5 w-3.5", bundle.color)} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {bundle.label}
                      </span>
                      {"badge" in bundle && bundle.badge ? (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal text-cyan-600 border-cyan-300">
                          {bundle.badge}
                        </Badge>
                      ) : (
                        <span className="text-[9px] text-muted-foreground font-normal normal-case">
                          {bundle.tagline}
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform",
                        isBundleExpanded && "rotate-90"
                      )}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {bundle.modules.map((module) => {
                        const ModuleIcon = module.icon;
                        const isModuleActive = isPathInModule(module.href);
                        const hasItems = "items" in module && module.items;
                        const isModuleExpanded =
                          expandedModules.includes(module.id) || isModuleActive;

                        if (hasItems) {
                          return (
                            <Collapsible
                              key={module.id}
                              open={isModuleExpanded}
                              onOpenChange={() => toggleModule(module.id)}
                            >
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton
                                    className={cn(
                                      "w-full justify-between",
                                      isModuleActive && "bg-primary/10 text-primary"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ModuleIcon className="h-4 w-4" />
                                      <span>{module.label}</span>
                                    </div>
                                    <ChevronRight
                                      className={cn(
                                        "h-3.5 w-3.5 transition-transform",
                                        isModuleExpanded && "rotate-90"
                                      )}
                                    />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {module.items.map((item) => (
                                      <SidebarMenuSubItem key={item.href}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={pathname === item.href}
                                        >
                                          <Link href={item.href}>
                                            <span>{item.label}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          );
                        }

                        return (
                          <SidebarMenuItem key={module.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isModuleActive}
                              className={cn(
                                isModuleActive && "bg-primary/10 text-primary font-medium"
                              )}
                            >
                              <Link href={module.href}>
                                <ModuleIcon className="h-4 w-4" />
                                <span>{module.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#52EDC7] text-[#0A1628] text-xs font-medium">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">
                        {user?.name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
