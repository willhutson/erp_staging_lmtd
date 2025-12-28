"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Key,
  ArrowLeft,
  Webhook,
  Shield,
  Activity,
  Users,
  Building2,
  FileText,
  Clock,
  Calendar,
  FolderKanban,
  Briefcase,
  TrendingUp,
  UserCheck,
  ChevronDown,
} from "lucide-react";

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth?: string;
};

type ApiCategory = {
  title: string;
  description: string;
  icon: typeof Users;
  endpoints: Endpoint[];
};

const API_CATEGORIES: ApiCategory[] = [
  {
    title: "Authentication",
    description: "User authentication and session management",
    icon: Shield,
    endpoints: [
      { method: "POST", path: "/api/v1/auth/login", description: "Authenticate user with email/password" },
      { method: "POST", path: "/api/v1/auth/logout", description: "End user session" },
      { method: "GET", path: "/api/v1/auth/me", description: "Get current user profile and permissions" },
      { method: "PATCH", path: "/api/v1/auth/me", description: "Update current user profile" },
    ],
  },
  {
    title: "Users",
    description: "User management and team directory",
    icon: Users,
    endpoints: [
      { method: "GET", path: "/api/v1/users", description: "List all users with filtering and pagination", auth: "TEAM_LEAD+" },
      { method: "POST", path: "/api/v1/users", description: "Create a new user", auth: "ADMIN" },
      { method: "GET", path: "/api/v1/users/:id", description: "Get user by ID", auth: "TEAM_LEAD+" },
      { method: "PATCH", path: "/api/v1/users/:id", description: "Update user", auth: "ADMIN" },
      { method: "DELETE", path: "/api/v1/users/:id", description: "Deactivate user", auth: "ADMIN" },
    ],
  },
  {
    title: "Organizations",
    description: "Multi-tenant organization management",
    icon: Building2,
    endpoints: [
      { method: "GET", path: "/api/v1/organizations", description: "List all organizations", auth: "SUPERADMIN" },
      { method: "POST", path: "/api/v1/organizations", description: "Create new organization", auth: "SUPERADMIN" },
      { method: "GET", path: "/api/v1/organizations/:id", description: "Get organization details", auth: "ADMIN" },
      { method: "PATCH", path: "/api/v1/organizations/:id", description: "Update organization", auth: "ADMIN" },
    ],
  },
  {
    title: "Clients",
    description: "Client/account management",
    icon: Briefcase,
    endpoints: [
      { method: "GET", path: "/api/v1/clients", description: "List clients with filtering" },
      { method: "POST", path: "/api/v1/clients", description: "Create a new client", auth: "LEADERSHIP+" },
      { method: "GET", path: "/api/v1/clients/:id", description: "Get client details" },
      { method: "PATCH", path: "/api/v1/clients/:id", description: "Update client", auth: "LEADERSHIP+" },
      { method: "DELETE", path: "/api/v1/clients/:id", description: "Archive client", auth: "ADMIN" },
      { method: "GET", path: "/api/v1/clients/:id/contacts", description: "List client contacts" },
      { method: "POST", path: "/api/v1/clients/:id/contacts", description: "Add client contact" },
    ],
  },
  {
    title: "Briefs",
    description: "Creative briefs and work items",
    icon: FileText,
    endpoints: [
      { method: "GET", path: "/api/v1/briefs", description: "List briefs with filtering and pagination" },
      { method: "POST", path: "/api/v1/briefs", description: "Create a new brief" },
      { method: "GET", path: "/api/v1/briefs/:id", description: "Get brief details" },
      { method: "PATCH", path: "/api/v1/briefs/:id", description: "Update brief" },
      { method: "DELETE", path: "/api/v1/briefs/:id", description: "Delete brief (draft only)" },
      { method: "GET", path: "/api/v1/briefs/:id/time", description: "Get time entries for brief" },
      { method: "POST", path: "/api/v1/briefs/:id/time", description: "Log time to brief" },
    ],
  },
  {
    title: "Projects",
    description: "Project and retainer management",
    icon: FolderKanban,
    endpoints: [
      { method: "GET", path: "/api/v1/projects", description: "List projects with filtering" },
      { method: "POST", path: "/api/v1/projects", description: "Create a new project", auth: "LEADERSHIP+" },
      { method: "GET", path: "/api/v1/projects/:id", description: "Get project with budget utilization" },
      { method: "PATCH", path: "/api/v1/projects/:id", description: "Update project", auth: "LEADERSHIP+" },
      { method: "DELETE", path: "/api/v1/projects/:id", description: "Delete project", auth: "ADMIN" },
      { method: "GET", path: "/api/v1/projects/:id/briefs", description: "Get briefs for project" },
      { method: "GET", path: "/api/v1/projects/:id/time", description: "Get time entries for project" },
    ],
  },
  {
    title: "Time Tracking",
    description: "Time entries and timesheets",
    icon: Clock,
    endpoints: [
      { method: "GET", path: "/api/v1/time", description: "List time entries with filtering" },
      { method: "POST", path: "/api/v1/time", description: "Create time entry" },
      { method: "GET", path: "/api/v1/time/:id", description: "Get time entry details" },
      { method: "PATCH", path: "/api/v1/time/:id", description: "Update time entry" },
      { method: "DELETE", path: "/api/v1/time/:id", description: "Delete time entry" },
      { method: "GET", path: "/api/v1/time/reports", description: "Get time reports by user/client/project" },
    ],
  },
  {
    title: "Leave Management",
    description: "Leave requests and approvals",
    icon: Calendar,
    endpoints: [
      { method: "GET", path: "/api/v1/leave", description: "List leave requests" },
      { method: "POST", path: "/api/v1/leave", description: "Submit leave request" },
      { method: "GET", path: "/api/v1/leave/:id", description: "Get leave request details" },
      { method: "PATCH", path: "/api/v1/leave/:id", description: "Update leave request" },
      { method: "DELETE", path: "/api/v1/leave/:id", description: "Cancel leave request" },
      { method: "POST", path: "/api/v1/leave/:id/approve", description: "Approve leave request", auth: "TEAM_LEAD+" },
      { method: "POST", path: "/api/v1/leave/:id/reject", description: "Reject leave request", auth: "TEAM_LEAD+" },
      { method: "GET", path: "/api/v1/leave/balances", description: "Get leave balances" },
    ],
  },
  {
    title: "Team Directory",
    description: "Team structure and departments",
    icon: UserCheck,
    endpoints: [
      { method: "GET", path: "/api/v1/team", description: "Get team directory with org chart" },
      { method: "GET", path: "/api/v1/team/departments", description: "List departments with members" },
    ],
  },
  {
    title: "RFP Management",
    description: "Request for Proposal tracking",
    icon: Briefcase,
    endpoints: [
      { method: "GET", path: "/api/v1/rfp", description: "List RFPs with pipeline stats", auth: "LEADERSHIP+" },
      { method: "POST", path: "/api/v1/rfp", description: "Create a new RFP", auth: "LEADERSHIP+" },
      { method: "GET", path: "/api/v1/rfp/:id", description: "Get RFP with sub-items", auth: "LEADERSHIP+" },
      { method: "PATCH", path: "/api/v1/rfp/:id", description: "Update RFP", auth: "LEADERSHIP+" },
      { method: "DELETE", path: "/api/v1/rfp/:id", description: "Delete RFP (vetting only)", auth: "LEADERSHIP+" },
      { method: "GET", path: "/api/v1/rfp/:id/subitems", description: "List RFP sub-items" },
      { method: "POST", path: "/api/v1/rfp/:id/subitems", description: "Create sub-item" },
      { method: "PATCH", path: "/api/v1/rfp/:id/subitems/:subitemId", description: "Update sub-item" },
      { method: "DELETE", path: "/api/v1/rfp/:id/subitems/:subitemId", description: "Delete sub-item" },
    ],
  },
  {
    title: "Deals / Pipeline",
    description: "Sales pipeline and deal tracking",
    icon: TrendingUp,
    endpoints: [
      { method: "GET", path: "/api/v1/deals", description: "List deals with pipeline summary", auth: "LEADERSHIP+" },
      { method: "POST", path: "/api/v1/deals", description: "Create a new deal", auth: "LEADERSHIP+" },
      { method: "GET", path: "/api/v1/deals/:id", description: "Get deal details", auth: "LEADERSHIP+" },
      { method: "PATCH", path: "/api/v1/deals/:id", description: "Update deal", auth: "LEADERSHIP+" },
      { method: "DELETE", path: "/api/v1/deals/:id", description: "Delete deal (lead only)", auth: "LEADERSHIP+" },
      { method: "POST", path: "/api/v1/deals/:id/convert", description: "Convert won deal to client", auth: "LEADERSHIP+" },
    ],
  },
  {
    title: "Resources",
    description: "Team capacity and resource planning",
    icon: Activity,
    endpoints: [
      { method: "GET", path: "/api/v1/resources", description: "Get team capacity overview", auth: "TEAM_LEAD+" },
      { method: "GET", path: "/api/v1/resources/:userId", description: "Get detailed member workload", auth: "TEAM_LEAD+" },
      { method: "GET", path: "/api/v1/resources/departments", description: "Get department capacity", auth: "TEAM_LEAD+" },
    ],
  },
];

