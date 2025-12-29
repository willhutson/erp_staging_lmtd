"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Code,
  BookOpen,
  Zap,
  Lock,
  Globe,
} from "lucide-react";

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth?: string;
  requestBody?: string;
  responseExample?: string;
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
      {
        method: "POST",
        path: "/api/v1/auth/login",
        description: "Authenticate user with email/password",
        requestBody: '{ "email": "user@example.com", "password": "..." }',
        responseExample: '{ "success": true, "data": { "user": {...}, "session": {...} } }'
      },
      { method: "POST", path: "/api/v1/auth/logout", description: "End user session" },
      {
        method: "GET",
        path: "/api/v1/auth/me",
        description: "Get current user profile and permissions",
        responseExample: '{ "success": true, "data": { "id": "...", "name": "...", "email": "...", "permissionLevel": "STAFF" } }'
      },
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
      {
        method: "GET",
        path: "/api/v1/briefs",
        description: "List briefs with filtering and pagination",
        responseExample: '{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150 } }'
      },
      {
        method: "POST",
        path: "/api/v1/briefs",
        description: "Create a new brief",
        requestBody: '{ "title": "...", "type": "VIDEO_SHOOT", "clientId": "...", "deadline": "2025-01-15" }'
      },
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
      {
        method: "POST",
        path: "/api/v1/time",
        description: "Create time entry",
        requestBody: '{ "date": "2025-01-15", "hours": 2.5, "briefId": "...", "description": "...", "isBillable": true }'
      },
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
      {
        method: "POST",
        path: "/api/v1/leave",
        description: "Submit leave request",
        requestBody: '{ "type": "ANNUAL", "startDate": "2025-01-20", "endDate": "2025-01-24", "reason": "Vacation" }'
      },
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
  { event: "brief.created", description: "New brief created" },
  { event: "brief.updated", description: "Brief details updated" },
  { event: "brief.status_changed", description: "Brief status changed" },
  { event: "brief.completed", description: "Brief marked as completed" },
  { event: "project.created", description: "New project created" },
  { event: "project.updated", description: "Project details updated" },
  { event: "rfp.created", description: "New RFP created" },
  { event: "rfp.status_changed", description: "RFP status changed" },
  { event: "rfp.won", description: "RFP marked as won" },
  { event: "rfp.lost", description: "RFP marked as lost" },
  { event: "deal.created", description: "New deal created" },
  { event: "deal.stage_changed", description: "Deal stage updated" },
  { event: "deal.won", description: "Deal marked as won" },
  { event: "deal.lost", description: "Deal marked as lost" },
  { event: "deal.converted", description: "Deal converted to client" },
  { event: "time_entry.created", description: "Time entry logged" },
  { event: "time_entry.approved", description: "Time entry approved" },
  { event: "leave.requested", description: "Leave request submitted" },
  { event: "leave.approved", description: "Leave request approved" },
  { event: "leave.rejected", description: "Leave request rejected" },
  { event: "user.created", description: "New user created" },
  { event: "user.updated", description: "User profile updated" },
  { event: "client.created", description: "New client created" },
  { event: "client.updated", description: "Client updated" },
];

