import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Download,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock performance data
const PERFORMANCE_METRICS = [
  {
    label: "Total Reach",
    value: "2.4M",
    change: 12.5,
    positive: true,
    icon: Users,
  },
  {
    label: "Impressions",
    value: "8.7M",
    change: 8.3,
    positive: true,
    icon: Eye,
  },
  {
    label: "Engagement Rate",
    value: "4.2%",
    change: -0.3,
    positive: false,
    icon: Heart,
  },
  {
    label: "Total Interactions",
    value: "156K",
    change: 15.8,
    positive: true,
    icon: MessageCircle,
  },
];

const PLATFORM_BREAKDOWN = [
  { platform: "Instagram", reach: "1.2M", engagement: "5.1%", posts: 24 },
  { platform: "TikTok", reach: "680K", engagement: "6.8%", posts: 18 },
  { platform: "LinkedIn", reach: "320K", engagement: "2.4%", posts: 12 },
  { platform: "X (Twitter)", reach: "180K", engagement: "1.8%", posts: 36 },
  { platform: "Facebook", reach: "120K", engagement: "3.2%", posts: 15 },
];

const TOP_CONTENT = [
  {
    id: "1",
    title: "Brand Launch Video",
    platform: "Instagram",
    views: "245K",
    engagement: "8.2%",
    type: "Video",
  },
  {
    id: "2",
    title: "Product Feature Carousel",
    platform: "Instagram",
    views: "182K",
    engagement: "6.5%",
    type: "Carousel",
  },
  {
    id: "3",
    title: "Behind the Scenes Reel",
    platform: "TikTok",
    views: "156K",
    engagement: "9.1%",
    type: "Short Video",
  },
  {
    id: "4",
    title: "Industry Insights Article",
    platform: "LinkedIn",
    views: "89K",
    engagement: "4.3%",
    type: "Article",
  },
  {
    id: "5",
    title: "Customer Testimonial",
    platform: "Facebook",
    views: "67K",
    engagement: "5.7%",
    type: "Video",
  },
];

const AVAILABLE_REPORTS = [
  {
    id: "1",
    title: "Monthly Performance Report - December 2025",
    type: "Monthly",
    date: "Dec 28, 2025",
    status: "ready",
  },
  {
    id: "2",
    title: "Q4 2025 Campaign Summary",
    type: "Quarterly",
    date: "Dec 20, 2025",
    status: "ready",
  },
  {
    id: "3",
    title: "November 2025 Performance Report",
    type: "Monthly",
    date: "Nov 30, 2025",
    status: "ready",
  },
  {
    id: "4",
    title: "Instagram Growth Analysis",
    type: "Custom",
    date: "Nov 15, 2025",
    status: "ready",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track campaign performance and view detailed reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {PERFORMANCE_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <Badge
                    variant="secondary"
                    className={
                      metric.positive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }
                  >
                    {metric.positive ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Platform Performance
                </CardTitle>
                <CardDescription>
                  Reach and engagement by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PLATFORM_BREAKDOWN.map((platform) => (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{platform.platform}</p>
                        <p className="text-xs text-muted-foreground">
                          {platform.posts} posts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{platform.reach}</p>
                        <p className="text-xs text-muted-foreground">
                          {platform.engagement} engagement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Growth Trend
                </CardTitle>
                <CardDescription>
                  Monthly reach and engagement trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Interactive chart</p>
                    <p className="text-xs">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Your best performing posts across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TOP_CONTENT.map((content, index) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{content.platform}</Badge>
                          <Badge variant="secondary">{content.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{content.views} views</p>
                      <p className="text-xs text-green-600">
                        {content.engagement} engagement
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                Available Reports
              </CardTitle>
              <CardDescription>
                Download detailed performance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AVAILABLE_REPORTS.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{report.type}</Badge>
                          <span>{report.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
