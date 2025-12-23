"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ltd/primitives/theme-toggle";
import { Logo } from "@/components/ltd/brand/logo";
import type { PermissionLevel } from "@prisma/client";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Users,
  Clock,
  Building2,
  FileStack,
  Settings,
  TrendingUp,
  UserCircle,
  CalendarDays,
  BarChart,
  Briefcase,
  MessageSquare,
  MessageCircle,
  Inbox,
  FolderOpen,
  Zap,
  Gauge,
  HeartPulse,
  FileEdit,
  Calendar,
  Play,
  Activity,
  Layers,
  GitBranch,
  Key,
  Shield,
  Bell,
  Paintbrush,
  ClipboardList,
  ThumbsUp,
  AlertCircle,
  ImageIcon,
  Search,
} from "lucide-react";

// Slack icon component
const Slack = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredLevels?: PermissionLevel[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Briefs",
    href: "/briefs",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Submissions",
    href: "/submissions",
    icon: <Inbox className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Resources",
    href: "/resources",
    icon: <Users className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Time",
    href: "/time",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Building2 className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Retainer",
    href: "/retainer",
    icon: <Gauge className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Scope Changes",
    href: "/scope-changes",
    icon: <GitBranch className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Team",
    href: "/team",
    icon: <UserCircle className="w-5 h-5" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    title: "Leave",
    href: "/leave",
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    title: "Files",
    href: "/files",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    title: "CRM",
    href: "/crm",
    icon: <Briefcase className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    children: [
      { title: "Overview", href: "/crm", icon: <Briefcase className="w-4 h-4" /> },
      { title: "Contacts", href: "/crm/contacts", icon: <Users className="w-4 h-4" /> },
      { title: "Deals", href: "/crm/deals", icon: <TrendingUp className="w-4 h-4" /> },
    ],
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    icon: <TrendingUp className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP"],
  },
  {
    title: "RFP",
    href: "/rfp",
    icon: <FileStack className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP"],
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    icon: <MessageSquare className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  },
  {
    title: "Chat",
    href: "/chat",
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    title: "Client Health",
    href: "/feedback",
    icon: <HeartPulse className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    children: [
      { title: "Overview", href: "/feedback", icon: <HeartPulse className="w-4 h-4" /> },
      { title: "NPS Surveys", href: "/feedback/nps", icon: <ThumbsUp className="w-4 h-4" /> },
      { title: "Issues", href: "/feedback/issues", icon: <AlertCircle className="w-4 h-4" /> },
    ],
  },
  {
    title: "Content Engine",
    href: "/content-engine",
    icon: <Zap className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP"],
    children: [
      { title: "Overview", href: "/content-engine", icon: <Zap className="w-4 h-4" /> },
      { title: "Posts", href: "/content-engine/posts", icon: <FileEdit className="w-4 h-4" /> },
      { title: "Deliverables", href: "/content-engine/deliverables", icon: <Layers className="w-4 h-4" /> },
      { title: "Queue", href: "/content-engine/queue", icon: <Play className="w-4 h-4" /> },
      { title: "Events", href: "/content-engine/events", icon: <Calendar className="w-4 h-4" /> },
      { title: "Activity", href: "/content-engine/activity", icon: <Activity className="w-4 h-4" /> },
      { title: "Search", href: "/content-engine/search", icon: <Search className="w-4 h-4" /> },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP"],
    children: [
      { title: "Overview", href: "/reports", icon: <BarChart className="w-4 h-4" /> },
      { title: "Clients", href: "/reports/clients", icon: <Building2 className="w-4 h-4" /> },
      { title: "Team", href: "/reports/team", icon: <Users className="w-4 h-4" /> },
      { title: "Content", href: "/reports/content", icon: <FileText className="w-4 h-4" /> },
      { title: "Retainers", href: "/reports/retainers", icon: <Gauge className="w-4 h-4" /> },
    ],
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    icon: <Slack className="w-5 h-5" />,
    requiredLevels: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    requiredLevels: ["ADMIN"],
    children: [
      { title: "General", href: "/settings", icon: <Settings className="w-4 h-4" /> },
      { title: "Users", href: "/settings/users", icon: <Users className="w-4 h-4" /> },
      { title: "Forms", href: "/settings/forms", icon: <ClipboardList className="w-4 h-4" /> },
      { title: "API Keys", href: "/settings/api", icon: <Key className="w-4 h-4" /> },
      { title: "Branding", href: "/settings/branding", icon: <Paintbrush className="w-4 h-4" /> },
      { title: "Notifications", href: "/settings/notifications", icon: <Bell className="w-4 h-4" /> },
      { title: "Audit Log", href: "/settings/audit", icon: <Shield className="w-4 h-4" /> },
    ],
  },
];

