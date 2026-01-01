"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Instagram,
  Youtube,
  Eye,
  Heart,
  MousePointer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from "lucide-react";

// Mock platform comparison data
const platformData = {
  paid: [
    {
      id: "meta",
      name: "Meta",
      icon: "META",
      color: "bg-blue-500",
      metrics: {
        spend: 88500,
        impressions: 6800000,
        clicks: 85000,
        ctr: 1.25,
        cpc: 1.04,
        conversions: 2400,
        cpa: 36.88,
        roas: 4.8,
      },
      trend: "up",
      change: 12.5,
    },
    {
      id: "google",
      name: "Google",
      icon: "GOOGLE",
      color: "bg-red-500",
      metrics: {
        spend: 61000,
        impressions: 3200000,
        clicks: 48000,
        ctr: 1.5,
        cpc: 1.27,
        conversions: 1450,
        cpa: 42.07,
        roas: 3.9,
      },
      trend: "up",
      change: 8.2,
    },
    {
      id: "tiktok",
      name: "TikTok Ads",
      icon: "TIKTOK",
      color: "bg-black",
      metrics: {
        spend: 18500,
        impressions: 2500000,
        clicks: 23000,
        ctr: 0.92,
        cpc: 0.80,
        conversions: 400,
        cpa: 46.25,
        roas: 3.2,
      },
      trend: "up",
      change: 24.8,
    },
  ],
  organic: [
    {
      id: "instagram",
      name: "Instagram",
      icon: "INSTAGRAM",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      metrics: {
        followers: 2850000,
        posts: 145,
        impressions: 18500000,
        engagement: 685000,
        engagementRate: 6.8,
        reach: 12400000,
      },
      trend: "up",
      change: 5.2,
    },
    {
      id: "tiktok-organic",
      name: "TikTok",
      icon: "TIKTOK",
      color: "bg-black",
      metrics: {
        followers: 1200000,
        posts: 82,
        impressions: 24000000,
        engagement: 1850000,
        engagementRate: 9.2,
        reach: 18500000,
      },
      trend: "up",
      change: 18.5,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "YOUTUBE",
      color: "bg-red-600",
      metrics: {
        followers: 800000,
        posts: 28,
        impressions: 12500000,
        engagement: 520000,
        engagementRate: 4.5,
        reach: 8200000,
      },
      trend: "stable",
      change: 2.1,
    },
  ],
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function PlatformComparisonPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [viewMode, setViewMode] = useState<"paid" | "organic">("paid");

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

  const getPlatformIcon = (icon: string, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-sm";
    switch (icon) {
      case "META":
        return (
          <div className={`${sizeClass} rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold`}>
            f
          </div>
        );
      case "GOOGLE":
        return (
          <div className={`${sizeClass} rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold`}>
            G
          </div>
        );
      case "TIKTOK":
        return (
          <div className={`${sizeClass} rounded-lg bg-black flex items-center justify-center text-white font-bold`}>
            TT
          </div>
        );
      case "INSTAGRAM":
        return (
          <div className={`${sizeClass} rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white`}>
            <Instagram className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
          </div>
        );
      case "YOUTUBE":
        return (
          <div className={`${sizeClass} rounded-lg bg-red-600 flex items-center justify-center text-white`}>
            <Youtube className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
          </div>
        );
      default:
        return null;
    }
  };

  const getTrendBadge = (trend: string, change: number) => {
    const isPositive = change >= 0;
    return (
      <Badge
        variant="outline"
        className={isPositive ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
      >
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {isPositive ? "+" : ""}{change}%
      </Badge>
    );
  };

  // Calculate totals
  const paidTotals = {
    spend: platformData.paid.reduce((sum, p) => sum + p.metrics.spend, 0),
    impressions: platformData.paid.reduce((sum, p) => sum + p.metrics.impressions, 0),
    clicks: platformData.paid.reduce((sum, p) => sum + p.metrics.clicks, 0),
    conversions: platformData.paid.reduce((sum, p) => sum + p.metrics.conversions, 0),
  };

  const organicTotals = {
    followers: platformData.organic.reduce((sum, p) => sum + p.metrics.followers, 0),
    impressions: platformData.organic.reduce((sum, p) => sum + p.metrics.impressions, 0),
    engagement: platformData.organic.reduce((sum, p) => sum + p.metrics.engagement, 0),
    reach: platformData.organic.reduce((sum, p) => sum + p.metrics.reach, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Comparison</h1>
          <p className="text-muted-foreground">
            Compare performance across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === "paid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("paid")}
            >
              Paid Media
            </Button>
            <Button
              variant={viewMode === "organic" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("organic")}
            >
              Organic
            </Button>
          </div>
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

      {viewMode === "paid" ? (
        <>
          {/* Paid Media Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spend
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(paidTotals.spend)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Impressions
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(paidTotals.impressions)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </CardTitle>
                <MousePointer className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(paidTotals.clicks)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Conversions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(paidTotals.conversions)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {platformData.paid.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform.icon, "lg")}
                      <div>
                        <CardTitle>{platform.name}</CardTitle>
                        <CardDescription>
                          {formatCurrency(platform.metrics.spend)} spent
                        </CardDescription>
                      </div>
                    </div>
                    {getTrendBadge(platform.trend, platform.change)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Impressions</div>
                      <div className="text-lg font-semibold">{formatNumber(platform.metrics.impressions)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Clicks</div>
                      <div className="text-lg font-semibold">{formatNumber(platform.metrics.clicks)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">CTR</div>
                      <div className="text-lg font-semibold">{platform.metrics.ctr}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">CPC</div>
                      <div className="text-lg font-semibold">${platform.metrics.cpc.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Conversions</div>
                        <div className="text-lg font-semibold">{formatNumber(platform.metrics.conversions)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">ROAS</div>
                        <Badge
                          variant="outline"
                          className={
                            platform.metrics.roas >= 4
                              ? "border-green-500 text-green-500"
                              : "border-blue-500 text-blue-500"
                          }
                        >
                          {platform.metrics.roas}x
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Spend share</div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className={`h-full ${platform.color} rounded-full`}
                        style={{
                          width: `${(platform.metrics.spend / paidTotals.spend) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Organic Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Followers
                </CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(organicTotals.followers)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Impressions
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(organicTotals.impressions)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Engagement
                </CardTitle>
                <Heart className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(organicTotals.engagement)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reach
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(organicTotals.reach)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Organic Platform Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {platformData.organic.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform.icon, "lg")}
                      <div>
                        <CardTitle>{platform.name}</CardTitle>
                        <CardDescription>
                          {formatNumber(platform.metrics.followers)} followers
                        </CardDescription>
                      </div>
                    </div>
                    {getTrendBadge(platform.trend, platform.change)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                      <div className="text-lg font-semibold">{platform.metrics.posts}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Impressions</div>
                      <div className="text-lg font-semibold">{formatNumber(platform.metrics.impressions)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Engagement</div>
                      <div className="text-lg font-semibold">{formatNumber(platform.metrics.engagement)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Eng Rate</div>
                      <Badge
                        variant="outline"
                        className={
                          platform.metrics.engagementRate >= 7
                            ? "border-green-500 text-green-500"
                            : "border-blue-500 text-blue-500"
                        }
                      >
                        {platform.metrics.engagementRate}%
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Reach</div>
                        <div className="text-lg font-semibold">{formatNumber(platform.metrics.reach)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Audience share</div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className={`h-full ${platform.color} rounded-full`}
                        style={{
                          width: `${(platform.metrics.followers / organicTotals.followers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
