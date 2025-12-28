import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  Handshake,
  Megaphone,
  Sparkles,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";

// Stats card component
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend && (
            <span
              className={`mr-1 flex items-center ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 mr-0.5 ${
                  !trend.positive && "rotate-180"
                }`}
              />
              {trend.value}%
            </span>
          )}
          {description}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

async function DashboardStats() {
  // In a real app, fetch these from the database
  const stats = [
    {
      title: "Organizations",
      value: "12",
      description: "Active agencies & brands",
      icon: Building2,
      trend: { value: 8, positive: true },
    },
    {
      title: "Team Members",
      value: "48",
      description: "Across all organizations",
      icon: Users,
      trend: { value: 12, positive: true },
    },
    {
      title: "Active Deals",
      value: "24",
      description: "In pipeline",
      icon: Handshake,
      trend: { value: 5, positive: true },
    },
    {
      title: "Campaigns",
      value: "18",
      description: "Currently running",
      icon: Megaphone,
      trend: { value: 3, positive: false },
    },
    {
      title: "Creators",
      value: "156",
      description: "Signed & active",
      icon: Sparkles,
      trend: { value: 15, positive: true },
    },
    {
      title: "Ad Spend",
      value: "$284K",
      description: "This month",
      icon: DollarSign,
      trend: { value: 22, positive: true },
    },
    {
      title: "ROAS",
      value: "4.2x",
      description: "Average return",
      icon: BarChart3,
      trend: { value: 8, positive: true },
    },
    {
      title: "Engagement",
      value: "3.8%",
      description: "Creator average",
      icon: TrendingUp,
      trend: { value: 0.5, positive: true },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SpokeStack. Here&apos;s an overview of your platform.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Organizations
            </CardTitle>
            <CardDescription>
              Manage agencies, brands, and their hierarchies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/Admin/organizations"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              View organizations →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              CRM
            </CardTitle>
            <CardDescription>
              Companies, contacts, deals, and pipeline management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/Admin/crm/deals"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              View deals →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Creators
            </CardTitle>
            <CardDescription>
              Manage influencers, content, and campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/Listening/creators"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              View creators →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
