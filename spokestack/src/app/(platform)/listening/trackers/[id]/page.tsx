"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Settings,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Play,
  BarChart3,
  Activity,
  Calendar,
} from "lucide-react";
import {
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiX,
} from "@icons-pack/react-simple-icons";

// Mock tracker data
const tracker = {
  id: "1",
  name: "CCAD Brand Mentions",
  client: "Culture & Creative Arts Dubai",
  status: "active",
  platforms: ["instagram", "tiktok", "youtube", "twitter"],
  query: {
    include: ["CCAD", "Culture Creative Arts Dubai", "@ccaborad"],
    exclude: ["jobs", "hiring"],
    hashtags: ["#DubaiCulture", "#UAEArts", "#CCAD"],
  },
  createdAt: "2024-12-01",
};

// Mock mentions feed
const mockMentions = [
  {
    id: "m1",
    platform: "instagram",
    author: {
      username: "dubaiblogger",
      displayName: "Dubai Lifestyle",
      avatar: null,
      followers: 125000,
      verified: true,
    },
    content: "Amazing exhibition at @ccaborad today! The new gallery is absolutely stunning. #DubaiCulture #CCAD #ArtDubai",
    sentiment: "positive",
    engagement: { likes: 2340, comments: 89, shares: 45 },
    timestamp: "2 hours ago",
    url: "#",
  },
  {
    id: "m2",
    platform: "tiktok",
    author: {
      username: "artlover_uae",
      displayName: "Art Lover UAE",
      avatar: null,
      followers: 45000,
      verified: false,
    },
    content: "POV: You discover CCAD for the first time 🎨 This place is insane! #DubaiCulture #UAEArts",
    sentiment: "positive",
    engagement: { likes: 15600, comments: 234, shares: 890 },
    timestamp: "4 hours ago",
    url: "#",
  },
  {
    id: "m3",
    platform: "twitter",
    author: {
      username: "culturecritique",
      displayName: "Culture Critique",
      avatar: null,
      followers: 8900,
      verified: false,
    },
    content: "The new CCAD exhibition lacks the depth we've come to expect. While visually impressive, the curation feels rushed. #CCAD #ArtCriticism",
    sentiment: "negative",
    engagement: { likes: 45, comments: 23, shares: 12 },
    timestamp: "5 hours ago",
    url: "#",
  },
  {
    id: "m4",
    platform: "youtube",
    author: {
      username: "TravelWithSarah",
      displayName: "Travel With Sarah",
      avatar: null,
      followers: 890000,
      verified: true,
    },
    content: "Dubai Vlog Day 3: Visiting Culture & Creative Arts Dubai - A Hidden Gem! Full tour inside...",
    sentiment: "positive",
    engagement: { likes: 12400, comments: 567, shares: 234 },
    timestamp: "1 day ago",
    url: "#",
  },
  {
    id: "m5",
    platform: "instagram",
    author: {
      username: "visitdubai",
      displayName: "Visit Dubai",
      avatar: null,
      followers: 2400000,
      verified: true,
    },
    content: "Experience the best of Dubai's art scene at @ccaborad. New exhibitions now open! #VisitDubai #DubaiCulture",
    sentiment: "positive",
    engagement: { likes: 34500, comments: 456, shares: 1200 },
    timestamp: "1 day ago",
    url: "#",
  },
];

// Mock stats
const stats = {
  mentions: { total: 1247, change: 12 },
  reach: { total: 4500000, change: 8 },
  engagement: { total: 89000, change: -3 },
  sentiment: { positive: 73, neutral: 19, negative: 8 },
  platforms: {
    instagram: 45,
    tiktok: 28,
    youtube: 15,
    twitter: 12,
  },
};

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <SiInstagram className="h-4 w-4" color="#E4405F" />,
  tiktok: <SiTiktok className="h-4 w-4" />,
  youtube: <SiYoutube className="h-4 w-4" color="#FF0000" />,
  twitter: <SiX className="h-4 w-4" />,
};

const sentimentColors = {
  positive: "text-green-600 bg-green-100",
  neutral: "text-gray-600 bg-gray-100",
  negative: "text-red-600 bg-red-100",
};

const sentimentIcons = {
  positive: <ThumbsUp className="h-3 w-3" />,
  neutral: <Minus className="h-3 w-3" />,
  negative: <ThumbsDown className="h-3 w-3" />,
};

export default function TrackerDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [platformFilter, setPlatformFilter] = useState("all");

  const filteredMentions = mockMentions.filter(
    (m) => platformFilter === "all" || m.platform === platformFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/listening/trackers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{tracker.name}</h1>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <p className="text-muted-foreground">{tracker.client}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mentions
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.mentions.total.toLocaleString()}</span>
              <span className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.mentions.change}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {(stats.reach.total / 1000000).toFixed(1)}M
              </span>
              <span className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.reach.change}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Potential impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {(stats.engagement.total / 1000).toFixed(0)}K
              </span>
              <span className="text-sm text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {Math.abs(stats.engagement.change)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Likes, comments, shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sentiment Score
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats.sentiment.positive}%
              </span>
              <span className="text-sm text-muted-foreground">positive</span>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${stats.sentiment.positive}%` }} />
              <div className="h-2 rounded-full bg-gray-300" style={{ width: `${stats.sentiment.neutral}%` }} />
              <div className="h-2 rounded-full bg-red-500" style={{ width: `${stats.sentiment.negative}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mentions Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mentions Feed</CardTitle>
                  <CardDescription>Real-time brand mentions across platforms</CardDescription>
                </div>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">X (Twitter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredMentions.map((mention) => (
                <div key={mention.id} className="p-4 rounded-lg border space-y-3">
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mention.author.avatar || undefined} />
                        <AvatarFallback>
                          {mention.author.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mention.author.displayName}</span>
                          {mention.author.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{mention.author.username}</span>
                          <span>•</span>
                          <span>{(mention.author.followers / 1000).toFixed(0)}K followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-muted">
                        {platformIcons[mention.platform]}
                      </div>
                      <Badge className={sentimentColors[mention.sentiment as keyof typeof sentimentColors]}>
                        {sentimentIcons[mention.sentiment as keyof typeof sentimentIcons]}
                        <span className="ml-1 capitalize">{mention.sentiment}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm">{mention.content}</p>

                  {/* Engagement & Time */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {mention.engagement.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {mention.engagement.comments.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {mention.engagement.shares.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{mention.timestamp}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={mention.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.platforms).map(([platform, percentage]) => (
                <div key={platform} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {platformIcons[platform]}
                      <span className="capitalize">{platform}</span>
                    </div>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Query Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tracking Query</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {tracker.query.include.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {tracker.query.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {tracker.query.exclude.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Excluded</p>
                  <div className="flex flex-wrap gap-1">
                    {tracker.query.exclude.map((keyword) => (
                      <Badge key={keyword} variant="destructive" className="text-xs">
                        -{keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trending Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["#DubaiCulture", "#UAEArts", "#CCAD", "#ArtDubai", "#VisitDubai"].map((tag, i) => (
                  <div key={tag} className="flex items-center justify-between text-sm">
                    <span>{tag}</span>
                    <span className="text-muted-foreground">{Math.floor(Math.random() * 500 + 100)}</span>
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
