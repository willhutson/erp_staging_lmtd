"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  Image,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SocialPlatform, ContentPostStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface CalendarPost {
  id: string;
  title: string;
  platforms: SocialPlatform[];
  contentType: string;
  status: ContentPostStatus;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  client: { id: string; name: string; code: string };
  assets: Array<{
    id: string;
    type: string;
    thumbnailUrl: string | null;
    fileUrl: string;
  }>;
}

interface Stats {
  total: number;
  draft: number;
  inReview: number;
  approved: number;
  scheduled: number;
  published: number;
}

interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  client: { id: string; name: string; code: string };
}

interface ContentCalendarClientProps {
  clients: Array<{ id: string; name: string; code: string }>;
  initialPosts: CalendarPost[];
  stats: Stats;
  socialAccounts: SocialAccount[];
  organizationId: string;
}

// ============================================
// HELPERS
// ============================================

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM_FEED: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_STORY: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_REEL: <Instagram className="w-4 h-4 text-pink-500" />,
  FACEBOOK_PAGE: <Facebook className="w-4 h-4 text-blue-600" />,
  FACEBOOK_STORY: <Facebook className="w-4 h-4 text-blue-600" />,
  THREADS: <Globe className="w-4 h-4 text-gray-800" />,
  TIKTOK: <Music2 className="w-4 h-4 text-gray-800" />,
  YOUTUBE_VIDEO: <Youtube className="w-4 h-4 text-red-600" />,
  YOUTUBE_SHORT: <Youtube className="w-4 h-4 text-red-600" />,
  LINKEDIN_PAGE: <Linkedin className="w-4 h-4 text-blue-700" />,
  LINKEDIN_PERSONAL: <Linkedin className="w-4 h-4 text-blue-700" />,
  LINKEDIN_ARTICLE: <Linkedin className="w-4 h-4 text-blue-700" />,
  X_TWEET: <Twitter className="w-4 h-4 text-gray-800" />,
  X_THREAD: <Twitter className="w-4 h-4 text-gray-800" />,
  WORDPRESS: <Globe className="w-4 h-4 text-blue-500" />,
  CUSTOM_CMS: <Globe className="w-4 h-4 text-gray-500" />,
  PINTEREST: <Globe className="w-4 h-4 text-red-600" />,
  SNAPCHAT: <Globe className="w-4 h-4 text-yellow-400" />,
};

const statusColors: Record<ContentPostStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  INTERNAL_REVIEW: "bg-yellow-100 text-yellow-700",
  CLIENT_REVIEW: "bg-orange-100 text-orange-700",
  REVISION_REQUESTED: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHING: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<ContentPostStatus, string> = {
  DRAFT: "Draft",
  INTERNAL_REVIEW: "Internal Review",
  CLIENT_REVIEW: "Client Review",
  REVISION_REQUESTED: "Revisions",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHING: "Publishing",
  PUBLISHED: "Published",
  FAILED: "Failed",
  ARCHIVED: "Archived",
};

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days in current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to fill last week
  const remaining = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ============================================
// COMPONENT
// ============================================

export function ContentCalendarClient({
  clients,
  initialPosts,
  stats,
  socialAccounts,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  organizationId: _organizationId,
}: ContentCalendarClientProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      if (selectedClient && post.client.id !== selectedClient) return false;
      if (selectedPlatform && !post.platforms.includes(selectedPlatform as SocialPlatform))
        return false;
      return true;
    });
  }, [initialPosts, selectedClient, selectedPlatform]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, CalendarPost[]> = {};
    filteredPosts.forEach((post) => {
      if (post.scheduledFor) {
        const dateKey = new Date(post.scheduledFor).toISOString().split("T")[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(post);
      }
    });
    return grouped;
  }, [filteredPosts]);

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Draft</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-500">In Review</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.inReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Approved</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-500">Scheduled</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-500">Published</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="font-semibold ml-2">{monthYear}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedClient || "all"}
            onValueChange={(v) => setSelectedClient(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPlatform || "all"}
            onValueChange={(v) => setSelectedPlatform(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="INSTAGRAM_FEED">Instagram</SelectItem>
              <SelectItem value="FACEBOOK_PAGE">Facebook</SelectItem>
              <SelectItem value="TIKTOK">TikTok</SelectItem>
              <SelectItem value="LINKEDIN_PAGE">LinkedIn</SelectItem>
              <SelectItem value="X_TWEET">X (Twitter)</SelectItem>
              <SelectItem value="YOUTUBE_VIDEO">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Link href="/content-engine/posts/new">
            <Button className="bg-[#52EDC7] hover:bg-[#3dd9b3] text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateKey = date.toISOString().split("T")[0];
                const dayPosts = postsByDate[dateKey] || [];
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-1 border rounded-lg",
                      !isCurrentMonth && "bg-gray-50",
                      isToday && "border-[#52EDC7] border-2"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        !isCurrentMonth && "text-gray-400",
                        isToday && "text-[#52EDC7]"
                      )}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <Link
                          key={post.id}
                          href={`/content-engine/posts/${post.id}`}
                          className="block"
                        >
                          <div
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              statusColors[post.status]
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {post.platforms.slice(0, 2).map((p) => (
                                <span key={p}>{platformIcons[p]}</span>
                              ))}
                              <span className="truncate">{post.title}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No posts found. Create your first post to get started.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/content-engine/posts/${post.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {post.assets[0]?.thumbnailUrl || post.assets[0]?.fileUrl ? (
                        <img
                          src={post.assets[0].thumbnailUrl || post.assets[0].fileUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : post.contentType.includes("VIDEO") ? (
                        <Video className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.platforms.map((p) => (
                          <span key={p}>{platformIcons[p]}</span>
                        ))}
                        <span className="font-medium truncate">{post.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{post.client.name}</span>
                        {post.scheduledFor && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(post.scheduledFor).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <Badge className={statusColors[post.status]}>
                      {statusLabels[post.status]}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats by Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {socialAccounts.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No social accounts connected yet. Add accounts in client settings.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {socialAccounts.slice(0, 12).map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  {platformIcons[account.platform]}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{account.accountName}</p>
                    <p className="text-xs text-gray-500 truncate">{account.client.code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
