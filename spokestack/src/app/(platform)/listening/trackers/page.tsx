"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Radio,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Pencil,
  Trash2,
  Play,
  Pause,
  Activity,
  MessageCircle,
  Hash,
} from "lucide-react";

// Platform badge colors
const platformColors: Record<string, string> = {
  instagram: "bg-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  twitter: "bg-black",
  linkedin: "bg-blue-600",
  facebook: "bg-blue-500",
};

const platformLabels: Record<string, string> = {
  instagram: "IG",
  tiktok: "TT",
  youtube: "YT",
  twitter: "X",
  linkedin: "LI",
  facebook: "FB",
};

// Mock trackers data
const mockTrackers = [
  {
    id: "1",
    name: "CCAD Brand Mentions",
    client: "Culture & Creative Arts Dubai",
    status: "active",
    platforms: ["instagram", "tiktok", "youtube"],
    query: {
      include: ["CCAD", "Culture Creative Arts Dubai", "@ccaborad"],
      exclude: ["jobs", "hiring"],
      hashtags: ["#DubaiCulture", "#UAEArts", "#CCAD"],
    },
    stats: {
      mentions24h: 47,
      mentionsChange: 12,
      sentiment: 0.73,
      sentimentChange: 0.05,
    },
    lastUpdated: "2 min ago",
  },
  {
    id: "2",
    name: "Dubai Tourism Campaign",
    client: "Dubai Tourism",
    status: "active",
    platforms: ["instagram", "tiktok", "youtube", "twitter", "facebook"],
    query: {
      include: ["Visit Dubai", "Dubai Tourism", "@visitdubai"],
      exclude: [],
      hashtags: ["#VisitDubai", "#DubaiLife", "#MyDubai"],
    },
    stats: {
      mentions24h: 1243,
      mentionsChange: -8,
      sentiment: 0.81,
      sentimentChange: 0.02,
    },
    lastUpdated: "5 min ago",
  },
  {
    id: "3",
    name: "ADEK Education",
    client: "Abu Dhabi Education",
    status: "paused",
    platforms: ["instagram", "twitter", "linkedin"],
    query: {
      include: ["ADEK", "Abu Dhabi Education"],
      exclude: ["complaint"],
      hashtags: ["#ADEK", "#AbuDhabiEducation"],
    },
    stats: {
      mentions24h: 89,
      mentionsChange: 0,
      sentiment: 0.65,
      sentimentChange: -0.03,
    },
    lastUpdated: "1 hour ago",
  },
];

export default function TrackersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrackers = mockTrackers.filter(
    (tracker) =>
      tracker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tracker.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = mockTrackers.filter((t) => t.status === "active").length;
  const totalMentions = mockTrackers.reduce((sum, t) => sum + t.stats.mentions24h, 0);
  const avgSentiment = mockTrackers.reduce((sum, t) => sum + t.stats.sentiment, 0) / mockTrackers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Trackers</h1>
          <p className="text-muted-foreground">
            Monitor brand mentions and sentiment across social platforms
          </p>
        </div>
        <Button asChild>
          <Link href="/listening/trackers/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Tracker
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trackers
            </CardTitle>
            <Radio className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              of {mockTrackers.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mentions (24h)
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all trackers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Sentiment
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgSentiment * 100).toFixed(0)}%</div>
            <p className="text-xs text-green-600">
              Positive overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hashtags Tracked
            </CardTitle>
            <Hash className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTrackers.reduce((sum, t) => sum + t.query.hashtags.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique hashtags
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trackers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Trackers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrackers.map((tracker) => (
          <Card key={tracker.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tracker.name}
                    <Badge
                      variant={tracker.status === "active" ? "default" : "secondary"}
                      className={tracker.status === "active" ? "bg-green-500" : ""}
                    >
                      {tracker.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{tracker.client}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/listening/trackers/${tracker.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Tracker
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {tracker.status === "active" ? (
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Tracker
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Tracker
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platforms */}
              <div className="flex items-center gap-1">
                {tracker.platforms.map((platform) => (
                  <span
                    key={platform}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${platformColors[platform]}`}
                  >
                    {platformLabels[platform]}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mentions (24h)</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-semibold">
                      {tracker.stats.mentions24h.toLocaleString()}
                    </span>
                    {tracker.stats.mentionsChange > 0 ? (
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3" />
                        {tracker.stats.mentionsChange}%
                      </span>
                    ) : tracker.stats.mentionsChange < 0 ? (
                      <span className="text-xs text-red-600 flex items-center">
                        <TrendingDown className="h-3 w-3" />
                        {Math.abs(tracker.stats.mentionsChange)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Minus className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sentiment</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-semibold">
                      {(tracker.stats.sentiment * 100).toFixed(0)}%
                    </span>
                    {tracker.stats.sentimentChange > 0 ? (
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3" />
                      </span>
                    ) : tracker.stats.sentimentChange < 0 ? (
                      <span className="text-xs text-red-600 flex items-center">
                        <TrendingDown className="h-3 w-3" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Query Preview */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {tracker.query.hashtags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tracker.query.hashtags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tracker.query.hashtags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Updated {tracker.lastUpdated}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/listening/trackers/${tracker.id}`}>
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
