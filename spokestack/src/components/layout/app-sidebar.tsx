"use client";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  TrendingUp,
  Radio,
} from "lucide-react";
import type { TenantConfig } from "@/lib/tenant";

// Module navigation configuration
const modules = [
  {
    id: "superadmin",
    label: "Super Admin",
    icon: Shield,
    href: "/superadmin",
    color: "text-red-500",
    superAdminOnly: true,
    items: [
      { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
      { label: "Organizations", href: "/superadmin/organizations", icon: Building2 },
      { label: "Instances", href: "/superadmin/instances", icon: Layers },
      { label: "Domains", href: "/superadmin/domains", icon: Globe },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    href: "/admin",
    color: "text-slate-500",
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
    id: "agency",
    label: "Agency",
    icon: Briefcase,
    href: "/clients",
    color: "text-emerald-500",
    items: [
      { label: "Clients", href: "/clients", icon: Building2 },
      { label: "Retainers", href: "/retainers", icon: Repeat },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Resources", href: "/resources", icon: Calendar },
      { label: "CRM", href: "/crm", icon: Handshake },
      { label: "RFP Pipeline", href: "/rfp", icon: Target },
    ],
  },
  {
    id: "listening",
    label: "Listening",
    icon: Headphones,
    href: "/listening",
    color: "text-purple-500",
    items: [
      { label: "Trackers", href: "/listening/trackers", icon: Radio },
      { label: "Creators", href: "/listening/creators", icon: Sparkles },
      { label: "Content", href: "/listening/content", icon: Grid3X3 },
      { label: "Campaigns", href: "/listening/campaigns", icon: Megaphone },
    ],
  },
  {
    id: "media-buying",
    label: "Media Buying",
    icon: CreditCard,
    href: "/mediabuying",
    color: "text-green-500",
    items: [
      { label: "Accounts", href: "/mediabuying/accounts", icon: Globe },
      { label: "Campaigns", href: "/mediabuying/campaigns", icon: Megaphone },
      { label: "Budgets", href: "/mediabuying/budgets", icon: CreditCard },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-orange-500",
    items: [
      { label: "Overview", href: "/analytics", icon: LayoutDashboard },
      { label: "Campaigns", href: "/analytics/campaigns", icon: Megaphone },
      { label: "Creators", href: "/analytics/creators", icon: Sparkles },
      { label: "Platforms", href: "/analytics/platforms", icon: Globe },
    ],
  },
  {
    id: "builder",
    label: "Builder",
    icon: Palette,
    href: "/builder",
    color: "text-pink-500",
    items: [
      { label: "Dashboards", href: "/builder/dashboards", icon: Grid3X3 },
      { label: "Widgets", href: "/builder/widgets", icon: LayoutDashboard },
      { label: "Templates", href: "/builder/templates", icon: Palette },
    ],
  },
  // ERP Modules
  {
    id: "briefs",
    label: "Briefs",
    icon: FileText,
    href: "/briefs",
    color: "text-indigo-500",
    items: [
      { label: "All Briefs", href: "/briefs", icon: FileText },
      { label: "My Briefs", href: "/briefs/my", icon: UserCircle },
      { label: "Pending Review", href: "/briefs/pending", icon: CheckSquare },
    ],
  },
  {
    id: "time",
    label: "Time",
    icon: Clock,
    href: "/time",
    color: "text-emerald-500",
    items: [
      { label: "Timer", href: "/time", icon: Clock },
      { label: "Timesheet", href: "/time/timesheet", icon: Grid3X3 },
      { label: "Approvals", href: "/time/approvals", icon: CheckSquare },
    ],
  },
  {
    id: "leave",
    label: "Leave",
    icon: Palmtree,
    href: "/leave",
    color: "text-teal-500",
    items: [
      { label: "My Leave", href: "/leave", icon: Palmtree },
      { label: "Calendar", href: "/leave/calendar", icon: Grid3X3 },
      { label: "Approvals", href: "/leave/approvals", icon: CheckSquare },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    href: "/team",
    color: "text-cyan-500",
    items: [
      { label: "Directory", href: "/team", icon: Users },
      { label: "Departments", href: "/team/departments", icon: Building2 },
      { label: "Org Chart", href: "/team/org-chart", icon: Grid3X3 },
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

  // Check if this is the default SpokeStack tenant (super admin access)
  const isSpokeStackAdmin = !tenant?.organizationId || tenant?.id === "default";

  // Filter modules based on tenant's enabled modules
  const enabledModules = tenant?.enabledModules || ["admin", "crm", "listening", "mediabuying", "analytics", "builder"];
  const filteredModules = modules.filter((m) => {
    // Super admin module only shows for SpokeStack staff
    if ((m as { superAdminOnly?: boolean }).superAdminOnly) {
      return isSpokeStackAdmin;
    }
    return enabledModules.includes(m.id);
  });

  // Determine which module is active
  const getActiveModule = () => {
    if (pathname.startsWith("/superadmin")) return "superadmin";
    // Agency module routes
    if (pathname.startsWith("/clients")) return "agency";
    if (pathname.startsWith("/retainers")) return "agency";
    if (pathname.startsWith("/projects")) return "agency";
    if (pathname.startsWith("/resources")) return "agency";
    if (pathname.startsWith("/crm")) return "agency";
    if (pathname.startsWith("/rfp")) return "agency";
    // Other modules
    if (pathname.startsWith("/listening")) return "listening";
    if (pathname.startsWith("/mediabuying")) return "media-buying";
    if (pathname.startsWith("/analytics")) return "analytics";
    if (pathname.startsWith("/builder")) return "builder";
    if (pathname.startsWith("/briefs")) return "briefs";
    if (pathname.startsWith("/time")) return "time";
    if (pathname.startsWith("/leave")) return "leave";
    if (pathname.startsWith("/team")) return "team";
    return "admin";
  };

  const activeModule = getActiveModule();

  // Use tenant branding or defaults
  const brandName = tenant?.name || "SpokeStack";
  const brandInitial = brandName.charAt(0).toUpperCase();
  const primaryColor = tenant?.primaryColor || "#52EDC7";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/admin" className="flex items-center gap-3">
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

      <SidebarContent className="px-3">
        {/* Module Navigation */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredModules.map((module) => {
                const isActive = activeModule === module.id;
                const Icon = module.icon;

                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-accent"
                      )}
                    >
                      <Link href={module.href}>
                        <Icon className={cn("h-4 w-4", module.color)} />
                        <span>{module.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Active Module Sub-Navigation */}
        {modules.map((module) => {
          if (activeModule !== module.id) return null;

          return (
            <SidebarGroup key={module.id}>
              <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {module.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {module.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "transition-colors",
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
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
