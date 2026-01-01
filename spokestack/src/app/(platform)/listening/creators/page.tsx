"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
  User,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  TrendingUp,
  Users,
  Heart,
  Eye,
  Link2,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock creators data
const mockCreators = [
  {
    id: "1",
    name: "Sarah Al Maktoum",
    handle: "@sarah_mak",
    avatar: null,
    status: "SIGNED",
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 850000,
    avgEngagementRate: 4.2,
    categories: ["Lifestyle", "Fashion"],
    platforms: [
      { platform: "INSTAGRAM", handle: "@sarah_mak", followers: 500000, engagementRate: 4.5 },
      { platform: "TIKTOK", handle: "@sarahmak", followers: 350000, engagementRate: 6.2 },
    ],
    campaigns: 8,
    totalReach: 12500000,
    contractEnd: "2025-06-30",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    handle: "@ahmedhassan",
    avatar: null,
    status: "SIGNED",
    primaryPlatform: "YOUTUBE",
    totalFollowers: 1200000,
    avgEngagementRate: 3.8,
    categories: ["Tech", "Gadgets"],
    platforms: [
      { platform: "YOUTUBE", handle: "@AhmedHassanTech", followers: 800000, engagementRate: 5.2 },
      { platform: "INSTAGRAM", handle: "@ahmedhassan", followers: 400000, engagementRate: 3.1 },
    ],
    campaigns: 12,
    totalReach: 28000000,
    contractEnd: "2025-12-31",
  },
  {
    id: "3",
    name: "Fatima Al Zaabi",
    handle: "@fatima.zaabi",
    avatar: null,
    status: "PROSPECT",
    primaryPlatform: "TIKTOK",
    totalFollowers: 450000,
    avgEngagementRate: 8.5,
    categories: ["Food", "Travel"],
    platforms: [
      { platform: "TIKTOK", handle: "@fatima.zaabi", followers: 350000, engagementRate: 9.1 },
      { platform: "INSTAGRAM", handle: "@fatimaz", followers: 100000, engagementRate: 5.2 },
    ],
    campaigns: 0,
    totalReach: 0,
    contractEnd: null,
  },
  {
    id: "4",
    name: "Omar Rashid",
    handle: "@omarrashid",
    avatar: null,
    status: "NEGOTIATION",
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 620000,
    avgEngagementRate: 5.1,
    categories: ["Fitness", "Wellness"],
    platforms: [
      { platform: "INSTAGRAM", handle: "@omarrashid", followers: 420000, engagementRate: 5.5 },
      { platform: "YOUTUBE", handle: "@OmarFitness", followers: 200000, engagementRate: 4.2 },
    ],
    campaigns: 3,
    totalReach: 5200000,
    contractEnd: null,
  },
  {
    id: "5",
    name: "Layla Mohammed",
    handle: "@laylamohd",
    avatar: null,
    status: "SIGNED",
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 280000,
    avgEngagementRate: 6.8,
    categories: ["Beauty", "Skincare"],
    platforms: [
      { platform: "INSTAGRAM", handle: "@laylamohd", followers: 200000, engagementRate: 7.2 },
      { platform: "TIKTOK", handle: "@layla.m", followers: 80000, engagementRate: 5.5 },
    ],
    campaigns: 5,
    totalReach: 3800000,
    contractEnd: "2025-03-15",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredCreators = mockCreators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || creator.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || creator.primaryPlatform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "INSTAGRAM":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "YOUTUBE":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "TIKTOK":
        return <div className="h-4 w-4 font-bold text-black">TT</div>;
      case "TWITTER":
        return <Twitter className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SIGNED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Signed
          </Badge>
        );
      case "NEGOTIATION":
        return <Badge className="bg-yellow-500">Negotiation</Badge>;
      case "OUTREACH":
        return <Badge className="bg-blue-500">Outreach</Badge>;
      case "PROSPECT":
        return <Badge variant="secondary">Prospect</Badge>;
      case "INACTIVE":
        return <Badge variant="outline">Inactive</Badge>;
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

  const signedCreators = mockCreators.filter((c) => c.status === "SIGNED");
  const totalFollowers = mockCreators.reduce((sum, c) => sum + c.totalFollowers, 0);
  const avgEngagement = mockCreators.reduce((sum, c) => sum + c.avgEngagementRate, 0) / mockCreators.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
          <p className="text-muted-foreground">
            Manage your creator roster and partnerships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Link2 className="mr-2 h-4 w-4" />
            Connect Phyllo
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Creator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Creator</DialogTitle>
                <DialogDescription>
                  Add a new creator to your roster. You can connect their social accounts later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g., Sarah Al Maktoum" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="creator@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Primary Platform</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                        <SelectItem value="YOUTUBE">YouTube</SelectItem>
                        <SelectItem value="TWITTER">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="handle">Handle</Label>
                    <Input id="handle" placeholder="@username" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categories">Categories</Label>
                  <Input id="categories" placeholder="e.g., Lifestyle, Fashion, Beauty" />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of content categories
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="PROSPECT">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROSPECT">Prospect</SelectItem>
                      <SelectItem value="OUTREACH">Outreach</SelectItem>
                      <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                      <SelectItem value="SIGNED">Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Add Creator
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Creators
            </CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCreators.length}</div>
            <p className="text-xs text-muted-foreground">
              {signedCreators.length} signed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFollowers(totalFollowers)}</div>
            <p className="text-xs text-muted-foreground">Combined followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCreators.reduce((sum, c) => sum + c.campaigns, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Creators Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Creator Roster</CardTitle>
              <CardDescription>
                View and manage your creators
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SIGNED">Signed</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                  <SelectItem value="TWITTER">Twitter</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search creators..."
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
                <TableHead>Creator</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={creator.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{creator.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {creator.handle}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {creator.platforms.map((p) => (
                        <div
                          key={p.platform}
                          className="flex items-center gap-1"
                          title={`${p.platform}: ${formatFollowers(p.followers)}`}
                        >
                          {getPlatformIcon(p.platform)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatFollowers(creator.totalFollowers)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span>{creator.avgEngagementRate.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {creator.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(creator.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.campaigns}</span>
                    </div>
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 className="mr-2 h-4 w-4" />
                          Connect Platforms
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
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
