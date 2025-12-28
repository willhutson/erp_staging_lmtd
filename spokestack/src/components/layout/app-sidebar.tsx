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
  MessageSquare,
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
} from "lucide-react";

// Module navigation configuration
const modules = [
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
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: Handshake,
    href: "/admin/crm",
    color: "text-blue-500",
    items: [
      { label: "Companies", href: "/admin/crm/companies", icon: Building2 },
      { label: "Contacts", href: "/admin/crm/contacts", icon: Users },
      { label: "Deals", href: "/admin/crm/deals", icon: Handshake },
      { label: "Tasks", href: "/admin/crm/tasks", icon: CheckSquare },
    ],
  },
  {
    id: "listening",
    label: "Listening",
    icon: Headphones,
    href: "/listening",
    color: "text-purple-500",
    items: [
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
];

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  // Determine which module is active
  const getActiveModule = () => {
    if (pathname.startsWith("/listening")) return "listening";
    if (pathname.startsWith("/mediabuying")) return "media-buying";
    if (pathname.startsWith("/analytics")) return "analytics";
    if (pathname.startsWith("/builder")) return "builder";
    return "admin";
  };

  const activeModule = getActiveModule();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#52EDC7] flex items-center justify-center">
            <span className="text-[#0A1628] font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg">SpokeStack</span>
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
              {modules.map((module) => {
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
