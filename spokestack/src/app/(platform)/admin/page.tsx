import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  Settings,
  Headphones,
  CreditCard,
  Palette,
  FileText,
  Clock,
  Palmtree,
  Target,
  ArrowRight,
  Layers,
} from "lucide-react";

// Module cards for quick navigation
const QUICK_MODULES = [
  {
    id: "superadmin",
    label: "Super Admin",
    description: "Platform management",
    icon: Shield,
    href: "/superadmin",
    color: "bg-red-500",
    badge: "Staff",
  },
  {
    id: "crm",
    label: "CRM",
    description: "Deals & contacts",
    icon: Handshake,
    href: "/admin/crm/companies",
    color: "bg-blue-500",
  },
  {
    id: "listening",
    label: "Listening",
    description: "Creators & content",
    icon: Headphones,
    href: "/listening",
    color: "bg-purple-500",
  },
  {
    id: "mediabuying",
    label: "Media Buying",
    description: "Ad campaigns",
    icon: CreditCard,
    href: "/mediabuying",
    color: "bg-green-500",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Reports & insights",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-orange-500",
  },
  {
    id: "briefs",
    label: "Briefs",
    description: "Work requests",
    icon: FileText,
    href: "/briefs",
    color: "bg-indigo-500",
  },
  {
    id: "time",
    label: "Time",
    description: "Track hours",
    icon: Clock,
    href: "/time",
    color: "bg-emerald-500",
  },
  {
    id: "leave",
    label: "Leave",
    description: "PTO & absences",
    icon: Palmtree,
    href: "/leave",
    color: "bg-teal-500",
  },
  {
    id: "team",
    label: "Team",
    description: "Directory",
    icon: Users,
    href: "/team",
    color: "bg-cyan-500",
  },
  {
    id: "rfp",
    label: "RFP",
    description: "Proposals",
    icon: Target,
    href: "/rfp",
    color: "bg-rose-500",
  },
  {
    id: "builder",
    label: "Builder",
    description: "Custom dashboards",
    icon: Palette,
    href: "/builder",
    color: "bg-pink-500",
  },
  {
    id: "instances",
    label: "Portals",
    description: "White-label",
    icon: Layers,
    href: "/admin/instances",
    color: "bg-slate-500",
  },
];

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SpokeStack. Select a module to get started.
        </p>
      </div>

      {/* Quick Module Navigation */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {QUICK_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.id} href={module.href}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {module.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                    {module.badge && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Overview</h2>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-blue-500" />
                Organizations
              </CardTitle>
              <CardDescription>
                Manage agencies, brands, and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/organizations"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View organizations <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-green-500" />
                Users & Roles
              </CardTitle>
              <CardDescription>
                Manage team members and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/users"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View users <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-5 w-5 text-slate-500" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure integrations and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/integrations"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View integrations <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
