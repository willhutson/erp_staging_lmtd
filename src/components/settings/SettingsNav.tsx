"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Settings, Users, Calendar, Palette, Shield, Plug, FileText, Key, Bell, Lock } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Settings;
  minLevel?: "ALL" | "ADMIN" | "LEADERSHIP";
}

const settingsNav: NavItem[] = [
  { href: "/settings", label: "General", icon: Settings, minLevel: "LEADERSHIP" },
  { href: "/settings/access", label: "My Access", icon: Lock, minLevel: "ALL" },
  { href: "/settings/users", label: "Users", icon: Users, minLevel: "LEADERSHIP" },
  { href: "/settings/leave", label: "Leave & Holidays", icon: Calendar, minLevel: "LEADERSHIP" },
  { href: "/settings/branding", label: "Branding", icon: Palette, minLevel: "LEADERSHIP" },
  { href: "/settings/forms", label: "Form Templates", icon: FileText, minLevel: "LEADERSHIP" },
  { href: "/settings/notifications", label: "Notifications", icon: Bell, minLevel: "ALL" },
  { href: "/settings/integrations", label: "Integrations", icon: Plug, minLevel: "LEADERSHIP" },
  { href: "/settings/api", label: "API Keys", icon: Key, minLevel: "LEADERSHIP" },
  { href: "/settings/audit", label: "Audit Log", icon: Shield, minLevel: "LEADERSHIP" },
];

export function SettingsNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const permissionLevel = session?.user?.permissionLevel;

  // Filter nav items based on permission level
  const filteredNav = settingsNav.filter((item) => {
    if (item.minLevel === "ALL") return true;
    if (item.minLevel === "LEADERSHIP") {
      return ["ADMIN", "LEADERSHIP"].includes(permissionLevel || "");
    }
    if (item.minLevel === "ADMIN") {
      return permissionLevel === "ADMIN";
    }
    return false;
  });

  return (
    <nav className="lg:col-span-1 space-y-1">
      {filteredNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
