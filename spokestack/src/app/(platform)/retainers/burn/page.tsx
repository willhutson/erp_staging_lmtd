import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Demo retainer burn data
const RETAINER_BURN = [
  {
    id: "1",
    client: "CCAD",
    monthlyHours: 120,
    usedHours: 95,
    burnRate: 79,
    trend: "up",
    daysRemaining: 12,
    status: "healthy",
    projectedOverage: null,
  },
  {
    id: "2",
    client: "DET",
    monthlyHours: 80,
    usedHours: 72,
    burnRate: 90,
    trend: "up",
    daysRemaining: 12,
    status: "warning",
    projectedOverage: 15,
  },
  {
    id: "3",
    client: "ADEK",
    monthlyHours: 100,
    usedHours: 45,
    burnRate: 45,
    trend: "down",
    daysRemaining: 12,
    status: "healthy",
    projectedOverage: null,
  },
  {
    id: "4",
    client: "ECD",
    monthlyHours: 60,
    usedHours: 68,
    burnRate: 113,
    trend: "up",
    daysRemaining: 12,
    status: "critical",
    projectedOverage: 25,
  },
];

const statusConfig = {
  healthy: {
    label: "On Track",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  warning: {
    label: "At Risk",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: AlertTriangle,
  },
  critical: {
    label: "Over Budget",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: Flame,
  },
};

function getBurnColor(burnRate: number) {
  if (burnRate <= 75) return "bg-emerald-500";
  if (burnRate <= 90) return "bg-amber-500";
  return "bg-red-500";
}

export default function RetainerBurnPage() {
  const healthyCount = RETAINER_BURN.filter(r => r.status === "healthy").length;
  const atRiskCount = RETAINER_BURN.filter(r => r.status === "warning" || r.status === "critical").length;
  const totalOverage = RETAINER_BURN.reduce((sum, r) => sum + (r.projectedOverage || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Retainer Burn Rate
          </h1>
          <p className="text-muted-foreground">Monitor client retainer usage and projected overages</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/retainers">
            View All Retainers
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{RETAINER_BURN.length}</div>
            <p className="text-sm text-muted-foreground">Active Retainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-600">{healthyCount}</div>
            <p className="text-sm text-muted-foreground">On Track</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{atRiskCount}</div>
            <p className="text-sm text-muted-foreground">Need Attention</p>
          </CardContent>
        </Card>
        <Card className={totalOverage > 0 ? "border-red-200 dark:border-red-900" : ""}>
          <CardContent className="pt-6">
            <div className={`text-3xl font-bold ${totalOverage > 0 ? "text-red-600" : "text-muted-foreground"}`}>
              {totalOverage > 0 ? `+${totalOverage}h` : "0h"}
            </div>
            <p className="text-sm text-muted-foreground">Projected Overage</p>
          </CardContent>
        </Card>
      </div>

      {/* Retainer Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {RETAINER_BURN.map((retainer) => {
          const status = statusConfig[retainer.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          const remainingHours = retainer.monthlyHours - retainer.usedHours;

          return (
            <Card key={retainer.id} className={retainer.status === "critical" ? "border-red-200 dark:border-red-900" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{retainer.client}</CardTitle>
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span>{retainer.monthlyHours}h / month</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {retainer.daysRemaining} days left
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Burn gauge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hours Used</span>
                    <span className="font-medium flex items-center gap-1">
                      {retainer.usedHours}h / {retainer.monthlyHours}h
                      {retainer.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-emerald-500" />
                      )}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${getBurnColor(retainer.burnRate)}`}
                      style={{ width: `${Math.min(retainer.burnRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{retainer.burnRate}% burned</span>
                    <span className={remainingHours < 0 ? "text-red-500 font-medium" : ""}>
                      {remainingHours >= 0 ? `${remainingHours}h remaining` : `${Math.abs(remainingHours)}h over`}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                {retainer.projectedOverage && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Projected {retainer.projectedOverage}h overage by month end
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
