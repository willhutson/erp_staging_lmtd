"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Search, CheckCircle2, AlertCircle, Info, MessageSquare, Megaphone } from "lucide-react";
import Link from "next/link";
import type { TenantConfig } from "@/lib/tenant";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "success",
    title: "Campaign launched",
    message: "CCAD Summer Campaign is now live across all platforms",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "alert",
    title: "Budget threshold reached",
    message: "Meta Ads account has reached 80% of monthly budget",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New creator added",
    message: "Sarah Ahmed was added to the creator roster",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    type: "success",
    title: "Report generated",
    message: "Monthly performance report is ready for download",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Team update",
    message: "3 new team members joined the organization",
    time: "Yesterday",
    read: true,
  },
];

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { label: string; parent?: string }> = {
  // Super Admin
  "/superadmin": { label: "Super Admin" },
  "/superadmin/organizations": { label: "Organizations", parent: "/superadmin" },
  "/superadmin/organizations/new": { label: "New Organization", parent: "/superadmin/organizations" },
  "/superadmin/instances": { label: "Instances", parent: "/superadmin" },
  "/superadmin/instances/new": { label: "Create Instance", parent: "/superadmin/instances" },
  "/superadmin/domains": { label: "Domains", parent: "/superadmin" },
  // Admin
  "/admin": { label: "Dashboard" },
  "/admin/organizations": { label: "Organizations", parent: "/admin" },
  "/admin/users": { label: "Users", parent: "/admin" },
  "/admin/roles": { label: "Roles", parent: "/admin" },
  "/admin/crm/companies": { label: "Companies", parent: "/admin" },
  "/admin/crm/contacts": { label: "Contacts", parent: "/admin" },
  "/admin/crm/deals": { label: "Deals", parent: "/admin" },
  "/admin/crm/tasks": { label: "Tasks", parent: "/admin" },
  "/admin/integrations": { label: "Integrations", parent: "/admin" },
  "/admin/instances": { label: "Client Portals", parent: "/admin" },
  "/admin/instances/new": { label: "Create Portal", parent: "/admin/instances" },
  "/admin/settings": { label: "Settings", parent: "/admin" },
  "/admin/settings/profile": { label: "Profile", parent: "/admin/settings" },
  "/admin/settings/portal": { label: "Portal Branding", parent: "/admin/settings" },
  // Briefs
  "/briefs": { label: "Briefs" },
  "/briefs/my": { label: "My Briefs", parent: "/briefs" },
  "/briefs/pending": { label: "Pending Review", parent: "/briefs" },
  // Time
  "/time": { label: "Time" },
  "/time/timesheet": { label: "Timesheet", parent: "/time" },
  "/time/approvals": { label: "Approvals", parent: "/time" },
  // Leave
  "/leave": { label: "Leave" },
  "/leave/calendar": { label: "Calendar", parent: "/leave" },
  "/leave/approvals": { label: "Approvals", parent: "/leave" },
  // Team
  "/team": { label: "Team" },
  "/team/departments": { label: "Departments", parent: "/team" },
  "/team/org-chart": { label: "Org Chart", parent: "/team" },
  // RFP
  "/rfp": { label: "RFP" },
  "/rfp/active": { label: "Active", parent: "/rfp" },
  "/rfp/closed": { label: "Closed", parent: "/rfp" },
  // Listening
  "/listening": { label: "Listening" },
  "/listening/creators": { label: "Creators", parent: "/listening" },
  "/listening/creators/new": { label: "Add Creator", parent: "/listening/creators" },
  "/listening/content": { label: "Content", parent: "/listening" },
  "/listening/campaigns": { label: "Campaigns", parent: "/listening" },
  // Media Buying
  "/mediabuying": { label: "Media Buying" },
  "/mediabuying/accounts": { label: "Accounts", parent: "/mediabuying" },
  "/mediabuying/campaigns": { label: "Campaigns", parent: "/mediabuying" },
  "/mediabuying/budgets": { label: "Budgets", parent: "/mediabuying" },
  // Analytics
  "/analytics": { label: "Analytics" },
  "/analytics/campaigns": { label: "Campaigns", parent: "/analytics" },
  "/analytics/creators": { label: "Creators", parent: "/analytics" },
  "/analytics/platforms": { label: "Platforms", parent: "/analytics" },
  // Builder
  "/builder": { label: "Builder" },
  "/builder/dashboards": { label: "Dashboards", parent: "/builder" },
  "/builder/dashboards/new": { label: "New Dashboard", parent: "/builder/dashboards" },
  "/builder/widgets": { label: "Widgets", parent: "/builder" },
  "/builder/templates": { label: "Templates", parent: "/builder" },
  // Chat
  "/chat": { label: "SpokeChat" },
  // Portal
  "/portal": { label: "Client Portal" },
  "/portal/approvals": { label: "Approvals", parent: "/portal" },
  "/portal/deliverables": { label: "Deliverables", parent: "/portal" },
  "/portal/reports": { label: "Reports", parent: "/portal" },
  // Hub
  "/hub": { label: "Hub" },
  // Trackers
  "/listening/trackers": { label: "Trackers", parent: "/listening" },
  "/listening/trackers/new": { label: "New Tracker", parent: "/listening/trackers" },
  // Agency
  "/clients": { label: "Clients" },
  "/retainers": { label: "Retainers" },
  "/projects": { label: "Projects" },
  "/resources": { label: "Resources" },
  "/crm": { label: "CRM" },
};

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [];
  let current = breadcrumbConfig[pathname];

  if (current) {
    crumbs.unshift({ label: current.label, href: pathname });

    while (current?.parent) {
      const parent = breadcrumbConfig[current.parent];
      if (parent) {
        crumbs.unshift({ label: parent.label, href: current.parent });
      }
      current = parent;
    }
  }

  return crumbs;
}

interface HeaderProps {
  tenant?: TenantConfig;
}

export function Header({ tenant }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Use tenant primary color for accent
  const primaryColor = tenant?.primaryColor || "#52EDC7";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8 bg-muted/50"
          />
        </div>

        {/* SpokeChat Quick Access */}
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/chat" className="flex items-center gap-0.5">
            <MessageSquare className="h-4 w-4" />
            <span className="relative flex items-center justify-center h-5 w-5 rounded-full ring-1 ring-muted-foreground/30">
              <Megaphone className="h-3 w-3" />
            </span>
            {/* Mock unread indicator */}
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-medium text-[#0A1628] flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              3
            </span>
          </Link>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-medium text-[#0A1628] flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-muted/30" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="border-t px-4 py-2">
              <Button variant="ghost" className="w-full text-sm h-8" size="sm">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
