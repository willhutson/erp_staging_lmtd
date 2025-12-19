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
  TrendingUp,
  UserCircle,
  CalendarDays,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@prisma/client";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredLevels?: PermissionLevel[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Briefs",
    href: "/briefs",
    icon: <FileText className="w-5 h-5" />,
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
    title: "NPS",
    href: "/nps",
    icon: <Star className="w-5 h-5" />,
    requiredLevels: ["ADMIN", "LEADERSHIP"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    requiredLevels: ["ADMIN"],
  },
];

interface SidebarProps {
  permissionLevel: PermissionLevel;
}

export function Sidebar({ permissionLevel }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (!item.requiredLevels) return true;
    return item.requiredLevels.includes(permissionLevel);
  });

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

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
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
          );
        })}
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
