"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Users,
  Lock,
  Eye,
  Settings,
  BarChart3,
  Headphones,
  CreditCard,
  Palette,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock roles data
const mockRoles = [
  {
    id: "owner",
    name: "Owner",
    description: "Full access to everything including billing and organization deletion",
    isSystem: true,
    userCount: 1,
    color: "bg-red-500",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full access except billing and deletion. Can manage users and settings",
    isSystem: true,
    userCount: 2,
    color: "bg-orange-500",
  },
  {
    id: "member",
    name: "Member",
    description: "Standard access. Can create and edit content within assigned modules",
    isSystem: true,
    userCount: 40,
    color: "bg-blue-500",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access. Can view dashboards and reports",
    isSystem: true,
    userCount: 5,
    color: "bg-gray-500",
  },
  {
    id: "media-buyer",
    name: "Media Buyer",
    description: "Full access to Media Buying module, read-only access to Analytics",
    isSystem: false,
    userCount: 8,
    color: "bg-green-500",
  },
  {
    id: "creator-manager",
    name: "Creator Manager",
    description: "Full access to Listening module and creator management",
    isSystem: false,
    userCount: 4,
    color: "bg-purple-500",
  },
];

// Permission modules
const permissionModules = [
  {
    id: "admin",
    name: "Admin",
    icon: Settings,
    permissions: [
      { id: "admin.organizations.view", name: "View organizations", description: "Can view organization list and details" },
      { id: "admin.organizations.manage", name: "Manage organizations", description: "Can create, edit, delete organizations" },
      { id: "admin.users.view", name: "View users", description: "Can view user list and profiles" },
      { id: "admin.users.manage", name: "Manage users", description: "Can invite, edit, deactivate users" },
      { id: "admin.roles.view", name: "View roles", description: "Can view role configurations" },
      { id: "admin.roles.manage", name: "Manage roles", description: "Can create and edit roles" },
      { id: "admin.settings.view", name: "View settings", description: "Can view organization settings" },
      { id: "admin.settings.manage", name: "Manage settings", description: "Can modify organization settings" },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    icon: Users,
    permissions: [
      { id: "crm.companies.view", name: "View companies", description: "Can view company list and details" },
      { id: "crm.companies.manage", name: "Manage companies", description: "Can create, edit, delete companies" },
      { id: "crm.contacts.view", name: "View contacts", description: "Can view contact list and details" },
      { id: "crm.contacts.manage", name: "Manage contacts", description: "Can create, edit, delete contacts" },
      { id: "crm.deals.view", name: "View deals", description: "Can view deal pipeline and details" },
      { id: "crm.deals.manage", name: "Manage deals", description: "Can create, edit, close deals" },
      { id: "crm.tasks.view", name: "View tasks", description: "Can view task list" },
      { id: "crm.tasks.manage", name: "Manage tasks", description: "Can create, edit, complete tasks" },
    ],
  },
  {
    id: "listening",
    name: "Listening",
    icon: Headphones,
    permissions: [
      { id: "listening.creators.view", name: "View creators", description: "Can view creator profiles and metrics" },
      { id: "listening.creators.manage", name: "Manage creators", description: "Can add, edit creators and connect platforms" },
      { id: "listening.content.view", name: "View content", description: "Can view creator content and performance" },
      { id: "listening.campaigns.view", name: "View campaigns", description: "Can view influencer campaigns" },
      { id: "listening.campaigns.manage", name: "Manage campaigns", description: "Can create and manage campaigns" },
    ],
  },
  {
    id: "media-buying",
    name: "Media Buying",
    icon: CreditCard,
    permissions: [
      { id: "media.accounts.view", name: "View ad accounts", description: "Can view connected ad accounts" },
      { id: "media.accounts.manage", name: "Manage ad accounts", description: "Can connect and configure ad accounts" },
      { id: "media.campaigns.view", name: "View campaigns", description: "Can view campaign performance" },
      { id: "media.campaigns.manage", name: "Manage campaigns", description: "Can create and manage campaigns" },
      { id: "media.budgets.view", name: "View budgets", description: "Can view budget allocations" },
      { id: "media.budgets.manage", name: "Manage budgets", description: "Can set and modify budgets" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    permissions: [
      { id: "analytics.dashboards.view", name: "View dashboards", description: "Can view analytics dashboards" },
      { id: "analytics.reports.view", name: "View reports", description: "Can view and export reports" },
      { id: "analytics.reports.create", name: "Create reports", description: "Can create custom reports" },
    ],
  },
  {
    id: "builder",
    name: "Builder",
    icon: Palette,
    permissions: [
      { id: "builder.dashboards.view", name: "View dashboards", description: "Can view created dashboards" },
      { id: "builder.dashboards.manage", name: "Manage dashboards", description: "Can create and edit dashboards" },
      { id: "builder.widgets.view", name: "View widgets", description: "Can view widget library" },
      { id: "builder.widgets.manage", name: "Manage widgets", description: "Can create custom widgets" },
      { id: "builder.templates.view", name: "View templates", description: "Can view dashboard templates" },
      { id: "builder.templates.manage", name: "Manage templates", description: "Can create and share templates" },
      { id: "builder.clients.view", name: "View client instances", description: "Can view client portal instances" },
      { id: "builder.clients.manage", name: "Manage client instances", description: "Can create and configure client portals" },
    ],
  },
];

export default function RolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof mockRoles[0] | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(["admin"]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Configure role-based access control for your organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Create a new role with specific permissions. You can customize permissions after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" placeholder="e.g., Social Media Manager" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this role can do..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Base Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Start with a preset and customize further
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Admin", "Member", "Viewer"].map((preset) => (
                    <Button key={preset} variant="outline" className="justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roles</CardTitle>
              <CardDescription>
                Click a role to view and edit permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                    selectedRole?.id === role.id ? "border-primary bg-accent" : ""
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${role.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {role.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{role.userCount} users</span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedRole ? (
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${selectedRole.color}`} />
                        {selectedRole.name} Permissions
                      </span>
                    ) : (
                      "Permissions"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedRole
                      ? selectedRole.description
                      : "Select a role to view and edit its permissions"}
                  </CardDescription>
                </div>
                {selectedRole && !selectedRole.isSystem && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Role
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <div className="space-y-3">
                  {permissionModules.map((module) => {
                    const ModuleIcon = module.icon;
                    const isExpanded = expandedModules.includes(module.id);

                    return (
                      <Collapsible
                        key={module.id}
                        open={isExpanded}
                        onOpenChange={() => toggleModule(module.id)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                              <ModuleIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{module.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {module.permissions.length} permissions
                              </Badge>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 ml-8 space-y-2">
                            {module.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div>
                                  <div className="font-medium text-sm">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </div>
                                </div>
                                <Switch
                                  disabled={selectedRole.isSystem}
                                  defaultChecked={
                                    selectedRole.id === "owner" ||
                                    selectedRole.id === "admin" ||
                                    (selectedRole.id === "member" &&
                                      !permission.id.includes("manage") &&
                                      !permission.id.includes("admin")) ||
                                    (selectedRole.id === "viewer" &&
                                      permission.id.includes("view"))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">Select a Role</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    Click on a role from the list to view and edit its permissions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permission Levels</CardTitle>
          <CardDescription>
            Understanding the difference between system and custom roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">System Roles</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Built-in roles (Owner, Admin, Member, Viewer) that cannot be deleted.
                  Their core permissions are fixed but can be extended with custom permissions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">Custom Roles</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Create custom roles for specific teams or workflows. Start from a
                  preset and add or remove permissions as needed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
