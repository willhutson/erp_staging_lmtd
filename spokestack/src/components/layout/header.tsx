"use client";

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
import { Bell, Search } from "lucide-react";

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
  "/Builder/widgets": { label: "Widgets", parent: "/Builder" },
  "/Builder/templates": { label: "Templates", parent: "/Builder" },
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

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.href}>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
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

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
