"use client";

import { useState } from "react";
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
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock dashboards data
const mockDashboards = [
  {
    id: "1",
    name: "Executive Overview",
    description: "High-level KPIs and performance metrics for leadership",
    slug: "executive-overview",
    widgetCount: 12,
    visibility: "ORGANIZATION",
    isPublished: true,
    isDefault: true,
    createdBy: "Will Hutson",
    createdAt: "2024-11-15",
    updatedAt: "2024-12-27",
    thumbnail: null,
  },
  {
    id: "2",
    name: "Campaign Performance",
    description: "Detailed campaign metrics and ROI tracking",
    slug: "campaign-performance",
    widgetCount: 18,
    visibility: "ORGANIZATION",
    isPublished: true,
    isDefault: false,
    createdBy: "Afaq Ahmed",
    createdAt: "2024-11-20",
    updatedAt: "2024-12-26",
    thumbnail: null,
  },
  {
    id: "3",
    name: "Creator Analytics",
    description: "Influencer performance and content tracking",
    slug: "creator-analytics",
    widgetCount: 10,
    visibility: "ORGANIZATION",
    isPublished: true,
    isDefault: false,
    createdBy: "Albert Fernandez",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-25",
    thumbnail: null,
  },
  {
    id: "4",
    name: "CCAD Client Portal",
    description: "Custom dashboard for CCAD client reporting",
    slug: "ccad-portal",
    widgetCount: 8,
    visibility: "CLIENT",
    isPublished: true,
    isDefault: false,
    createdBy: "Will Hutson",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-24",
    thumbnail: null,
  },
  {
    id: "5",
    name: "Budget Tracker (Draft)",
    description: "Monthly budget allocation and spend tracking",
    slug: "budget-tracker",
    widgetCount: 6,
    visibility: "PRIVATE",
    isPublished: false,
    isDefault: false,
    createdBy: "Afaq Ahmed",
    createdAt: "2024-12-20",
    updatedAt: "2024-12-23",
    thumbnail: null,
  },
];

export default function DashboardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredDashboards = mockDashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === "all" || dashboard.visibility === visibilityFilter;
    return matchesSearch && matchesVisibility;
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return <Lock className="h-4 w-4" />;
      case "ORGANIZATION":
        return <Users className="h-4 w-4" />;
      case "CLIENT":
        return <Eye className="h-4 w-4" />;
      case "PUBLIC":
        return <Globe className="h-4 w-4" />;
      default:
        return null;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                <Input id="name" placeholder="e.g., Q1 Performance Overview" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select defaultValue="PRIVATE">
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
                  <Button variant="outline" className="h-24 flex-col gap-2">
                    <Plus className="h-6 w-6" />
                    <span>Blank Dashboard</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                    <Link href="/Builder/templates">
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
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Dashboard
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
            <div className="text-2xl font-bold">{mockDashboards.length}</div>
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
            <div className="text-2xl font-bold">
              {mockDashboards.filter((d) => d.isPublished).length}
            </div>
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
            <div className="text-2xl font-bold">
              {mockDashboards.filter((d) => d.visibility === "CLIENT").length}
            </div>
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
            <div className="text-2xl font-bold">
              {mockDashboards.reduce((sum, d) => sum + d.widgetCount, 0)}
            </div>
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
                    {dashboard.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
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
                    {dashboard.widgetCount} widgets
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>By {dashboard.createdBy}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(dashboard.updatedAt)}
                </span>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href={`/Builder/dashboards/${dashboard.id}/edit`}>
                  Open Editor
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
