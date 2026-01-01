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
  Target,
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
  Home,
  FolderKanban,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@prisma/client";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredLevels?: PermissionLevel[];
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  requiredLevels?: PermissionLevel[];
}

// New organized navigation structure per Epic spec
const navSections: NavSection[] = [
  // Hub - Always visible at top
  {
    title: "",
    items: [
      {
        title: "Hub",
        href: "/hub",
        icon: <Home className="w-5 h-5" />,
      },
    ],
  },

  // AGENCY Section
  {
    title: "Agency",
    items: [
      {
        title: "Briefs",
        href: "/briefs",
        icon: <FileText className="w-5 h-5" />,
        children: [
          { title: "All Briefs", href: "/briefs", icon: <FileText className="w-4 h-4" /> },
          { title: "Submissions", href: "/submissions", icon: <Inbox className="w-4 h-4" /> },
        ],
      },
      {
        title: "Projects",
        href: "/projects",
        icon: <FolderKanban className="w-5 h-5" />,
      },
      {
        title: "Clients",
        href: "/clients",
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        title: "Resources",
        href: "/resources",
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: "Retainers",
        href: "/retainer",
        icon: <Gauge className="w-5 h-5" />,
        children: [
          { title: "Active Retainers", href: "/retainer", icon: <Gauge className="w-4 h-4" /> },
          { title: "Scope Changes", href: "/scope-changes", icon: <GitBranch className="w-4 h-4" /> },
        ],
      },
    ],
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
  },

  // TIME & RESOURCES Section
  {
    title: "Time & Resources",
    items: [
      {
        title: "Time Tracking",
        href: "/time",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        title: "Leave",
        href: "/leave",
        icon: <CalendarDays className="w-5 h-5" />,
      },
    ],
  },

  // CRM Section
  {
    title: "CRM",
    requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    items: [
      {
        title: "Pipeline",
        href: "/pipeline",
        icon: <TrendingUp className="w-5 h-5" />,
        requiredLevels: ["ADMIN", "LEADERSHIP"],
      },
      {
        title: "Contacts",
        href: "/crm/contacts",
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: "RFP Management",
        href: "/rfp",
        icon: <FileStack className="w-5 h-5" />,
        requiredLevels: ["ADMIN", "LEADERSHIP"],
      },
    ],
  },

  // MESSAGING Section
  {
    title: "Messaging",
    items: [
      {
        title: "Team Chat",
        href: "/chat",
        icon: <MessageCircle className="w-5 h-5" />,
      },
      {
        title: "WhatsApp",
        href: "/whatsapp",
        icon: <MessageSquare className="w-5 h-5" />,
        requiredLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
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
    ],
  },

  // CONTENT Section
  {
    title: "Content",
    requiredLevels: ["ADMIN", "LEADERSHIP"],
    items: [
      {
        title: "Content Engine",
        href: "/content-engine",
        icon: <Zap className="w-5 h-5" />,
        children: [
          { title: "Overview", href: "/content-engine", icon: <Zap className="w-4 h-4" /> },
          { title: "Posts", href: "/content-engine/posts", icon: <FileEdit className="w-4 h-4" /> },
          { title: "Deliverables", href: "/content-engine/deliverables", icon: <Layers className="w-4 h-4" /> },
          { title: "Queue", href: "/content-engine/queue", icon: <Play className="w-4 h-4" /> },
          { title: "Skills", href: "/content-engine/skills", icon: <Brain className="w-4 h-4" /> },
        ],
      },
      {
        title: "Assets",
        href: "/assets",
        icon: <ImageIcon className="w-5 h-5" />,
      },
      {
        title: "Files",
        href: "/files",
        icon: <FolderOpen className="w-5 h-5" />,
      },
    ],
  },

  // INSIGHTS Section
  {
    title: "Insights",
    requiredLevels: ["ADMIN", "LEADERSHIP"],
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: <BarChart className="w-5 h-5" />,
        children: [
          { title: "Overview", href: "/reports", icon: <BarChart className="w-4 h-4" /> },
          { title: "Clients", href: "/reports/clients", icon: <Building2 className="w-4 h-4" /> },
          { title: "Team", href: "/reports/team", icon: <Users className="w-4 h-4" /> },
          { title: "Content", href: "/reports/content", icon: <FileText className="w-4 h-4" /> },
          { title: "Retainers", href: "/reports/retainers", icon: <Gauge className="w-4 h-4" /> },
        ],
      },
    ],
  },

  // ADMIN Section
  {
    title: "Admin",
    requiredLevels: ["ADMIN"],
    items: [
      {
        title: "Team Directory",
        href: "/team",
        icon: <UserCircle className="w-5 h-5" />,
      },
      {
        title: "Builder",
        href: "/admin/builder",
        icon: <Hammer className="w-5 h-5" />,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="w-5 h-5" />,
        children: [
          { title: "General", href: "/settings", icon: <Settings className="w-4 h-4" /> },
          { title: "Users", href: "/settings/users", icon: <Users className="w-4 h-4" /> },
          { title: "Forms", href: "/settings/forms", icon: <ClipboardList className="w-4 h-4" /> },
          { title: "Integrations", href: "/settings/integrations", icon: <Slack className="w-4 h-4" /> },
          { title: "API Keys", href: "/settings/api", icon: <Key className="w-4 h-4" /> },
          { title: "Audit Log", href: "/settings/audit", icon: <Shield className="w-4 h-4" /> },
          { title: "Branding", href: "/settings/branding", icon: <Paintbrush className="w-4 h-4" /> },
          { title: "Leave Policy", href: "/settings/leave", icon: <CalendarDays className="w-4 h-4" /> },
          { title: "Notifications", href: "/settings/notifications", icon: <Bell className="w-4 h-4" /> },
        ],
      },
    ],
  },
];

interface DynamicMenuItem {
  id: string;
  type: string;
  name: string;
  icon: string | null;
  menuOrder: number;
}

interface SidebarProps {
  permissionLevel: PermissionLevel;
  dynamicMenuItems?: DynamicMenuItem[];
}

export function Sidebar({ permissionLevel, dynamicMenuItems }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Check if user has access to a section
  const hasAccessToSection = (section: NavSection): boolean => {
    if (!section.requiredLevels) return true;
    return section.requiredLevels.includes(permissionLevel);
  };

  // Check if user has access to an item
  const hasAccessToItem = (item: NavItem): boolean => {
    if (!item.requiredLevels) return true;
    return item.requiredLevels.includes(permissionLevel);
  };

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

  const renderNavItem = (item: NavItem) => {
    if (!hasAccessToItem(item)) return null;

    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item);

    return (
      <div key={item.href}>
        {hasChildren && !collapsed ? (
          // Item with children - expandable
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
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
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
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
          <div className="mt-1 ml-4 space-y-0.5 border-l border-gray-800 pl-2">
            {item.children!.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
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
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen bg-gray-900 text-white flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <Link href="/hub" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#52EDC7] flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">TeamLMTD</span>
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

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => {
          if (!hasAccessToSection(section)) return null;

          const visibleItems = section.items.filter(hasAccessToItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || "top"}>
              {/* Section header */}
              {section.title && !collapsed && (
                <div className="px-3 py-1.5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {section.title}
                  </p>
                </div>
              )}
              {/* Section items */}
              <div className="space-y-0.5">
                {visibleItems.map(renderNavItem)}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">SpokeStack ERP</p>
          <p className="text-xs text-gray-600">v0.2.0</p>
        </div>
      )}
    </aside>
  );
}