const ERROR_CODES = [
  { code: 400, name: "Bad Request", description: "Invalid request body or parameters" },
  { code: 401, name: "Unauthorized", description: "Missing or invalid session" },
  { code: 403, name: "Forbidden", description: "Insufficient permission level" },
  { code: 404, name: "Not Found", description: "Resource does not exist" },
  { code: 409, name: "Conflict", description: "Resource already exists or state conflict" },
  { code: 422, name: "Unprocessable", description: "Validation failed" },
  { code: 429, name: "Rate Limited", description: "Too many requests" },
  { code: 500, name: "Server Error", description: "Internal server error" },
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
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
            <div className="space-y-3">
              {category.endpoints.map((endpoint, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <MethodBadge method={endpoint.method} />
                    <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                    {endpoint.auth && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        {endpoint.auth}
                      </Badge>
                    )}
                    <CopyButton text={endpoint.path} />
                  </div>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  {endpoint.requestBody && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Request Body:</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {endpoint.requestBody}
                      </pre>
                    </div>
                  )}
                  {endpoint.responseExample && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Response:</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {endpoint.responseExample}
                      </pre>
                    </div>
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
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

      {/* Documentation Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-4 w-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="h-4 w-4" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Get started with the SpokeStack API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <code className="font-mono text-sm flex-1">https://spokestack.vercel.app/api/v1</code>
                  <CopyButton text="https://spokestack.vercel.app/api/v1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Session-based authentication via cookies. Login with email/password to obtain a session.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4 text-green-500" />
                    Response Format
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All responses are JSON with a consistent structure: success, data, error, pagination.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    Multi-Tenant
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All data is automatically scoped to your organization. No cross-org data access.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Response Structure</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`// Success Response
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": { "field": "title" }
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-3">Common Query Parameters</h4>
                <div className="grid gap-2">
                  {[
                    { param: "page", type: "number", desc: "Page number for pagination (default: 1)" },
                    { param: "limit", type: "number", desc: "Items per page (default: 20, max: 100)" },
                    { param: "sort", type: "string", desc: "Sort field (e.g., 'createdAt', '-updatedAt')" },
                    { param: "search", type: "string", desc: "Full-text search query" },
                    { param: "status", type: "string", desc: "Filter by status enum value" },
                  ].map((item) => (
                    <div key={item.param} className="flex items-center gap-4 p-2 border rounded">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{item.param}</code>
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Categories</CardTitle>
              <CardDescription>
                {totalEndpoints} endpoints across {API_CATEGORIES.length} categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {API_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.title} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{cat.title}</p>
                        <p className="text-xs text-muted-foreground">{cat.endpoints.length} endpoints</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Endpoints</h2>
            <Badge variant="outline">{totalEndpoints} total</Badge>
          </div>
          <div className="space-y-2">
            {API_CATEGORIES.map((category) => (
              <ApiCategorySection key={category.title} category={category} />
            ))}
          </div>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                How to authenticate with the SpokeStack API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Session-Based Authentication</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  SpokeStack uses session-based authentication via secure HTTP-only cookies.
                  After a successful login, the session cookie is automatically included in subsequent requests.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">1. Login to get a session</p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">2. Use the session cookie for subsequent requests</p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`GET /api/v1/briefs
Cookie: session=<session-token>

// Response
{
  "success": true,
  "data": [...]
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Permission Levels</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Some endpoints require specific permission levels. The required level is shown in the endpoint documentation.
                </p>
                <div className="grid gap-2">
                  {[
                    { level: "ADMIN", desc: "Full access to all endpoints and settings", color: "bg-red-500" },
                    { level: "LEADERSHIP", desc: "Access to RFPs, deals, and organization reports", color: "bg-purple-500" },
                    { level: "TEAM_LEAD", desc: "Team management, approvals, and resource data", color: "bg-blue-500" },
                    { level: "STAFF", desc: "Standard access to briefs, time, leave", color: "bg-green-500" },
                    { level: "FREELANCER", desc: "Limited to assigned work only", color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.level} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Badge className={`${item.color} font-mono`}>{item.level}</Badge>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-500" />
                  <strong>Note:</strong> Endpoints marked with "TEAM_LEAD+" require TEAM_LEAD, LEADERSHIP, or ADMIN level.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Handling
              </CardTitle>
              <CardDescription>
                Understanding API error responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Error Response Format</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-3">HTTP Status Codes</h4>
                <div className="space-y-2">
                  {ERROR_CODES.map((error) => (
                    <div key={error.code} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Badge
                        className={`font-mono w-14 justify-center ${
                          error.code < 400 ? "bg-green-500" :
                          error.code < 500 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      >
                        {error.code}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{error.name}</p>
                        <p className="text-sm text-muted-foreground">{error.description}</p>
                      </div>
                      {error.code === 401 && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {error.code === 403 && <Shield className="h-4 w-4 text-muted-foreground" />}
                      {error.code === 429 && <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Common Error Codes</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { code: "VALIDATION_ERROR", desc: "Request body failed validation" },
                    { code: "NOT_FOUND", desc: "Resource does not exist" },
                    { code: "UNAUTHORIZED", desc: "No valid session" },
                    { code: "FORBIDDEN", desc: "Insufficient permissions" },
                    { code: "DUPLICATE", desc: "Resource already exists" },
                    { code: "INVALID_STATE", desc: "Action not allowed in current state" },
                  ].map((item) => (
                    <div key={item.code} className="p-3 border rounded-lg">
                      <code className="text-sm font-mono text-primary">{item.code}</code>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Subscribe to real-time events from SpokeStack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Webhook Payload Format</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`{
  "event": "brief.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "organizationId": "org_...",
  "data": {
    "id": "brief_...",
    "title": "Video Shoot for Client X",
    "type": "VIDEO_SHOOT",
    "status": "DRAFT",
    ...
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-3">Available Events</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {WEBHOOK_EVENTS.map((item) => (
                    <div key={item.event} className="flex items-center gap-3 p-2 border rounded-lg">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.event}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Webhook Security</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Webhooks are signed with HMAC-SHA256 using your webhook secret</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Verify the X-Webhook-Signature header matches the computed signature</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Failed deliveries are retried up to 3 times with exponential backoff</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/50 p-4 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span>Webhook configuration coming soon. Contact support to set up webhooks for your organization.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Back Button */}
      <div className="pt-4 flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs">
            <BookOpen className="mr-2 h-4 w-4" />
            View Full Documentation
          </Link>
        </Button>
      </div>
    </div>
  );
}
