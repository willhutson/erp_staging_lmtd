"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Globe,
  Lock,
  Users,
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import type { BuilderDashboardWithRelations } from "@/modules/builder/types";
import { createDashboard, deleteDashboard, duplicateDashboard } from "@/modules/builder/actions";
import type { DashboardVisibility } from "@prisma/client";

interface DashboardsClientProps {
  initialDashboards: BuilderDashboardWithRelations[];
  stats: {
    totalDashboards: number;
    publishedDashboards: number;
    clientDashboards: number;
    totalWidgets: number;
  };
}

export function DashboardsClient({ initialDashboards, stats }: DashboardsClientProps) {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState<DashboardVisibility>("PRIVATE");

  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesVisibility = visibilityFilter === "all" || dashboard.visibility === visibilityFilter;
    return matchesSearch && matchesVisibility;
  });

  const handleCreate = async () => {
    if (!newName.trim()) return;

    startTransition(async () => {
      const dashboard = await createDashboard({
        name: newName,
        description: newDescription || undefined,
        visibility: newVisibility,
      });
      setDashboards([dashboard, ...dashboards]);
      setIsCreateDialogOpen(false);
      setNewName("");
      setNewDescription("");
      setNewVisibility("PRIVATE");
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dashboard?")) return;

    startTransition(async () => {
      await deleteDashboard(id);
      setDashboards(dashboards.filter((d) => d.id !== id));
    });
  };

  const handleDuplicate = async (id: string) => {
    startTransition(async () => {
      const dashboard = await duplicateDashboard(id);
      setDashboards([dashboard, ...dashboards]);
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return (
          <Badge variant="outline">
            <Lock className="mr-1 h-3 w-3" />
            Private
          </Badge>
        );
      case "ORGANIZATION":
        return (
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            Team
          </Badge>
        );
      case "CLIENT":
        return (
          <Badge className="bg-blue-500">
            <Eye className="mr-1 h-3 w-3" />
            Client
          </Badge>
        );
      case "PUBLIC":
        return (
          <Badge className="bg-green-500">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        );
      default:
        return <Badge variant="outline">{visibility}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
          <p className="text-muted-foreground">
            Create and manage custom dashboards
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Dashboard</DialogTitle>
              <DialogDescription>
                Create a new dashboard from scratch or start from a template.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q1 Performance Overview"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={newVisibility} onValueChange={(v) => setNewVisibility(v as DashboardVisibility)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private - Only you
                      </div>
                    </SelectItem>
                    <SelectItem value="ORGANIZATION">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team - Organization members
                      </div>
                    </SelectItem>
                    <SelectItem value="CLIENT">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Client - Client portal access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Start From</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={handleCreate}
                    disabled={isPending || !newName.trim()}
                  >
                    {isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                    <span>Blank Dashboard</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                    <Link href="/builder/templates">
                      <LayoutDashboard className="h-6 w-6" />
                      <span>Use Template</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dashboards
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedDashboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client Portals
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientDashboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Widgets
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWidgets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="ORGANIZATION">Team</SelectItem>
            <SelectItem value="CLIENT">Client</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboards..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      {filteredDashboards.length === 0 ? (
        <Card className="p-8 text-center">
          <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first dashboard to get started.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Dashboard
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail placeholder */}
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <LayoutDashboard className="h-12 w-12 text-muted-foreground/30" />
                </div>
                {dashboard.isDefault && (
                  <Badge className="absolute top-2 left-2 bg-primary">Default</Badge>
                )}
                {!dashboard.isPublished && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Draft
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {dashboard.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/builder/dashboards/${dashboard.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(dashboard.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(dashboard.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getVisibilityBadge(dashboard.visibility)}
                    <Badge variant="outline" className="text-xs">
                      {dashboard._count?.widgets ?? 0} widgets
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>By {dashboard.createdBy.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(dashboard.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={`/builder/dashboards/${dashboard.id}/edit`}>
                    Open Editor
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