interface DashboardShellProps {
  permissionLevel: PermissionLevel;
  children: React.ReactNode;
}

export function DashboardShell({ permissionLevel, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (!item.requiredLevels) return true;
    return item.requiredLevels.includes(permissionLevel);
  });

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    }
    return pathname.startsWith(item.href + "/");
  };

  const isExpanded = (item: NavItem): boolean => {
    if (expandedItems.includes(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    }
    return false;
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-ltd-surface-1">
        <aside className="hidden lg:flex lg:w-64 border-e border-ltd-border-1 bg-ltd-surface-2 flex-col" />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-ltd-border-1 bg-ltd-surface-overlay px-4 lg:px-6 py-4 h-[65px]" />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ltd-surface-1">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 start-0 z-50 border-e border-ltd-border-1 bg-ltd-surface-2 transform transition-all duration-200 lg:transform-none flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-ltd-border-1">
          {!collapsed && (
            <Link href="/dashboard">
              <Logo size="sm" showOS={false} />
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-ltd-primary flex items-center justify-center">
                <span className="text-ltd-primary-text font-bold text-sm">L</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-ltd-surface-3"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-ltd-text-1" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = isItemActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const expanded = isExpanded(item);

            return (
              <div key={item.href}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium transition-colors",
                        isActive
                          ? "bg-ltd-primary/10 text-ltd-primary"
                          : "text-ltd-text-1 hover:bg-ltd-surface-3"
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expanded && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {expanded && !collapsed && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-[var(--ltd-radius-md)] text-sm transition-colors",
                                childActive
                                  ? "bg-ltd-primary text-ltd-primary-text"
                                  : "text-ltd-text-2 hover:bg-ltd-surface-3 hover:text-ltd-text-1"
                              )}
                            >
                              {child.icon}
                              <span>{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium transition-colors",
                      isActive
                        ? "bg-ltd-primary text-ltd-primary-text"
                        : "text-ltd-text-1 hover:bg-ltd-surface-3"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block p-3 border-t border-ltd-border-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium border-2 border-dashed border-ltd-border-2 text-ltd-text-2 hover:bg-ltd-surface-3 hover:text-ltd-text-1 hover:border-ltd-primary hover:border-solid transition-all",
              collapsed ? "w-full justify-center" : "w-full"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-ltd-border-1 bg-ltd-surface-overlay px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-ltd-surface-3"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-ltd-text-1" />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-2 bg-ltd-surface-2 hover:bg-ltd-surface-3 hover:border-ltd-primary transition-all"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5 text-ltd-text-1" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-ltd-text-1" />
                )}
              </button>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-bold text-ltd-text-1 tracking-tight">LMTD</span>
                  <span className="font-bold bg-gradient-to-r from-ltd-primary to-[#7B61FF] bg-clip-text text-transparent">/</span>
                  <span className="text-sm font-bold tracking-wide text-ltd-text-1 ml-0.5">OS</span>
                </div>
                <span className="text-[10px] text-ltd-text-3 tracking-wide">Powered by SpokeStack</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