const WEBHOOK_EVENTS = [
  "brief.created",
  "brief.updated",
  "brief.status_changed",
  "brief.completed",
  "project.created",
  "project.updated",
  "rfp.created",
  "rfp.status_changed",
  "rfp.won",
  "rfp.lost",
  "deal.created",
  "deal.stage_changed",
  "deal.won",
  "deal.lost",
  "deal.converted",
  "time_entry.created",
  "time_entry.approved",
  "leave.requested",
  "leave.approved",
  "leave.rejected",
  "user.created",
  "user.updated",
  "client.created",
  "client.updated",
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500",
    POST: "bg-green-500",
    PATCH: "bg-amber-500",
    DELETE: "bg-red-500",
  };
  return (
    <Badge className={`${colors[method] || "bg-gray-500"} font-mono text-xs w-16 justify-center`}>
      {method}
    </Badge>
  );
}

function ApiCategorySection({ category }: { category: ApiCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = category.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <span className="font-medium">{category.title}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({category.endpoints.length} endpoints)
              </span>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
            <div className="space-y-2">
              {category.endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <MethodBadge method={endpoint.method} />
                  <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {endpoint.description}
                  </span>
                  {endpoint.auth && (
                    <Badge variant="outline" className="text-xs">
                      {endpoint.auth}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function ApiSettingsPage() {
  const totalEndpoints = API_CATEGORIES.reduce((sum, cat) => sum + cat.endpoints.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            API Reference
          </h1>
          <p className="text-muted-foreground">
            REST API documentation for SpokeStack integrations
          </p>
        </div>
        <Badge className="ml-auto bg-primary">{totalEndpoints} Endpoints</Badge>
      </div>

      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle>API Overview</CardTitle>
          <CardDescription>
            Base URL: <code className="bg-muted px-2 py-1 rounded">https://spokestack.vercel.app/api/v1</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-1">Authentication</h4>
              <p className="text-sm text-muted-foreground">Session-based auth via login endpoint</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-1">Response Format</h4>
              <p className="text-sm text-muted-foreground">JSON with success/data/error structure</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-1">Multi-tenant</h4>
              <p className="text-sm text-muted-foreground">All data scoped to organization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Endpoints</h2>
        <div className="space-y-2">
          {API_CATEGORIES.map((category) => (
            <ApiCategorySection key={category.title} category={category} />
          ))}
        </div>
      </div>

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Events
          </CardTitle>
          <CardDescription>
            Events available for webhook subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <Badge key={event} variant="outline" className="font-mono text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
