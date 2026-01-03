import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Demo data for briefs created by the current user (AM perspective)
const BRIEFED_BY_ME = [
  {
    id: "1",
    title: "CCAD Ramadan Campaign - Hero Video",
    type: "VIDEO_SHOOT",
    client: "CCAD",
    status: "in_progress",
    assignee: "Ted Vicencio",
    createdAt: "2 days ago",
    dueDate: "Jan 15, 2025",
  },
  {
    id: "2",
    title: "DET Annual Report Design",
    type: "DESIGN",
    client: "DET",
    status: "pending",
    assignee: "Unassigned",
    createdAt: "1 day ago",
    dueDate: "Jan 20, 2025",
  },
  {
    id: "3",
    title: "ADEK Social Media Copy - January",
    type: "COPYWRITING_EN",
    client: "ADEK",
    status: "completed",
    assignee: "Salma Hassan",
    createdAt: "1 week ago",
    dueDate: "Jan 5, 2025",
  },
  {
    id: "4",
    title: "ECD Product Launch Video Edit",
    type: "VIDEO_EDIT",
    client: "ECD",
    status: "review",
    assignee: "Matthew Reynolds",
    createdAt: "3 days ago",
    dueDate: "Jan 12, 2025",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  review: { label: "In Review", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
};

const typeLabels: Record<string, string> = {
  VIDEO_SHOOT: "Video Shoot",
  VIDEO_EDIT: "Video Edit",
  DESIGN: "Design",
  COPYWRITING_EN: "Copy (EN)",
  COPYWRITING_AR: "Copy (AR)",
  PAID_MEDIA: "Paid Media",
};

export default function BriefedByMePage() {
  const pendingCount = BRIEFED_BY_ME.filter(b => b.status === "pending").length;
  const inProgressCount = BRIEFED_BY_ME.filter(b => b.status === "in_progress" || b.status === "review").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Briefed by Me</h1>
          <p className="text-muted-foreground">Briefs you've created and submitted for the team</p>
        </div>
        <Button asChild>
          <Link href="/briefs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Brief
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{BRIEFED_BY_ME.length}</div>
            <p className="text-sm text-muted-foreground">Total Briefs Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Awaiting Assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Brief List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Submitted Briefs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {BRIEFED_BY_ME.map((brief) => {
              const status = statusConfig[brief.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              return (
                <Link
                  key={brief.id}
                  href={`/briefs/${brief.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {brief.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{brief.client}</span>
                        <span>•</span>
                        <span>{typeLabels[brief.type]}</span>
                        <span>•</span>
                        <span>Due {brief.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">{brief.assignee}</p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
