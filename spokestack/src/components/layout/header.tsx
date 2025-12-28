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
import { Bell, Search, CheckCircle2, AlertCircle, Info, Users, Megaphone } from "lucide-react";

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
  "/Admin": { label: "Dashboard" },
  "/Admin/organizations": { label: "Organizations", parent: "/Admin" },
  "/Admin/users": { label: "Users", parent: "/Admin" },
  "/Admin/roles": { label: "Roles", parent: "/Admin" },
  "/Admin/crm/companies": { label: "Companies", parent: "/Admin" },
  "/Admin/crm/contacts": { label: "Contacts", parent: "/Admin" },
  "/Admin/crm/deals": { label: "Deals", parent: "/Admin" },
  "/Admin/crm/tasks": { label: "Tasks", parent: "/Admin" },
  "/Listening": { label: "Listening" },
  "/Listening/creators": { label: "Creators", parent: "/Listening" },
  "/Listening/creators/new": { label: "Add Creator", parent: "/Listening/creators" },
  "/Listening/content": { label: "Content", parent: "/Listening" },
  "/Listening/campaigns": { label: "Campaigns", parent: "/Listening" },
  "/MediaBuying": { label: "Media Buying" },
  "/MediaBuying/accounts": { label: "Accounts", parent: "/MediaBuying" },
  "/MediaBuying/campaigns": { label: "Campaigns", parent: "/MediaBuying" },
  "/MediaBuying/budgets": { label: "Budgets", parent: "/MediaBuying" },
  "/Analytics": { label: "Analytics" },
  "/Analytics/campaigns": { label: "Campaigns", parent: "/Analytics" },
  "/Analytics/creators": { label: "Creators", parent: "/Analytics" },
  "/Analytics/platforms": { label: "Platforms", parent: "/Analytics" },
  "/Builder": { label: "Builder" },
  "/Builder/dashboards": { label: "Dashboards", parent: "/Builder" },
  "/Builder/dashboards/new": { label: "New Dashboard", parent: "/Builder/dashboards" },
  "/Builder/widgets": { label: "Widgets", parent: "/Builder" },
  "/Builder/templates": { label: "Templates", parent: "/Builder" },
  "/Admin/integrations": { label: "Integrations", parent: "/Admin" },
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

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [notifications, setNotifications] = useState(mockNotifications);

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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#52EDC7] text-[10px] font-medium text-[#0A1628] flex items-center justify-center">
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
                              <span className="h-2 w-2 rounded-full bg-[#52EDC7] flex-shrink-0" />
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
