import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Shield,
  Briefcase,
  Building2,
  Megaphone,
  Eye,
  Code,
  Database,
  Server,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const USER_GUIDES = [
  { title: "Getting Started", description: "First steps for new users", icon: BookOpen, href: "/docs/getting-started" },
  { title: "Hub Overview", description: "Understanding the main dashboard", icon: BookOpen, href: "/docs/hub-overview" },
  { title: "SpokeChat", description: "Team messaging and communication", icon: BookOpen, href: "/docs/spokechat" },
];

const ADMIN_GUIDES = [
  { title: "Admin Dashboard", description: "Managing your organization", icon: Shield, href: "/docs/admin-dashboard" },
  { title: "User Management", description: "Adding and managing team members", icon: Users, href: "/docs/user-management" },
  { title: "Permission Levels", description: "Understanding roles and access", icon: Shield, href: "/docs/permissions" },
];

const MODULE_DOCS = [
  { title: "ERP Bundle", description: "Briefs, Time Tracking, Leave, Team, RFP", icon: Briefcase, color: "bg-indigo-500" },
  { title: "Agency Bundle", description: "Clients, Retainers, Projects, Resources, CRM", icon: Building2, color: "bg-emerald-500" },
  { title: "Marketing Bundle", description: "Listening, Trackers, Media Buying, Analytics, Builder", icon: Megaphone, color: "bg-purple-500" },
  { title: "Client Portal", description: "Dashboard, Approvals, Deliverables, Reports", icon: Eye, color: "bg-cyan-500" },
];

const TECH_DOCS = [
  { title: "Architecture", description: "System design and tech stack", icon: Server },
  { title: "API Reference", description: "Endpoints and integration", icon: Code },
  { title: "Database Schema", description: "Data models and relationships", icon: Database },
];

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about using SpokeStack
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <BookOpen className="h-3 w-3" />
          Version 1.0
        </Badge>
        <Badge variant="outline">Last updated: December 2025</Badge>
      </div>

      {/* User Guides */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          User Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {USER_GUIDES.map((guide) => (
            <Card key={guide.title} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary flex items-center gap-1">
                  Read guide <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Admin Guides */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Admin Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ADMIN_GUIDES.map((guide) => (
            <Card key={guide.title} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary flex items-center gap-1">
                  Read guide <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Module Documentation */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-emerald-500" />
          Module Documentation
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MODULE_DOCS.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${module.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription className="text-xs">{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary flex items-center gap-1">
                    View modules <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Technical Documentation */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-500" />
          Technical Documentation
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TECH_DOCS.map((doc) => {
            const Icon = doc.icon;
            return (
              <Card key={doc.title} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                  </div>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary flex items-center gap-1">
                    View docs <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Additional Resources */}
      <section className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub Repository</CardTitle>
              <CardDescription>
                View source code and contribute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/willhutson/erp_staging_lmtd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                Open GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Support</CardTitle>
              <CardDescription>
                Get help from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@spokestack.io"
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                support@spokestack.io <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
