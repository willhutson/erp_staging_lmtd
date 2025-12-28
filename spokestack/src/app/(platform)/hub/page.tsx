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
  Building2,
  Briefcase,
  Layers,
} from "lucide-react";

// Main sections for quick access
const MAIN_SECTIONS = [
  {
    id: "admin",
    label: "Admin",
    description: "Organization settings, users, roles, CRM, and integrations",
    icon: Settings,
    href: "/admin",
    color: "from-slate-500 to-slate-600",
    features: ["Users & Roles", "CRM", "Integrations", "Portal Settings"],
  },
  {
    id: "erp",
    label: "ERP",
    description: "Briefs, time tracking, leave management, and team operations",
    icon: Briefcase,
    href: "/briefs",
    color: "from-indigo-500 to-indigo-600",
    features: ["Briefs", "Time Tracking", "Leave", "Team Directory", "RFP"],
  },
  {
    id: "superadmin",
    label: "Super Admin",
    description: "Platform-wide management for SpokeStack staff only",
    icon: Shield,
    href: "/superadmin",
    color: "from-red-500 to-red-600",
    badge: "Staff Only",
    features: ["Organizations", "Instances", "Domains"],
  },
];

// All modules for detailed navigation
const ALL_MODULES = [
  {
    category: "Admin & CRM",
    items: [
      { id: "admin", label: "Admin Dashboard", icon: Settings, href: "/admin", color: "bg-slate-500" },
      { id: "crm", label: "CRM", icon: Handshake, href: "/admin/crm", color: "bg-blue-500" },
      { id: "organizations", label: "Organizations", icon: Building2, href: "/admin/organizations", color: "bg-gray-500" },
      { id: "users", label: "Users", icon: Users, href: "/admin/users", color: "bg-green-500" },
    ],
  },
  {
    category: "ERP Modules",
    items: [
      { id: "briefs", label: "Briefs", icon: FileText, href: "/briefs", color: "bg-indigo-500" },
      { id: "time", label: "Time Tracking", icon: Clock, href: "/time", color: "bg-emerald-500" },
      { id: "leave", label: "Leave", icon: Palmtree, href: "/leave", color: "bg-teal-500" },
      { id: "team", label: "Team", icon: Users, href: "/team", color: "bg-cyan-500" },
      { id: "rfp", label: "RFP", icon: Target, href: "/rfp", color: "bg-rose-500" },
    ],
  },
  {
    category: "Marketing & Analytics",
    items: [
      { id: "listening", label: "Social Listening", icon: Headphones, href: "/listening", color: "bg-purple-500" },
      { id: "mediabuying", label: "Media Buying", icon: CreditCard, href: "/mediabuying", color: "bg-green-500" },
      { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics", color: "bg-orange-500" },
    ],
  },
  {
    category: "Tools",
    items: [
      { id: "builder", label: "Dashboard Builder", icon: Palette, href: "/builder", color: "bg-pink-500" },
      { id: "instances", label: "Client Portals", icon: Layers, href: "/admin/instances", color: "bg-violet-500" },
    ],
  },
];

export default function HubPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold tracking-tight">SpokeStack</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select a section to get started
        </p>
      </div>

      {/* Main Section Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {MAIN_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {section.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2 mt-3">
                    {section.label}
                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {section.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs font-normal">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6">All Modules</h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {ALL_MODULES.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((module) => {
                  const Icon = module.icon;
                  return (
                    <Link key={module.id} href={module.href}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group">
                        <div className={`p-1.5 rounded-md ${module.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {module.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
