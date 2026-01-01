"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ltd/primitives/theme-toggle";
import { LtdToaster } from "@/components/ltd/primitives/ltd-toast";
import { Logo } from "@/components/ltd/brand/logo";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Presentation,
  Video,
  ImageIcon,
  Calendar,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

// Studio-specific navigation
const studioNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/studio",
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: "Overview & recent work",
  },
  {
    title: "Documents",
    href: "/studio/docs",
    icon: <FileText className="w-5 h-5" />,
    description: "Google Docs sync",
  },
  {
    title: "Decks",
    href: "/studio/decks",
    icon: <Presentation className="w-5 h-5" />,
    description: "Pitch deck builder",
  },
  {
    title: "Video",
    href: "/studio/video",
    icon: <Video className="w-5 h-5" />,
    description: "Scripts & storyboards",
  },
  {
    title: "Moodboard",
    href: "/studio/moodboard",
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Visual inspiration lab",
  },
  {
    title: "Calendar",
    href: "/studio/calendar",
    icon: <Calendar className="w-5 h-5" />,
    description: "Social content calendar",
  },
  {
    title: "AI Skills",
    href: "/studio/skills",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Configure AI assistants",
  },
];

interface StudioShellProps {
  children: React.ReactNode;
}

export function StudioShell({ children }: StudioShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isItemActive = (item: NavItem): boolean => {
    if (item.href === "/studio") {
      return pathname === "/studio";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
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
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-ltd-border-1">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ltd-primary to-[#7B61FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-ltd-text-1 text-sm">SpokeStudio</span>
                <span className="text-[10px] text-ltd-text-3">Creative Workspace</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-br from-ltd-primary to-[#7B61FF] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-ltd-surface-3"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-ltd-text-1" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {studioNavItems.map((item) => {
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-ltd-primary text-ltd-primary-text"
                      : "text-ltd-text-1 hover:bg-ltd-surface-3"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.description && (
                        <span className={cn(
                          "text-[10px]",
                          isActive ? "text-ltd-primary-text/70" : "text-ltd-text-3"
                        )}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - Back to Dashboard */}
        <div className="p-3 border-t border-ltd-border-1 space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-[var(--ltd-radius-md)] text-sm font-medium text-ltd-text-2 hover:bg-ltd-surface-3 hover:text-ltd-text-1 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span>Back to Dashboard</span>}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium border-2 border-dashed border-ltd-border-2 text-ltd-text-2 hover:bg-ltd-surface-3 hover:text-ltd-text-1 hover:border-ltd-primary hover:border-solid transition-all",
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
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-ltd-text-1 tracking-tight">Spoke</span>
                  <span className="font-bold bg-gradient-to-r from-ltd-primary to-[#7B61FF] bg-clip-text text-transparent">Studio</span>
                </div>
                <span className="text-[10px] text-ltd-text-3 tracking-wide">Content & Creative Automation</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <LtdToaster />
    </div>
  );
}
