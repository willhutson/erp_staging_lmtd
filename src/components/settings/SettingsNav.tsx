"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Users, Calendar, Palette, Shield, Plug } from "lucide-react";

const settingsNav = [
  { href: "/settings", label: "General", icon: Settings },
  { href: "/settings/users", label: "Users", icon: Users },
  { href: "/settings/leave", label: "Leave & Holidays", icon: Calendar },
  { href: "/settings/branding", label: "Branding", icon: Palette },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/audit", label: "Audit Log", icon: Shield },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:col-span-1 space-y-1">
      {settingsNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50"
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
