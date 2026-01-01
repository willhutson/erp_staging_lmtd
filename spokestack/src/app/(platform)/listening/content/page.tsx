"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Play,
  Image,
  Video,
  Instagram,
  Youtube,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock content data
const mockContent = [
  {
    id: "1",
    creator: "Sarah Al Maktoum",
    creatorHandle: "@sarah_mak",
    creatorAvatar: null,
    platform: "INSTAGRAM",
    contentType: "REEL",
    caption: "A day in my life exploring the beautiful streets of Dubai Marina #DubaiLife #Lifestyle",
    thumbnailUrl: null,
    contentUrl: "https://instagram.com/p/xxx",
    publishedAt: "2024-12-27T14:00:00Z",
    views: 125000,
    likes: 8500,
    comments: 342,
    shares: 156,
    engagementRate: 7.2,
    campaignId: "1",
    campaignName: "Dubai Summer Campaign",
  },
  {
    id: "2",
    creator: "Ahmed Hassan",
    creatorHandle: "@ahmedhassan",
    creatorAvatar: null,
    platform: "YOUTUBE",
    contentType: "VIDEO",
    caption: "iPhone 16 Pro Max FULL Review - Everything You Need to Know!",
    thumbnailUrl: null,
    contentUrl: "https://youtube.com/watch?v=xxx",
    publishedAt: "2024-12-26T10:00:00Z",
    views: 450000,
    likes: 12500,
    comments: 876,
    shares: 234,
    engagementRate: 3.0,
    campaignId: null,
    campaignName: null,
  },
  {
    id: "3",
    creator: "Fatima Al Zaabi",
    creatorHandle: "@fatima.zaabi",
    creatorAvatar: null,
    platform: "TIKTOK",
    contentType: "VIDEO",
    caption: "The most amazing hidden gem restaurant in Abu Dhabi you HAVE to try! #FoodTok #AbuDhabi",
    thumbnailUrl: null,
    contentUrl: "https://tiktok.com/@fatima.zaabi/video/xxx",
    publishedAt: "2024-12-28T08:30:00Z",
    views: 89000,
    likes: 7800,
    comments: 423,
    shares: 567,
    engagementRate: 9.8,
    campaignId: null,
    campaignName: null,
  },
  {
    id: "4",
    creator: "Omar Rashid",
    creatorHandle: "@omarrashid",
    creatorAvatar: null,
    platform: "INSTAGRAM",
    contentType: "CAROUSEL",
    caption: "5 exercises you can do anywhere for a quick workout #Fitness #WorkoutTips",
    thumbnailUrl: null,
    contentUrl: "https://instagram.com/p/yyy",
    publishedAt: "2024-12-25T16:00:00Z",
    views: 67000,
    likes: 4200,
    comments: 189,
    shares: 312,
    engagementRate: 7.0,
    campaignId: "2",
    campaignName: "Wellness Week",
  },
  {
    id: "5",
    creator: "Layla Mohammed",
    creatorHandle: "@laylamohd",
    creatorAvatar: null,
    platform: "INSTAGRAM",
    contentType: "REEL",
    caption: "My night skincare routine using only local products #Skincare #Beauty #UAEBrands",
    thumbnailUrl: null,
    contentUrl: "https://instagram.com/p/zzz",
    publishedAt: "2024-12-27T20:00:00Z",
    views: 34000,
    likes: 2800,
    comments: 156,
    shares: 89,
    engagementRate: 8.9,
    campaignId: "3",
    campaignName: "Local Beauty Campaign",
  },
  {
    id: "6",
    creator: "Sarah Al Maktoum",
    creatorHandle: "@sarah_mak",
    creatorAvatar: null,
    platform: "TIKTOK",
    contentType: "VIDEO",
    caption: "POV: You're shopping at Dubai Mall during sale season",
    thumbnailUrl: null,
    contentUrl: "https://tiktok.com/@sarah_mak/video/xxx",
    publishedAt: "2024-12-24T12:00:00Z",
    views: 210000,
    likes: 18500,
    comments: 756,
    shares: 1234,
    engagementRate: 9.7,
    campaignId: null,
    campaignName: null,
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredContent = mockContent.filter((content) => {
    const matchesSearch =
      content.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || content.platform === platformFilter;
    const matchesType = contentTypeFilter === "all" || content.contentType === contentTypeFilter;
    return matchesSearch && matchesPlatform && matchesType;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "INSTAGRAM":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "YOUTUBE":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "TIKTOK":
        return <div className="h-4 w-4 font-bold text-black">TT</div>;
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "REEL":
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "CAROUSEL":
      case "POST":
        return <Image className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalViews = mockContent.reduce((sum, c) => sum + c.views, 0);
  const totalEngagements = mockContent.reduce((sum, c) => sum + c.likes + c.comments + c.shares, 0);
  const avgEngagement = mockContent.reduce((sum, c) => sum + c.engagementRate, 0) / mockContent.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground">
            Track and analyze creator content performance
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Content
            </CardTitle>
            <Video className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockContent.length}</div>
            <p className="text-xs text-muted-foreground">Pieces tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
            <p className="text-xs text-muted-foreground">Across all content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagements
            </CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalEngagements)}</div>
            <p className="text-xs text-muted-foreground">Likes, comments, shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Engagement
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Content</CardTitle>
              <CardDescription>
                View and analyze creator content
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="REEL">Reels</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="CAROUSEL">Carousels</SelectItem>
                  <SelectItem value="POST">Posts</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((content) => (
                <Card key={content.id} className="overflow-hidden">
                  {/* Thumbnail placeholder */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white/50" />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {getPlatformIcon(content.platform)}
                      <Badge variant="secondary" className="text-xs">
                        {content.contentType}
                      </Badge>
                    </div>
                    {content.campaignName && (
                      <Badge className="absolute top-2 right-2 bg-blue-500 text-xs">
                        {content.campaignName}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(content.creator)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {content.creator}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {content.creatorHandle}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{content.caption}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(content.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(content.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {formatNumber(content.comments)}
                        </span>
                      </div>
                      <span className="text-xs">{formatDate(content.publishedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className="text-xs">
                        {content.engagementRate.toFixed(1)}% engagement
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shrink-0">
                    <Play className="h-6 w-6 text-white/50" />
                    <div className="absolute top-1 left-1">
                      {getPlatformIcon(content.platform)}
                    </div>
                  </div>

                  {/* Content info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(content.creator)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{content.creator}</span>
                      <span className="text-xs text-muted-foreground">
                        {content.creatorHandle}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {content.contentType}
                      </Badge>
                      {content.campaignName && (
                        <Badge className="bg-blue-500 text-xs">
                          {content.campaignName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-1">{content.caption}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(content.publishedAt)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(content.views)}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(content.likes)}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(content.comments)}</div>
                      <div className="text-xs text-muted-foreground">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-500">
                        {content.engagementRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Eng Rate</div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Platform
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
