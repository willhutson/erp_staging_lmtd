"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Clock,
  Building2,
  FileStack,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  UserCircle,
  CalendarDays,
  Video,
  Image,
  PenTool,
  Languages,
  Target,
  BarChart,
  Briefcase,
  Camera,
  Film,
  Palette,
  MessageSquare,
  MessageCircle,
  Inbox,
  FolderOpen,
  Zap,
  Gauge,
  HeartPulse,
  FileEdit,
  Brain,
  Calendar,
  Search,
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
  Slack,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@prisma/client";
import { useState } from "react";
import type { DynamicMenuItem } from "@/modules/forms/actions/form-template-actions";

// Icon mapping for dynamic menu items
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Video,
  Image,
  PenTool,
  Languages,
  Target,
  BarChart,
  Briefcase,
  Camera,
  Film,
  Palette,
  MessageSquare,
  TrendingUp,
  FileStack,
};

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
    title: "Assets",
    href: "/assets",
    icon: <ImageIcon className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
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
      { title: "Skills", href: "/content-engine/skills", icon: <Brain className="w-4 h-4" /> },
      { title: "Knowledge", href: "/content-engine/knowledge", icon: <FileText className="w-4 h-4" /> },
      { title: "Events", href: "/content-engine/events", icon: <Calendar className="w-4 h-4" /> },
      { title: "Search", href: "/content-engine/search", icon: <Search className="w-4 h-4" /> },
      { title: "Sandbox", href: "/content-engine/sandbox", icon: <Play className="w-4 h-4" /> },
      { title: "Activity", href: "/content-engine/activity", icon: <Activity className="w-4 h-4" /> },
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
      { title: "Audit Log", href: "/settings/audit", icon: <Shield className="w-4 h-4" /> },
      { title: "Branding", href: "/settings/branding", icon: <Paintbrush className="w-4 h-4" /> },
      { title: "Leave Policy", href: "/settings/leave", icon: <CalendarDays className="w-4 h-4" /> },
      { title: "Notifications", href: "/settings/notifications", icon: <Bell className="w-4 h-4" /> },
    ],
  },
];

interface SidebarProps {
  permissionLevel: PermissionLevel;
  dynamicMenuItems?: DynamicMenuItem[];
}

export function Sidebar({ permissionLevel, dynamicMenuItems = [] }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const visibleItems = navItems.filter((item) => {
    if (!item.requiredLevels) return true;
    return item.requiredLevels.includes(permissionLevel);
  });

  // Separate top-level and nested dynamic items
  const topLevelDynamicItems = dynamicMenuItems.filter((item) => !item.menuParent);
  const briefsNestedItems = dynamicMenuItems.filter((item) => item.menuParent === "briefs");

  // Toggle expanded state for items with children
  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  // Check if an item or its children are active
  const isItemActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    }
    return pathname.startsWith(item.href + "/");
  };

  // Auto-expand parent if child is active
  const isExpanded = (item: NavItem): boolean => {
    if (expandedItems.includes(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    }
    return false;
  };

  // Helper to render a dynamic menu item
  const renderDynamicItem = (item: DynamicMenuItem, nested = false) => {
    const IconComponent = item.icon ? iconMap[item.icon] : FileText;
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          nested && "ml-4 text-sm",
          isActive
            ? "bg-[#52EDC7] text-gray-900"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
      >
        <IconComponent className="w-5 h-5" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen bg-gray-900 text-white flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#52EDC7] flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">SS</span>
            </div>
            <span className="font-semibold text-lg">SpokeStack</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = isItemActive(item);
          const isBriefs = item.href === "/briefs";
          const hasChildren = item.children && item.children.length > 0;
          const expanded = isExpanded(item);

          return (
            <div key={item.href}>
              {hasChildren && !collapsed ? (
                // Item with children - expandable
                <button
                  onClick={() => toggleExpanded(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#52EDC7] text-gray-900"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                // Simple link item
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#52EDC7] text-gray-900"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}

              {/* Render children if expanded */}
              {hasChildren && expanded && !collapsed && (
                <div className="mt-1 ml-4 space-y-1 border-l border-gray-800 pl-2">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          childActive
                            ? "bg-[#52EDC7]/20 text-[#52EDC7]"
                            : "text-gray-500 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        {child.icon}
                        <span>{child.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Render nested dynamic items under Briefs */}
              {isBriefs && !collapsed && briefsNestedItems.length > 0 && (
                <div className="mt-1 space-y-1">
                  {briefsNestedItems.map((nested) => renderDynamicItem(nested, true))}
                </div>
              )}
            </div>
          );
        })}

        {/* Top-level dynamic items */}
        {topLevelDynamicItems.length > 0 && (
          <>
            {!collapsed && (
              <div className="pt-3 pb-1">
                <p className="px-3 text-xs text-gray-500 uppercase tracking-wide">Custom Forms</p>
              </div>
            )}
            {topLevelDynamicItems.map((item) => renderDynamicItem(item))}
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">TeamLMTD ERP</p>
          <p className="text-xs text-gray-600">v0.1.0</p>
        </div>
      )}
    </aside>
  );
}
