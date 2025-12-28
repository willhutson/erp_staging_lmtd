import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  FolderOpen,
  BarChart3,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";

// Mock data for client portal
const PENDING_APPROVALS = [
  {
    id: "1",
    title: "Q1 Social Media Campaign Assets",
    type: "Design",
    dueDate: "Dec 30, 2025",
    status: "pending",
  },
  {
    id: "2",
    title: "Brand Video - 60s Cut",
    type: "Video",
    dueDate: "Dec 31, 2025",
    status: "pending",
  },
  {
    id: "3",
    title: "Website Copy - Homepage",
    type: "Copy",
    dueDate: "Jan 2, 2026",
    status: "revision",
  },
];

const RECENT_DELIVERABLES = [
  {
    id: "1",
    title: "Instagram Story Templates",
    type: "Design",
    date: "Dec 26, 2025",
    status: "approved",
  },
  {
    id: "2",
    title: "LinkedIn Article - Industry Trends",
    type: "Copy",
    date: "Dec 24, 2025",
    status: "approved",
  },
  {
    id: "3",
    title: "Product Launch Video",
    type: "Video",
    date: "Dec 22, 2025",
    status: "approved",
  },
];

const PROJECT_STATS = {
  activeProjects: 4,
  pendingApprovals: 3,
  completedThisMonth: 12,
  overallProgress: 68,
};

export default function PortalPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your projects and deliverables.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{PROJECT_STATS.activeProjects}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{PROJECT_STATS.pendingApprovals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{PROJECT_STATS.completedThisMonth}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{PROJECT_STATS.overallProgress}%</span>
              </div>
              <Progress value={PROJECT_STATS.overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Items waiting for your review</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/portal/approvals">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PENDING_APPROVALS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {item.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "revision" && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Revision
                      </Badge>
                    )}
                    <Button size="sm">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliverables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  Recent Deliverables
                </CardTitle>
                <CardDescription>Recently completed and approved work</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/portal/deliverables">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_DELIVERABLES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href="/portal/approvals">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <FileCheck className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Review & Approve</h3>
                  <p className="text-sm text-muted-foreground">
                    Review pending deliverables
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href="/portal/reports">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Reports & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View campaign performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href="/portal/deliverables">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <FolderOpen className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">All Deliverables</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all project assets
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
