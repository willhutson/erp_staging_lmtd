import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Sparkles,
  Bell,
  Timer,
  Target,
  Repeat,
  MessageSquare,
} from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

// Mock data - in production, this would come from server actions
const mockUser = {
  name: "Will",
  role: "leadership", // "am" | "creative" | "leadership" | "team_lead"
};

const mockFocusItems = [
  { id: "1", title: "ADEK Monthly Report", type: "overdue" as const, dueDate: "2 days ago", client: "ADEK", briefType: "Report" },
  { id: "2", title: "DET Ramadan Campaign Video", type: "due_today" as const, dueDate: "Today, 5pm", client: "DET", briefType: "Video Edit" },
  { id: "3", title: "CCAD Social Calendar Review", type: "due_today" as const, dueDate: "Today, EOD", client: "CCAD", briefType: "Review" },
  { id: "4", title: "ECD Brand Guidelines Update", type: "upcoming" as const, dueDate: "Tomorrow", client: "ECD", briefType: "Design" },
];

const mockStats = {
  briefs: { active: 12, completed: 45, thisWeek: 8 },
  time: { loggedToday: "4h 32m", weekTotal: "28h", target: "40h" },
  retainers: { atRisk: 2, healthy: 6 },
  team: { available: 38, onLeave: 4, overCapacity: 3 },
};

const mockNotifications = [
  { id: "1", message: "Sarah completed ADEK Video Edit", time: "2 min ago", type: "complete" },
  { id: "2", message: "New brief assigned: CCAD Social Post", time: "15 min ago", type: "assignment" },
  { id: "3", message: "DET retainer at 85% burn", time: "1 hour ago", type: "warning" },
];

// Quick actions based on role
const quickActions = {
  am: [
    { label: "New Brief", href: "/briefs/new", icon: FileText },
    { label: "View My Briefs", href: "/briefs/briefed-by-me", icon: FileText },
    { label: "Client Calendar", href: "/studio/calendar", icon: Calendar },
  ],
  creative: [
    { label: "My Assignments", href: "/briefs/my", icon: FileText },
    { label: "Start Timer", href: "/time", icon: Timer },
    { label: "Moodboard", href: "/studio/moodboard", icon: Sparkles },
  ],
  leadership: [
    { label: "Team Capacity", href: "/resources", icon: Users },
    { label: "Retainer Health", href: "/retainers", icon: Repeat },
    { label: "Pipeline", href: "/crm", icon: Target },
  ],
  team_lead: [
    { label: "Team Assignments", href: "/briefs/pending", icon: FileText },
    { label: "Approve Time", href: "/time/approvals", icon: Clock },
    { label: "Department View", href: "/resources", icon: Users },
  ],
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFocusMessage(items: typeof mockFocusItems): string {
  const overdue = items.filter(i => i.type === "overdue").length;
  const dueToday = items.filter(i => i.type === "due_today").length;

  if (overdue > 0 && dueToday > 0) {
    return `You have ${overdue} overdue item${overdue > 1 ? "s" : ""} and ${dueToday} due today.`;
  } else if (overdue > 0) {
    return `You have ${overdue} overdue item${overdue > 1 ? "s" : ""} that need${overdue === 1 ? "s" : ""} attention.`;
  } else if (dueToday > 0) {
    return `You have ${dueToday} item${dueToday > 1 ? "s" : ""} due today.`;
  }
  return "You're all caught up! No urgent items.";
}

function FocusItemBadge({ type }: { type: "overdue" | "due_today" | "upcoming" | "needs_attention" }) {
  const styles = {
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    due_today: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    needs_attention: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  const labels = {
    overdue: "Overdue",
    due_today: "Due Today",
    upcoming: "Upcoming",
    needs_attention: "Needs Attention",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function HubPage() {
  const greeting = getTimeGreeting();
  const focusMessage = getFocusMessage(mockFocusItems);
  const roleActions = quickActions[mockUser.role as keyof typeof quickActions] || quickActions.am;
  const overdueCount = mockFocusItems.filter(i => i.type === "overdue").length;
  const dueTodayCount = mockFocusItems.filter(i => i.type === "due_today").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Greeting Section */}
      <div className="ai-greeting">
        <div className="ai-avatar">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="ai-message">
          <p className="ai-message-header">
            {greeting}, {mockUser.name}
          </p>
          <p className="ai-message-content">{focusMessage}</p>
          <div className="ai-suggestions mt-3">
            {overdueCount > 0 && (
              <Link href="/briefs?filter=overdue" className="ai-suggestion-chip">
                Show overdue ({overdueCount})
              </Link>
            )}
            {dueTodayCount > 0 && (
              <Link href="/briefs?filter=due_today" className="ai-suggestion-chip">
                Today's deadlines ({dueTodayCount})
              </Link>
            )}
            <Link href="/briefs" className="ai-suggestion-chip">
              View all briefs
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 stagger-children">
        <Card className="interactive-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Active Briefs</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{mockStats.briefs.active}</span>
              <span className="text-sm text-emerald-500">+{mockStats.briefs.thisWeek} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="interactive-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Time Today</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{mockStats.time.loggedToday}</span>
              <span className="text-sm text-muted-foreground">/ {mockStats.time.target}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="interactive-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Repeat className="h-4 w-4" />
              <span className="text-sm">Retainers</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-500">{mockStats.retainers.healthy}</span>
              <span className="text-sm text-muted-foreground">healthy</span>
              {mockStats.retainers.atRisk > 0 && (
                <Badge variant="destructive" className="ml-2">{mockStats.retainers.atRisk} at risk</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="interactive-lift">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Team</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{mockStats.team.available}</span>
              <span className="text-sm text-muted-foreground">available</span>
              {mockStats.team.onLeave > 0 && (
                <span className="text-sm text-amber-500 ml-2">{mockStats.team.onLeave} on leave</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Focus Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Focus Items</h2>
            <Link href="/briefs" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3 stagger-children">
            {mockFocusItems.map((item) => (
              <Card key={item.id} className="interactive-lift">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.type === "overdue" ? "bg-red-100 dark:bg-red-900/30" :
                        item.type === "due_today" ? "bg-amber-100 dark:bg-amber-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        {item.type === "overdue" ? (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : item.type === "due_today" ? (
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{item.client}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{item.briefType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <FocusItemBadge type={item.type} />
                      <p className="text-xs text-muted-foreground mt-1">{item.dueDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {roleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.href} variant="outline" className="justify-start" asChild>
                    <Link href={action.href}>
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockNotifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${
                    notif.type === "complete" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                    notif.type === "warning" ? "bg-amber-100 dark:bg-amber-900/30" :
                    "bg-blue-100 dark:bg-blue-900/30"
                  }`}>
                    {notif.type === "complete" ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    ) : notif.type === "warning" ? (
                      <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Chat Shortcut */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">SpokeChat</p>
                  <p className="text-sm text-muted-foreground">3 unread messages</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/chat">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
