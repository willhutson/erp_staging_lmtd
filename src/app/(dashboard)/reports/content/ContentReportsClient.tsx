"use client";

/**
 * Content Metrics Reports Client
 *
 * Interactive content performance analytics.
 */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import type { ContentMetrics } from "@/modules/reporting/actions/analytics-actions";

interface ContentReportsClientProps {
  metrics: ContentMetrics;
  currentMonth: string;
}

function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(num: number): string {
  return `${formatNumber(num, 1)}%`;
}

// Platform display names
const PLATFORM_NAMES: Record<string, string> = {
  INSTAGRAM_FEED: "Instagram Feed",
  INSTAGRAM_STORY: "Instagram Story",
  INSTAGRAM_REEL: "Instagram Reel",
  FACEBOOK_PAGE: "Facebook",
  TIKTOK: "TikTok",
  YOUTUBE_VIDEO: "YouTube",
  YOUTUBE_SHORT: "YouTube Short",
  LINKEDIN_PAGE: "LinkedIn",
  X_TWEET: "X (Twitter)",
  THREADS: "Threads",
};

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM_FEED: "bg-pink-500",
  INSTAGRAM_STORY: "bg-pink-400",
  INSTAGRAM_REEL: "bg-pink-600",
  FACEBOOK_PAGE: "bg-blue-600",
  TIKTOK: "bg-black",
  YOUTUBE_VIDEO: "bg-red-600",
  YOUTUBE_SHORT: "bg-red-500",
  LINKEDIN_PAGE: "bg-blue-700",
  X_TWEET: "bg-gray-900",
  THREADS: "bg-gray-800",
};

// Content type display names
const CONTENT_TYPE_NAMES: Record<string, string> = {
  SINGLE_IMAGE: "Single Image",
  CAROUSEL: "Carousel",
  VIDEO: "Video",
  SHORT_VIDEO: "Short Video",
  STORY: "Story",
  TEXT_ONLY: "Text Only",
  ARTICLE: "Article",
};

export function ContentReportsClient({
  metrics,
  currentMonth,
}: ContentReportsClientProps) {
  // Get top platforms
  const topPlatforms = Object.entries(metrics.postsByPlatform)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Get top content types
  const topContentTypes = Object.entries(metrics.postsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Calculate pipeline distribution
  const pipelineTotal =
    metrics.draft + metrics.inReview + metrics.approved + metrics.scheduled + metrics.published;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Content Metrics</h1>
            <p className="text-gray-600">Publishing analytics for {currentMonth}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalPosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.published)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.scheduled)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Approval</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.avgApprovalTime, 1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Content Pipeline</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm">Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.draft}</span>
                <Progress
                  value={pipelineTotal > 0 ? (metrics.draft / pipelineTotal) * 100 : 0}
                  className="w-24 h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm">In Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.inReview}</span>
                <Progress
                  value={pipelineTotal > 0 ? (metrics.inReview / pipelineTotal) * 100 : 0}
                  className="w-24 h-2 [&>div]:bg-yellow-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.approved}</span>
                <Progress
                  value={pipelineTotal > 0 ? (metrics.approved / pipelineTotal) * 100 : 0}
                  className="w-24 h-2 [&>div]:bg-green-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-sm">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.scheduled}</span>
                <Progress
                  value={pipelineTotal > 0 ? (metrics.scheduled / pipelineTotal) * 100 : 0}
                  className="w-24 h-2 [&>div]:bg-blue-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.published}</span>
                <Progress
                  value={pipelineTotal > 0 ? (metrics.published / pipelineTotal) * 100 : 0}
                  className="w-24 h-2 [&>div]:bg-purple-500"
                />
              </div>
            </div>

            {metrics.failed > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">{metrics.failed}</span>
                  <Progress
                    value={pipelineTotal > 0 ? (metrics.failed / pipelineTotal) * 100 : 0}
                    className="w-24 h-2 [&>div]:bg-red-500"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Publishing efficiency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Publish Success Rate</span>
                <span className="text-sm font-medium">
                  {formatPercent(metrics.publishSuccessRate)}
                </span>
              </div>
              <Progress
                value={metrics.publishSuccessRate}
                className={`h-3 ${
                  metrics.publishSuccessRate >= 95
                    ? "[&>div]:bg-green-500"
                    : metrics.publishSuccessRate >= 80
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-red-500"
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Revision Rate</span>
                <span className="text-sm font-medium">
                  {formatPercent(metrics.revisionRate)}
                </span>
              </div>
              <Progress
                value={metrics.revisionRate}
                className={`h-3 ${
                  metrics.revisionRate <= 15
                    ? "[&>div]:bg-green-500"
                    : metrics.revisionRate <= 30
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-red-500"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower is better - indicates first-time approval rate
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Approval Time</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {formatNumber(metrics.avgApprovalTime, 1)} hours
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform & Content Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Posts by Platform
            </CardTitle>
            <CardDescription>Distribution across social platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlatforms.map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      PLATFORM_COLORS[platform] || "bg-gray-400"
                    }`}
                  />
                  <span className="flex-1 text-sm">
                    {PLATFORM_NAMES[platform] || platform}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-24">
                    <Progress
                      value={metrics.totalPosts > 0 ? (count / metrics.totalPosts) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {topPlatforms.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No platform data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Content Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Posts by Content Type
            </CardTitle>
            <CardDescription>Distribution by format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContentTypes.map(([type, count], index) => (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-purple-500",
                        "bg-orange-500",
                        "bg-pink-500",
                        "bg-cyan-500",
                      ][index] || "bg-gray-400"
                    }`}
                  />
                  <span className="flex-1 text-sm">
                    {CONTENT_TYPE_NAMES[type] || type}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-24">
                    <Progress
                      value={metrics.totalPosts > 0 ? (count / metrics.totalPosts) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {topContentTypes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No content type data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Clients by Content Volume
          </CardTitle>
          <CardDescription>Clients with most content this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.postsByClient.slice(0, 6).map((client, index) => (
              <div
                key={client.clientId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-400"
                        : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Link
                    href={`/clients/${client.clientId}`}
                    className="font-medium hover:underline"
                  >
                    {client.clientName}
                  </Link>
                </div>
                <Badge variant="outline">{client.count} posts</Badge>
              </div>
            ))}
            {metrics.postsByClient.length === 0 && (
              <p className="text-sm text-gray-500 col-span-3 text-center py-4">
                No client data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
