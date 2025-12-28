import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Settings,
  Handshake,
  Headphones,
  CreditCard,
  BarChart3,
  Palette,
  FileText,
  Clock,
  Palmtree,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";

const MODULE_CATEGORIES = [
  {
    title: "Platform",
    description: "System administration and configuration",
    modules: [
      {
        id: "superadmin",
        label: "Super Admin",
        description: "Platform-wide management for SpokeStack staff",
        icon: Shield,
        href: "/superadmin",
        color: "bg-red-500",
        badge: "Staff Only",
      },
      {
        id: "admin",
        label: "Admin",
        description: "Organization settings, users, and roles",
        icon: Settings,
        href: "/admin",
        color: "bg-slate-500",
      },
    ],
  },
  {
    title: "Marketing & Sales",
    description: "Client relationships and campaign management",
    modules: [
      {
        id: "crm",
        label: "CRM",
        description: "Companies, contacts, and deals",
        icon: Handshake,
        href: "/admin/crm/companies",
        color: "bg-blue-500",
      },
      {
        id: "listening",
        label: "Social Listening",
        description: "Creator and content tracking",
        icon: Headphones,
        href: "/listening",
        color: "bg-purple-500",
      },
      {
        id: "mediabuying",
        label: "Media Buying",
        description: "Ad accounts and campaign budgets",
        icon: CreditCard,
        href: "/mediabuying",
        color: "bg-green-500",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "Performance dashboards and reports",
        icon: BarChart3,
        href: "/analytics",
        color: "bg-orange-500",
      },
    ],
  },
  {
    title: "ERP Modules",
    description: "Operations and workforce management",
    modules: [
      {
        id: "briefs",
        label: "Briefs",
        description: "Project briefs and creative requests",
        icon: FileText,
        href: "/briefs",
        color: "bg-indigo-500",
      },
      {
        id: "time",
        label: "Time Tracking",
        description: "Timesheets, timer, and approvals",
        icon: Clock,
        href: "/time",
        color: "bg-emerald-500",
      },
      {
        id: "leave",
        label: "Leave Management",
        description: "PTO requests and balances",
        icon: Palmtree,
        href: "/leave",
        color: "bg-teal-500",
      },
      {
        id: "team",
        label: "Team Directory",
        description: "Team members and org structure",
        icon: Users,
        href: "/team",
        color: "bg-cyan-500",
      },
      {
        id: "rfp",
        label: "RFP Pipeline",
        description: "Proposal tracking and management",
        icon: Target,
        href: "/rfp",
        color: "bg-rose-500",
      },
    ],
  },
  {
    title: "Tools",
    description: "Customization and configuration",
    modules: [
      {
        id: "builder",
        label: "Dashboard Builder",
        description: "Custom dashboards and widgets",
        icon: Palette,
        href: "/builder",
        color: "bg-pink-500",
      },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to SpokeStack</h1>
        <p className="text-muted-foreground mt-1">
          Select a module to get started
        </p>
      </div>

      {MODULE_CATEGORIES.map((category) => (
        <div key={category.title} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.href}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${module.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {module.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {module.label}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
