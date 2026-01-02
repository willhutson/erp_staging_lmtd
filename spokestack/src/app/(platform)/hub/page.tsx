import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Settings,
  Headphones,
  CreditCard,
  BarChart3,
  Palette,
  FileText,
  Clock,
  Palmtree,
  Users,
  ArrowRight,
  Building2,
  Briefcase,
  Layers,
  FolderKanban,
  Repeat,
  Handshake,
  Target,
  Radio,
  Sparkles,
  Grid3X3,
  Megaphone,
  Calendar,
  Globe,
  UserCircle,
  Plug,
  MessageSquare,
  FileCheck,
  Eye,
  GitBranch,
  Kanban,
  LayoutTemplate,
  Video,
  Presentation,
  ImageIcon,
  ClipboardList,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";

// Admin sections (left side)
const ADMIN_SECTIONS = [
  {
    id: "admin",
    label: "Admin",
    description: "Organization settings, users, roles, and integrations",
    icon: Settings,
    href: "/admin",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-500",
    modules: [
      { label: "Dashboard", href: "/admin", icon: Settings },
      { label: "Organizations", href: "/admin/organizations", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/roles", icon: UserCircle },
      { label: "Client Portals", href: "/admin/instances", icon: Layers },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
    ],
  },
  {
    id: "superadmin",
    label: "Super Admin",
    description: "Platform-wide management for SpokeStack staff",
    icon: Shield,
    href: "/superadmin",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500",
    badge: "Staff Only",
    modules: [
      { label: "Dashboard", href: "/superadmin", icon: Shield },
      { label: "Organizations", href: "/superadmin/organizations", icon: Building2 },
      { label: "Instances", href: "/superadmin/instances", icon: Layers },
      { label: "Domains", href: "/superadmin/domains", icon: Globe },
    ],
  },
];

// Module bundles (right side)
const MODULE_BUNDLES = [
  {
    id: "erp",
    label: "ERP",
    tagline: "Core Operations",
    description: "Briefs, time tracking, leave management, team, and communication",
    icon: Briefcase,
    href: "/briefs",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500",
    modules: [
      { label: "Briefs", href: "/briefs", icon: FileText, description: "Work requests & briefs" },
      { label: "Time Tracking", href: "/time", icon: Clock, description: "Timer & timesheets" },
      { label: "Leave", href: "/leave", icon: Palmtree, description: "PTO & approvals" },
      { label: "Team", href: "/team", icon: Users, description: "Directory & org chart" },
      { label: "SpokeChat", href: "/chat", icon: MessageSquare, description: "Team communication" },
    ],
  },
  {
    id: "agency",
    label: "Agency",
    tagline: "Client Services",
    description: "Clients, retainers, projects, resources, CRM, and RFP pipeline",
    icon: Building2,
    href: "/clients",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500",
    modules: [
      { label: "Clients", href: "/clients", icon: Building2, description: "Client accounts" },
      { label: "Retainers", href: "/retainers", icon: Repeat, description: "Recurring contracts" },
      { label: "Projects", href: "/projects", icon: FolderKanban, description: "Project management" },
      { label: "Resources", href: "/resources", icon: Calendar, description: "Capacity planning" },
      { label: "CRM", href: "/crm", icon: Handshake, description: "Lead management" },
      { label: "RFP Pipeline", href: "/rfp", icon: Target, description: "New business" },
    ],
  },
  {
    id: "forms",
    label: "Forms",
    tagline: "Surveys, Polls & More",
    description: "Create surveys, polls, quizzes, and forms with AI-powered builder",
    icon: ClipboardList,
    href: "/surveys",
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-500",
    modules: [
      { label: "All Forms", href: "/surveys", icon: ClipboardList, description: "Surveys & responses" },
      { label: "Templates", href: "/surveys/templates", icon: LayoutTemplate, description: "Reusable templates" },
      { label: "Form Builder", href: "/surveys/builder", icon: Sparkles, description: "AI-powered builder" },
      { label: "NPS", href: "/feedback/nps", icon: BarChart3, description: "Net Promoter Score" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    tagline: "Digital Tools",
    description: "Social listening, media buying, analytics, and dashboard builder",
    icon: Megaphone,
    href: "/listening",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500",
    modules: [
      { label: "Listening", href: "/listening", icon: Headphones, description: "Brand monitoring" },
      { label: "Trackers", href: "/listening/trackers", icon: Radio, description: "Mention tracking" },
      { label: "Media Buying", href: "/mediabuying", icon: CreditCard, description: "Ad campaigns" },
      { label: "Analytics", href: "/analytics", icon: BarChart3, description: "Performance data" },
      { label: "Builder", href: "/builder", icon: Palette, description: "Custom dashboards" },
    ],
  },
  {
    id: "portal",
    label: "Client",
    tagline: "Clients Only",
    description: "Client-facing portal for approvals, deliverables, and reports",
    icon: Eye,
    href: "/portal",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500",
    badge: true,
    modules: [
      { label: "Dashboard", href: "/portal", icon: Grid3X3, description: "Overview & stats" },
      { label: "Approvals", href: "/portal/approvals", icon: FileCheck, description: "Review deliverables" },
      { label: "Deliverables", href: "/portal/deliverables", icon: FolderKanban, description: "All project assets" },
      { label: "Reports", href: "/portal/reports", icon: BarChart3, description: "Campaign analytics" },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    tagline: "AI Creative",
    description: "AI-powered creative workspace with docs, decks, video, and moodboards",
    icon: Sparkles,
    href: "/studio",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-500",
    modules: [
      { label: "Documents", href: "/studio/docs", icon: FileText, description: "Rich text with AI" },
      { label: "Pitch Decks", href: "/studio/decks", icon: Presentation, description: "AI presentations" },
      { label: "Video Studio", href: "/studio/video", icon: Video, description: "Scripts & storyboards" },
      { label: "Moodboards", href: "/studio/moodboard", icon: ImageIcon, description: "Visual inspiration" },
      { label: "Calendar", href: "/studio/calendar", icon: Calendar, description: "Content scheduling" },
      { label: "AI Skills", href: "/studio/skills", icon: Palette, description: "Custom AI assistants" },
    ],
  },
  {
    id: "workflows",
    label: "Workflows",
    tagline: "Process Automation",
    description: "Monday.com-style boards for team processes and automation",
    icon: GitBranch,
    href: "/workflows",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500",
    modules: [
      { label: "Boards", href: "/workflows", icon: Kanban, description: "Workflow boards" },
      { label: "My Workflows", href: "/workflows/my", icon: FolderKanban, description: "Your assigned tasks" },
      { label: "Templates", href: "/workflows/templates", icon: LayoutTemplate, description: "Pre-built processes" },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    tagline: "Team Development",
    description: "LMS for team training, courses, and certifications",
    icon: GraduationCap,
    href: "/lms",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-500",
    modules: [
      { label: "Learning Center", href: "/lms", icon: GraduationCap, description: "Training dashboard" },
      { label: "Courses", href: "/lms/courses", icon: BookOpen, description: "Browse all courses" },
      { label: "Course Builder", href: "/lms/builder", icon: Sparkles, description: "AI curriculum builder" },
      { label: "My Learning", href: "/lms/my-learning", icon: FolderKanban, description: "Your enrollments" },
      { label: "Certificates", href: "/lms/certificates", icon: Award, description: "Earned credentials" },
    ],
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function HubPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="text-center py-8 border-b mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          SpokeStack
        </h1>
        <p className="text-muted-foreground mt-2">
          Your complete agency operations platform
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Left Column - Admin & Super Admin */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
            Administration
          </h2>

          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-1.5 bg-gradient-to-r ${section.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.label}</CardTitle>
                        {section.badge && (
                          <Badge variant="destructive" className="text-[10px] mt-1">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={section.href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-1">
                    {section.modules.map((mod) => {
                      const ModIcon = mod.icon;
                      return (
                        <Link
                          key={mod.href}
                          href={mod.href}
                          className="flex items-center gap-2 p-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ModIcon className="h-3.5 w-3.5" />
                          {mod.label}
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column - Module Bundles */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
            Module Bundles
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {MODULE_BUNDLES.map((bundle) => {
              const Icon = bundle.icon;
              return (
                <Card key={bundle.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className={`h-2 bg-gradient-to-r ${bundle.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${bundle.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {bundle.tagline}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl flex items-center gap-2 mt-3">
                      {bundle.label}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {bundle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {bundle.modules.map((mod) => {
                        const ModIcon = mod.icon;
                        return (
                          <Link
                            key={mod.href}
                            href={mod.href}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group/item"
                          >
                            <div className={`p-1.5 rounded-md ${bundle.bgColor}/10`}>
                              <ModIcon className={`h-4 w-4 ${bundle.bgColor.replace('bg-', 'text-')}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover/item:text-primary transition-colors">
                                {mod.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {mod.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                      <Link href={bundle.href}>
                        Open {bundle.label}
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats or Getting Started */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Need help getting started?</h3>
                  <p className="text-sm text-muted-foreground">
                    Check out the documentation or contact support
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs">Documentation</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="mailto:support@spokestack.io">Contact Support</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
