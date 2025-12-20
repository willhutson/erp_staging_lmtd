"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  PlusCircle,
  FolderOpen,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/portal",
    icon: LayoutDashboard,
  },
  {
    title: "Your Briefs",
    href: "/portal/briefs",
    icon: FileText,
  },
  {
    title: "Approvals",
    href: "/portal/approvals",
    icon: CheckCircle,
  },
  {
    title: "New Request",
    href: "/portal/requests/new",
    icon: PlusCircle,
  },
  {
    title: "Files",
    href: "/portal/files",
    icon: FolderOpen,
  },
  {
    title: "Feedback",
    href: "/portal/nps",
    icon: Star,
  },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-[#52EDC7]/10 text-[#1BA098] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
