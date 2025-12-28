"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Users,
  Heart,
  Eye,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Instagram,
  Youtube
} from "lucide-react";

// Mock creator analytics data
const creatorMetrics = {
  overview: {
    totalCreators: 25,
    signedCreators: 18,
    totalReach: 8500000,
    avgEngagement: 5.8,
    totalContent: 245,
    totalImpressions: 42000000,
  },
  topCreators: [
    {
      id: "1",
      name: "Ahmed Hassan",
      handle: "@ahmedhassan",
      platform: "YOUTUBE",
      followers: 1200000,
      engagementRate: 5.2,
      totalViews: 12500000,
      contentCount: 28,
      avgViews: 450000,
      trend: "up",
    },
    {
      id: "2",
      name: "Sarah Al Maktoum",
      handle: "@sarah_mak",
      platform: "INSTAGRAM",
      followers: 850000,
      engagementRate: 7.2,
      totalViews: 8200000,
      contentCount: 45,
      avgViews: 182000,
      trend: "up",
    },
    {
      id: "3",
      name: "Fatima Al Zaabi",
      handle: "@fatima.zaabi",
      platform: "TIKTOK",
      followers: 450000,
      engagementRate: 9.8,
      totalViews: 6800000,
      contentCount: 62,
      avgViews: 110000,
      trend: "up",
    },
    {
      id: "4",
      name: "Omar Rashid",
      handle: "@omarrashid",
      platform: "INSTAGRAM",
      followers: 620000,
      engagementRate: 5.5,
      totalViews: 4200000,
      contentCount: 32,
      avgViews: 131000,
      trend: "stable",
    },
    {
      id: "5",
      name: "Layla Mohammed",
      handle: "@laylamohd",
      platform: "INSTAGRAM",
      followers: 280000,
      engagementRate: 8.9,
      totalViews: 2800000,
      contentCount: 38,
      avgViews: 74000,
      trend: "up",
    },
  ],
  contentPerformance: [
    { type: "Reels", count: 85, avgViews: 125000, avgEngagement: 7.2 },
    { type: "Videos", count: 45, avgViews: 320000, avgEngagement: 4.5 },
    { type: "Posts", count: 72, avgViews: 45000, avgEngagement: 5.8 },
    { type: "Stories", count: 43, avgViews: 28000, avgEngagement: 3.2 },
  ],
  categoryBreakdown: [
    { category: "Lifestyle", creators: 8, avgEngagement: 6.2 },
    { category: "Tech", creators: 5, avgEngagement: 4.8 },
    { category: "Food", creators: 4, avgEngagement: 8.5 },
    { category: "Fitness", creators: 4, avgEngagement: 5.5 },
    { category: "Beauty", creators: 4, avgEngagement: 7.8 },
  ],
};

export default function CreatorAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");

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
        return <div className="h-4 w-4 font-bold text-black text-xs">TT</div>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Analytics</h1>
          <p className="text-muted-foreground">
            Track creator performance and content metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Creators
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorMetrics.overview.totalCreators}</div>
            <p className="text-xs text-muted-foreground">
              {creatorMetrics.overview.signedCreators} signed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(creatorMetrics.overview.totalReach)}
            </div>
            <p className="text-xs text-muted-foreground">Combined followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creatorMetrics.overview.avgEngagement}%
            </div>
            <p className="text-xs text-muted-foreground">Across all creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Content
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorMetrics.overview.totalContent}</div>
            <p className="text-xs text-muted-foreground">Pieces tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(creatorMetrics.overview.totalImpressions)}
            </div>
            <p className="text-xs text-muted-foreground">Content views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Views
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                creatorMetrics.overview.totalImpressions / creatorMetrics.overview.totalContent
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per content</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Creators */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Performing Creators</CardTitle>
            <CardDescription>Ranked by total views and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creatorMetrics.topCreators.map((creator, index) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {creator.name}
                        {getPlatformIcon(creator.platform)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {creator.handle} · {formatNumber(creator.followers)} followers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(creator.totalViews)}</div>
                      <div className="text-xs text-muted-foreground">total views</div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          creator.engagementRate >= 7
                            ? "border-green-500 text-green-500"
                            : creator.engagementRate >= 5
                            ? "border-blue-500 text-blue-500"
                            : ""
                        }
                      >
                        {creator.engagementRate}%
                      </Badge>
                      <div className="text-xs text-muted-foreground">engagement</div>
                    </div>
                    {getTrendIcon(creator.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Performance & Categories */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content by Type</CardTitle>
              <CardDescription>Performance breakdown by content format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creatorMetrics.contentPerformance.map((content) => (
                  <div key={content.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{content.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {content.count} pieces
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Avg {formatNumber(content.avgViews)} views
                      </span>
                      <Badge variant="outline">{content.avgEngagement}% eng</Badge>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(content.avgEngagement / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Creator distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creatorMetrics.categoryBreakdown.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.creators} creators
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        category.avgEngagement >= 7
                          ? "border-green-500 text-green-500"
                          : category.avgEngagement >= 5
                          ? "border-blue-500 text-blue-500"
                          : ""
                      }
                    >
                      {category.avgEngagement}% avg eng
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
