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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Mock analytics data
const campaignMetrics = {
  overview: {
    impressions: { value: 12500000, change: 15.2, trend: "up" },
    clicks: { value: 156000, change: 8.7, trend: "up" },
    conversions: { value: 4250, change: -2.3, trend: "down" },
    spend: { value: 168000, change: 12.1, trend: "up" },
    ctr: { value: 1.25, change: 0.15, trend: "up" },
    cpa: { value: 39.53, change: -5.2, trend: "down" },
    roas: { value: 4.2, change: 0.3, trend: "up" },
  },
  byPlatform: [
    {
      platform: "Meta",
      color: "bg-blue-500",
      impressions: 6800000,
      clicks: 85000,
      conversions: 2400,
      spend: 88500,
      ctr: 1.25,
      cpa: 36.88,
      roas: 4.8,
    },
    {
      platform: "Google",
      color: "bg-red-500",
      impressions: 3200000,
      clicks: 48000,
      conversions: 1450,
      spend: 61000,
      ctr: 1.5,
      cpa: 42.07,
      roas: 3.9,
    },
    {
      platform: "TikTok",
      color: "bg-black",
      impressions: 2500000,
      clicks: 23000,
      conversions: 400,
      spend: 18500,
      ctr: 0.92,
      cpa: 46.25,
      roas: 3.2,
    },
  ],
  byCampaign: [
    { name: "DET - Visit Dubai", spend: 32000, conversions: 890, roas: 5.8, trend: "up" },
    { name: "CCAD - Brand Awareness", spend: 28500, conversions: 650, roas: 4.2, trend: "up" },
    { name: "ADEK - Education Week", spend: 24000, conversions: 520, roas: 3.8, trend: "stable" },
    { name: "ECD - Tech Launch", spend: 18000, conversions: 380, roas: 3.5, trend: "down" },
  ],
  dailyTrend: [
    { date: "Dec 20", impressions: 420000, clicks: 5200, spend: 5600 },
    { date: "Dec 21", impressions: 480000, clicks: 5800, spend: 6100 },
    { date: "Dec 22", impressions: 510000, clicks: 6200, spend: 6400 },
    { date: "Dec 23", impressions: 450000, clicks: 5500, spend: 5800 },
    { date: "Dec 24", impressions: 380000, clicks: 4800, spend: 5200 },
    { date: "Dec 25", impressions: 320000, clicks: 4000, spend: 4500 },
    { date: "Dec 26", impressions: 520000, clicks: 6400, spend: 6800 },
    { date: "Dec 27", impressions: 580000, clicks: 7100, spend: 7200 },
  ],
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CampaignAnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");

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

  const getTrendIcon = (trend: string, size: "sm" | "md" = "sm") => {
    const className = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    if (trend === "up") return <ArrowUpRight className={`${className} text-green-500`} />;
    if (trend === "down") return <ArrowDownRight className={`${className} text-red-500`} />;
    return <div className={className} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            Track performance across all paid media campaigns
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
              <SelectItem value="14d">Last 14 days</SelectItem>
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

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Impressions
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(campaignMetrics.overview.impressions.value)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.impressions.trend)}
              <span className={campaignMetrics.overview.impressions.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.impressions.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.impressions.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Clicks
            </CardTitle>
            <MousePointer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(campaignMetrics.overview.clicks.value)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.clicks.trend)}
              <span className={campaignMetrics.overview.clicks.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.clicks.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.clicks.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Conversions
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(campaignMetrics.overview.conversions.value)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.conversions.trend)}
              <span className={campaignMetrics.overview.conversions.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.conversions.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.conversions.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(campaignMetrics.overview.spend.value)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.spend.trend)}
              <span className={campaignMetrics.overview.spend.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.spend.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.spend.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              CTR
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignMetrics.overview.ctr.value}%
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.ctr.trend)}
              <span className={campaignMetrics.overview.ctr.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.ctr.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.ctr.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              CPA
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaignMetrics.overview.cpa.value.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.cpa.trend === "down" ? "up" : "down")}
              <span className={campaignMetrics.overview.cpa.change <= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.cpa.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ROAS
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignMetrics.overview.roas.value}x
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(campaignMetrics.overview.roas.trend)}
              <span className={campaignMetrics.overview.roas.change >= 0 ? "text-green-500" : "text-red-500"}>
                {campaignMetrics.overview.roas.change >= 0 ? "+" : ""}
                {campaignMetrics.overview.roas.change}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance by Platform */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Platform</CardTitle>
            <CardDescription>Compare metrics across advertising platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignMetrics.byPlatform.map((platform) => (
                <div key={platform.platform} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <Badge variant="outline">{formatCurrency(platform.spend)}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Impressions</div>
                      <div className="font-medium">{formatNumber(platform.impressions)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Clicks</div>
                      <div className="font-medium">{formatNumber(platform.clicks)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">CTR</div>
                      <div className="font-medium">{platform.ctr}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">ROAS</div>
                      <div className="font-medium text-green-500">{platform.roas}x</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div
                      className={`h-full ${platform.color} rounded-full`}
                      style={{
                        width: `${(platform.spend / campaignMetrics.overview.spend.value) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>Best performing campaigns by ROAS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignMetrics.byCampaign.map((campaign, index) => (
                <div
                  key={campaign.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(campaign.spend)} spent
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">{campaign.conversions}</div>
                      <div className="text-xs text-muted-foreground">conversions</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={
                          campaign.roas >= 5
                            ? "border-green-500 text-green-500"
                            : campaign.roas >= 3
                            ? "border-blue-500 text-blue-500"
                            : ""
                        }
                      >
                        {campaign.roas}x
                      </Badge>
                      {getTrendIcon(campaign.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Trend</CardTitle>
          <CardDescription>Impressions, clicks, and spend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-around gap-2">
            {campaignMetrics.dailyTrend.map((day, index) => {
              const maxImpressions = Math.max(...campaignMetrics.dailyTrend.map((d) => d.impressions));
              const height = (day.impressions / maxImpressions) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${height * 2}px` }}
                    >
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{ height: `${(day.clicks / day.impressions) * 100 * 2}px` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span className="text-sm text-muted-foreground">Impressions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-sm text-muted-foreground">Clicks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
