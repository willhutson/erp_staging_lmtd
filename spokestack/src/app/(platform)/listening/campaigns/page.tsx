"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Eye,
  Heart,
  DollarSign,
  Calendar,
  TrendingUp,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Mock campaigns data
const mockCampaigns = [
  {
    id: "1",
    name: "Dubai Summer Campaign",
    description: "Influencer marketing campaign for summer tourism",
    status: "ACTIVE",
    startDate: "2024-12-01",
    endDate: "2025-02-28",
    budget: 50000,
    spent: 28500,
    creators: [
      { name: "Sarah Al Maktoum", handle: "@sarah_mak" },
      { name: "Omar Rashid", handle: "@omarrashid" },
    ],
    impressions: 2500000,
    engagements: 185000,
    clicks: 12500,
    conversions: 450,
    roi: 3.2,
  },
  {
    id: "2",
    name: "Tech Gadgets Review Series",
    description: "Product review campaign with tech influencers",
    status: "ACTIVE",
    startDate: "2024-11-15",
    endDate: "2025-01-31",
    budget: 35000,
    spent: 22000,
    creators: [
      { name: "Ahmed Hassan", handle: "@ahmedhassan" },
    ],
    impressions: 1800000,
    engagements: 95000,
    clicks: 8200,
    conversions: 280,
    roi: 2.8,
  },
  {
    id: "3",
    name: "Local Beauty Campaign",
    description: "Promoting UAE-based beauty brands",
    status: "ACTIVE",
    startDate: "2024-12-10",
    endDate: "2025-01-15",
    budget: 15000,
    spent: 8500,
    creators: [
      { name: "Layla Mohammed", handle: "@laylamohd" },
    ],
    impressions: 450000,
    engagements: 42000,
    clicks: 3800,
    conversions: 120,
    roi: 2.4,
  },
  {
    id: "4",
    name: "Wellness Week",
    description: "Fitness and wellness awareness campaign",
    status: "COMPLETED",
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    budget: 20000,
    spent: 19500,
    creators: [
      { name: "Omar Rashid", handle: "@omarrashid" },
    ],
    impressions: 980000,
    engagements: 68000,
    clicks: 5200,
    conversions: 180,
    roi: 2.1,
  },
  {
    id: "5",
    name: "Food Discovery Abu Dhabi",
    description: "Hidden gems food tour campaign",
    status: "DRAFT",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    budget: 25000,
    spent: 0,
    creators: [
      { name: "Fatima Al Zaabi", handle: "@fatima.zaabi" },
    ],
    impressions: 0,
    engagements: 0,
    clicks: 0,
    conversions: 0,
    roi: 0,
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <Play className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="bg-yellow-500">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const activeCampaigns = mockCampaigns.filter((c) => c.status === "ACTIVE");
  const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = mockCampaigns.reduce((sum, c) => sum + c.impressions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage influencer marketing campaigns
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Create a new influencer marketing campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" placeholder="e.g., Summer Tourism Campaign" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Campaign description..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" type="number" placeholder="50000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="objective">Objective</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AWARENESS">Brand Awareness</SelectItem>
                      <SelectItem value="REACH">Reach</SelectItem>
                      <SelectItem value="ENGAGEMENT">Engagement</SelectItem>
                      <SelectItem value="TRAFFIC">Traffic</SelectItem>
                      <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Assign Creators</Label>
                <p className="text-sm text-muted-foreground">
                  You can assign creators after creating the campaign.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockCampaigns.length} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} spent ({((totalSpent / totalBudget) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalImpressions)}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg ROI
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockCampaigns.filter(c => c.roi > 0).reduce((sum, c) => sum + c.roi, 0) / mockCampaigns.filter(c => c.roi > 0).length).toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>
                View and manage your influencer campaigns
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search campaigns..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creators</TableHead>
                <TableHead>Budget / Spent</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.description}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {campaign.creators.slice(0, 3).map((creator, idx) => (
                        <Avatar
                          key={idx}
                          className="h-8 w-8 border-2 border-background"
                          title={`${creator.name} (${creator.handle})`}
                        >
                          <AvatarFallback className="text-xs">
                            {getInitials(creator.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {campaign.creators.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{campaign.creators.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(campaign.budget)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(campaign.spent)} spent
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {formatNumber(campaign.impressions)} impressions
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        {formatNumber(campaign.engagements)} engagements
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.roi > 0 ? (
                      <Badge
                        variant="outline"
                        className={
                          campaign.roi >= 3
                            ? "border-green-500 text-green-500"
                            : campaign.roi >= 2
                            ? "border-blue-500 text-blue-500"
                            : ""
                        }
                      >
                        {campaign.roi.toFixed(1)}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Creators
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "ACTIVE" ? (
                          <DropdownMenuItem className="text-yellow-600">
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Campaign
                          </DropdownMenuItem>
                        ) : campaign.status === "PAUSED" ? (
                          <DropdownMenuItem className="text-green-600">
                            <Play className="mr-2 h-4 w-4" />
                            Resume Campaign
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
