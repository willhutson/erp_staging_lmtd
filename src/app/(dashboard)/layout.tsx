"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { ThemeToggle } from "@/components/ltd/primitives/theme-toggle"
import { Logo } from "@/components/ltd/brand/logo"
import { setDensity, setSurface, setDir } from "@/lib/design/modes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  FileStack,
  BarChart,
  Settings,
  Palette,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Briefs", href: "/briefs", icon: FileText },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Time", href: "/time", icon: Clock },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
  { label: "RFP", href: "/rfp", icon: FileStack },
  { label: "Reports", href: "/reports", icon: BarChart },
  { label: "Components", href: "/components", icon: Palette },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-ltd-surface-1">
        <aside className="hidden lg:flex lg:w-64 border-e border-ltd-border-1 bg-ltd-surface-2 flex-col" />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-ltd-border-1 bg-ltd-surface-overlay px-4 lg:px-6 py-4 h-[65px]" />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    )
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
          collapsed ? "w-16" : "w-64",
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
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--ltd-radius-md)] text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ltd-primary text-ltd-primary-text"
                    : "text-ltd-text-1 hover:bg-ltd-surface-3",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block p-3 border-t border-ltd-border-2">
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

      {/* Floating expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed left-14 top-1/2 -translate-y-1/2 z-50 h-8 w-8 items-center justify-center rounded-full bg-ltd-primary text-ltd-primary-text shadow-lg hover:scale-110 transition-transform"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Main Content */}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <LtdButton variant="outline" size="sm">
                    Settings
                  </LtdButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setDensity("compact")}>Density: Compact</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDensity("standard")}>Density: Standard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDensity("comfortable")}>Density: Comfortable</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSurface("internal")}>Surface: Internal</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSurface("client")}>Surface: Client</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDir("ltr")}>Direction: LTR</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDir("rtl")}>Direction: RTL</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
