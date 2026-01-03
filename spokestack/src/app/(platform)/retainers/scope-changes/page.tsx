import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Demo scope change requests
const SCOPE_CHANGES = [
  {
    id: "1",
    title: "Additional video deliverable for Ramadan",
    client: "CCAD",
    retainer: "CCAD Monthly Retainer",
    requestedBy: "Sarah Al-Mahmoud",
    requestDate: "Jan 2, 2025",
    status: "pending",
    hoursImpact: 15,
    revenueImpact: 2250,
    priority: "high",
  },
  {
    id: "2",
    title: "Expand social coverage to TikTok",
    client: "DET",
    retainer: "DET Q1 Retainer",
    requestedBy: "Mohammed Khalil",
    requestDate: "Dec 28, 2024",
    status: "approved",
    hoursImpact: 20,
    revenueImpact: 3000,
    priority: "medium",
  },
  {
    id: "3",
    title: "Rush deadline for press release",
    client: "ADEK",
    retainer: "ADEK Annual Retainer",
    requestedBy: "Fatima Hassan",
    requestDate: "Jan 3, 2025",
    status: "pending",
    hoursImpact: 5,
    revenueImpact: 750,
    priority: "urgent",
  },
  {
    id: "4",
    title: "Remove newsletter from scope",
    client: "ECD",
    retainer: "ECD Quarterly",
    requestedBy: "James Wilson",
    requestDate: "Dec 20, 2024",
    status: "declined",
    hoursImpact: -10,
    revenueImpact: -1500,
    priority: "low",
  },
];

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

const priorityConfig = {
  urgent: { label: "Urgent", color: "bg-red-500 text-white" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  low: { label: "Low", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

export default function ScopeChangesPage() {
  const pendingCount = SCOPE_CHANGES.filter(s => s.status === "pending").length;
  const totalPendingHours = SCOPE_CHANGES.filter(s => s.status === "pending").reduce((sum, s) => sum + s.hoursImpact, 0);
  const totalPendingRevenue = SCOPE_CHANGES.filter(s => s.status === "pending").reduce((sum, s) => sum + s.revenueImpact, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Scope Changes
          </h1>
          <p className="text-muted-foreground">Track and manage retainer scope change requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{SCOPE_CHANGES.length}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{totalPendingHours > 0 ? "+" : ""}{totalPendingHours}h</div>
            <p className="text-sm text-muted-foreground">Hours Impact (Pending)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-600">
              ${totalPendingRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Revenue Impact (Pending)</p>
          </CardContent>
        </Card>
      </div>

      {/* Scope Change List */}
      <Card>
        <CardHeader>
          <CardTitle>Change Requests</CardTitle>
          <CardDescription>Review and approve scope modifications to active retainers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SCOPE_CHANGES.map((change) => {
              const status = statusConfig[change.status as keyof typeof statusConfig];
              const priority = priorityConfig[change.priority as keyof typeof priorityConfig];
              const StatusIcon = status.icon;

              return (
                <div
                  key={change.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${change.hoursImpact > 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      <GitBranch className={`h-5 w-5 ${change.hoursImpact > 0 ? "text-emerald-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{change.title}</p>
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{change.client}</span>
                        <span>•</span>
                        <span>{change.retainer}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested by {change.requestedBy} on {change.requestDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-medium ${change.hoursImpact > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {change.hoursImpact > 0 ? "+" : ""}{change.hoursImpact}h
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3" />
                        {change.revenueImpact > 0 ? "+" : ""}{change.revenueImpact.toLocaleString()}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                    {change.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
