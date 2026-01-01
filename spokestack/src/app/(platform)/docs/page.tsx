"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Rocket,
  LayoutDashboard,
  FileText,
  Clock,
  Calendar,
  Users,
  Building2,
  FolderKanban,
  Briefcase,
  Activity,
  TrendingUp,
  Shield,
  Settings,
  Key,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Video,
  Presentation,
  ImageIcon,
  Palette,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "studio", label: "SpokeStudio", icon: Sparkles },
  { id: "studio-docs", label: "Documents", icon: FileText },
  { id: "studio-video", label: "Video Studio", icon: Video },
  { id: "studio-decks", label: "Pitch Decks", icon: Presentation },
  { id: "studio-moodboard", label: "Moodboards", icon: ImageIcon },
  { id: "studio-calendar", label: "Content Calendar", icon: Calendar },
  { id: "studio-skills", label: "AI Skills", icon: Palette },
  { id: "briefs", label: "Briefs", icon: FileText },
  { id: "time-tracking", label: "Time Tracking", icon: Clock },
  { id: "leave", label: "Leave Management", icon: Calendar },
  { id: "team", label: "Team Directory", icon: Users },
  { id: "clients", label: "Clients", icon: Building2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "rfp", label: "RFP & Deals", icon: Briefcase },
  { id: "resources", label: "Resources", icon: Activity },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "admin", label: "Admin Settings", icon: Settings },
  { id: "api", label: "API Reference", icon: Key },
];

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          SpokeStack Documentation
        </h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about using SpokeStack
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">Version 1.0</Badge>
          <Badge variant="outline">December 2024</Badge>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="mb-8 sticky top-4 z-10 bg-background/95 backdrop-blur">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Button key={item.id} variant="ghost" size="sm" asChild>
                <a href={`#${item.id}`} className="gap-1.5">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="space-y-12">

        {/* Getting Started */}
        <Section id="getting-started" icon={Rocket} title="Getting Started">
          <p className="text-muted-foreground mb-4">
            Welcome to SpokeStack! Here's how to get up and running quickly.
          </p>
          <ol className="space-y-4 list-decimal list-inside">
            <li>
              <strong>Complete Your Profile</strong>
              <p className="text-sm text-muted-foreground ml-5">
                Click your avatar → Profile Settings. Add your photo, job title, and department.
              </p>
            </li>
            <li>
              <strong>Explore the Hub</strong>
              <p className="text-sm text-muted-foreground ml-5">
                Your dashboard shows active briefs, time logged this week, and upcoming deadlines.
              </p>
            </li>
            <li>
              <strong>View Your Briefs</strong>
              <p className="text-sm text-muted-foreground ml-5">
                Go to Briefs → My Briefs to see work assigned to you.
              </p>
            </li>
            <li>
              <strong>Start Tracking Time</strong>
              <p className="text-sm text-muted-foreground ml-5">
                Click the clock icon to start a timer, or go to Time to log hours manually.
              </p>
            </li>
            <li>
              <strong>Explore SpokeStudio</strong>
              <p className="text-sm text-muted-foreground ml-5">
                Go to Studio to access AI-powered creative tools: Documents, Video Projects, Pitch Decks, and Moodboards.
              </p>
            </li>
          </ol>
        </Section>

        {/* SpokeStudio Overview */}
        <Section id="studio" icon={Sparkles} title="SpokeStudio">
          <p className="text-muted-foreground mb-4">
            SpokeStudio is your AI-powered creative workspace. Build content, presentations, and manage creative assets with intelligent assistance.
          </p>

          <h4 className="font-semibold mb-2">Available Modules</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { name: "Documents", desc: "Rich text docs with Google Docs sync", href: "/studio/docs" },
              { name: "Video Studio", desc: "Scripts, storyboards, shot lists", href: "/studio/video" },
              { name: "Pitch Decks", desc: "AI-assisted presentations", href: "/studio/decks" },
              { name: "Moodboard Lab", desc: "Visual inspiration with AI indexing", href: "/studio/moodboard" },
              { name: "Content Calendar", desc: "Social media scheduling", href: "/studio/calendar" },
              { name: "AI Skills", desc: "Customizable AI assistants", href: "/studio/skills" },
            ].map((mod) => (
              <Link key={mod.href} href={mod.href} className="p-3 border rounded-lg hover:border-primary transition-colors">
                <p className="font-medium">{mod.name}</p>
                <p className="text-sm text-muted-foreground">{mod.desc}</p>
              </Link>
            ))}
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/studio">
              Open SpokeStudio <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Section>

        {/* Studio Documents */}
        <Section id="studio-docs" icon={FileText} title="Studio Documents">
          <p className="text-muted-foreground mb-4">
            Create and collaborate on rich text documents with version history and Google Docs integration.
          </p>

          <h4 className="font-semibold mb-2">Document Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {["SCRIPT", "ARTICLE", "SOCIAL_COPY", "AD_COPY", "BLOG", "EMAIL", "PRESS_RELEASE", "PROPOSAL", "OTHER"].map((type) => (
              <Badge key={type} variant="outline" className="justify-center py-1">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Version History:</strong> Automatic versioning on every save</li>
            <li>• <strong>Google Sync:</strong> Push/pull from Google Docs</li>
            <li>• <strong>AI Assistance:</strong> Generate content with AI skills</li>
            <li>• <strong>Link to Briefs:</strong> Connect documents to briefs and projects</li>
          </ul>
        </Section>

        {/* Video Studio */}
        <Section id="studio-video" icon={Video} title="Video Studio">
          <p className="text-muted-foreground mb-4">
            Manage video productions from concept to completion with scripts, storyboards, and shot lists.
          </p>

          <h4 className="font-semibold mb-2">Project Types</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {["SHORT_FORM", "LONG_FORM", "AD", "DOCUMENTARY", "EXPLAINER", "TESTIMONIAL", "OTHER"].map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Production Workflow</h4>
          <div className="flex flex-wrap gap-1 mb-4">
            {["CONCEPT", "SCRIPTING", "PRE_PRODUCTION", "PRODUCTION", "POST_PRODUCTION", "REVIEW", "COMPLETE"].map((status, i) => (
              <span key={status} className="flex items-center gap-1 text-sm">
                <Badge variant="secondary">{status}</Badge>
                {i < 6 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Scripts:</strong> Write and version video scripts</li>
            <li>• <strong>Storyboards:</strong> Visual frame-by-frame planning</li>
            <li>• <strong>Shot Lists:</strong> Track shots with status and notes</li>
            <li>• <strong>AI Script Writing:</strong> Generate scripts from briefs</li>
          </ul>
        </Section>

        {/* Pitch Decks */}
        <Section id="studio-decks" icon={Presentation} title="Pitch Decks">
          <p className="text-muted-foreground mb-4">
            Build professional presentations with AI-powered content generation and slide templates.
          </p>

          <h4 className="font-semibold mb-2">Deck Types</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {["PITCH", "PROPOSAL", "REPORT", "CREDENTIALS", "CASE_STUDY", "STRATEGY", "OTHER"].map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Slide Layouts</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {["Title", "Content", "Two Column", "Image", "Quote", "Stats", "Timeline", "Team"].map((layout) => (
              <Badge key={layout} variant="secondary" className="justify-center">{layout}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>AI Content:</strong> Generate slide content from prompts</li>
            <li>• <strong>Templates:</strong> Pre-built deck templates</li>
            <li>• <strong>Drag & Drop:</strong> Reorder slides easily</li>
            <li>• <strong>Export:</strong> Download as PDF or link to clients</li>
          </ul>
        </Section>

        {/* Moodboards */}
        <Section id="studio-moodboard" icon={ImageIcon} title="Moodboard Lab">
          <p className="text-muted-foreground mb-4">
            Collect and organize visual inspiration. AI indexes your references for grounded creative generation.
          </p>

          <h4 className="font-semibold mb-2">Moodboard Types</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {["BRAND", "CAMPAIGN", "VISUAL", "REFERENCE", "COMPETITOR", "INSPIRATION", "OTHER"].map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Item Types</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Images:</strong> Upload reference images and screenshots</li>
            <li>• <strong>Links:</strong> Save URLs with auto-preview</li>
            <li>• <strong>Text:</strong> Add notes and annotations</li>
            <li>• <strong>Colors:</strong> Build color palettes</li>
          </ul>

          <h4 className="font-semibold mt-4 mb-2">AI Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Auto-Index:</strong> AI analyzes and indexes all content</li>
            <li>• <strong>Grounded Generation:</strong> Create content based on your references</li>
            <li>• <strong>Conversations:</strong> Chat with AI about your moodboard</li>
          </ul>
        </Section>

        {/* Content Calendar */}
        <Section id="studio-calendar" icon={Calendar} title="Content Calendar">
          <p className="text-muted-foreground mb-4">
            Plan and schedule social content across platforms with visual calendar management.
          </p>

          <h4 className="font-semibold mb-2">Supported Platforms</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {["Instagram", "TikTok", "LinkedIn", "X/Twitter", "Facebook", "YouTube"].map((platform) => (
              <Badge key={platform} variant="outline">{platform}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Content Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {["Post", "Reel", "Story", "Carousel", "Video", "Article"].map((type) => (
              <Badge key={type} variant="secondary" className="justify-center">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Drag & Drop:</strong> Move content between dates</li>
            <li>• <strong>Color Coding:</strong> Visual status at a glance</li>
            <li>• <strong>Assignments:</strong> Assign entries to team members</li>
            <li>• <strong>Link to Docs:</strong> Connect calendar entries to documents</li>
          </ul>
        </Section>

        {/* AI Skills */}
        <Section id="studio-skills" icon={Palette} title="AI Skills">
          <p className="text-muted-foreground mb-4">
            Pre-built AI assistants for common creative tasks. Configure prompts and enable skills for your team.
          </p>

          <h4 className="font-semibold mb-2">Available Skills</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { name: "Social Copy Writer", category: "Copy" },
              { name: "Ad Copy Generator", category: "Copy" },
              { name: "Video Script Writer", category: "Video" },
              { name: "Storyboard Generator", category: "Video" },
              { name: "Design Brief Writer", category: "Design" },
              { name: "Strategy Document", category: "Strategy" },
              { name: "Pitch Deck Builder", category: "Presentation" },
              { name: "Client Report", category: "Reports" },
            ].map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">{skill.name}</span>
                <Badge variant="outline" className="text-xs">{skill.category}</Badge>
              </div>
            ))}
          </div>

          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Select a skill from the library</li>
            <li>Fill in the required inputs (client, brief, tone, etc.)</li>
            <li>AI generates content based on the skill's system prompt</li>
            <li>Review, edit, and save to your documents</li>
          </ol>
        </Section>

        {/* Briefs */}
        <Section id="briefs" icon={FileText} title="Briefs">
          <p className="text-muted-foreground mb-4">
            Briefs are the core work items in SpokeStack. Each brief represents a creative task.
          </p>

          <h4 className="font-semibold mb-2">Brief Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {["VIDEO_SHOOT", "VIDEO_EDIT", "DESIGN", "COPYWRITING_EN", "COPYWRITING_AR", "PAID_MEDIA", "RFP"].map((type) => (
              <Badge key={type} variant="outline" className="justify-center py-1">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Status Workflow</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Briefs progress through these statuses:
          </p>
          <div className="flex flex-wrap gap-1 mb-4">
            {["DRAFT", "SUBMITTED", "APPROVED", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].map((status, i) => (
              <span key={status} className="flex items-center gap-1 text-sm">
                <Badge variant="secondary">{status}</Badge>
                {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Key Actions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Create Brief:</strong> Briefs → New Brief (or quick-create from dashboard)</li>
            <li>• <strong>Update Status:</strong> Click status badge on brief detail page</li>
            <li>• <strong>Log Time:</strong> Use the timer or add manual entries from brief page</li>
            <li>• <strong>Add Comments:</strong> Discuss work in the comments section</li>
          </ul>
        </Section>

        {/* Time Tracking */}
        <Section id="time-tracking" icon={Clock} title="Time Tracking">
          <p className="text-muted-foreground mb-4">
            Track hours against briefs and projects for billing and reporting.
          </p>

          <h4 className="font-semibold mb-2">Timer</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Click the clock icon in the header to start a timer. Link it to a brief or project.
            When you stop, the time is automatically logged.
          </p>

          <h4 className="font-semibold mb-2">Manual Entry</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Go to Time → Add Entry to log hours directly. Select date, hours, brief/project, and description.
          </p>

          <h4 className="font-semibold mb-2">Billable vs Non-Billable</h4>
          <p className="text-sm text-muted-foreground">
            Mark entries as billable when working on client projects. Non-billable for internal work.
          </p>
        </Section>

        {/* Leave Management */}
        <Section id="leave" icon={Calendar} title="Leave Management">
          <p className="text-muted-foreground mb-4">
            Request time off and track your leave balances.
          </p>

          <h4 className="font-semibold mb-2">Leave Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {["Annual", "Sick", "Unpaid", "Maternity", "Paternity", "Compassionate", "Study"].map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Requesting Leave</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to Leave → Request Leave</li>
            <li>Select leave type and dates</li>
            <li>Add a reason (required for some types)</li>
            <li>Submit for approval</li>
          </ol>

          <h4 className="font-semibold mt-4 mb-2">Approvals</h4>
          <p className="text-sm text-muted-foreground">
            Team Leads and above can approve/reject leave requests for their team members.
          </p>
        </Section>

        {/* Team Directory */}
        <Section id="team" icon={Users} title="Team Directory">
          <p className="text-muted-foreground mb-4">
            View all team members, their roles, and contact information.
          </p>

          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Directory:</strong> Searchable list of all team members</li>
            <li>• <strong>Org Chart:</strong> Visual hierarchy by department</li>
            <li>• <strong>Profiles:</strong> Contact info, skills, and current workload</li>
            <li>• <strong>Departments:</strong> Creative, Strategy, Accounts, etc.</li>
          </ul>
        </Section>

        {/* Clients */}
        <Section id="clients" icon={Building2} title="Clients">
          <p className="text-muted-foreground mb-4">
            Manage client accounts, contacts, and relationships.
          </p>

          <h4 className="font-semibold mb-2">Client Records</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Company name, logo, and industry</li>
            <li>• Primary and secondary contacts</li>
            <li>• Account manager assignment</li>
            <li>• Active projects and briefs</li>
          </ul>

          <h4 className="font-semibold mt-4 mb-2">Access</h4>
          <p className="text-sm text-muted-foreground">
            Leadership+ can create and edit clients. All staff can view client details.
          </p>
        </Section>

        {/* Projects */}
        <Section id="projects" icon={FolderKanban} title="Projects">
          <p className="text-muted-foreground mb-4">
            Projects group briefs together and track budgets.
          </p>

          <h4 className="font-semibold mb-2">Project Types</h4>
          <div className="flex gap-2 mb-4">
            {["Retainer", "Project", "Pitch", "Internal"].map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Budget Tracking</h4>
          <p className="text-sm text-muted-foreground">
            Projects can have hour and/or amount budgets. Track utilization as time is logged against briefs.
          </p>
        </Section>

        {/* RFP & Deals */}
        <Section id="rfp" icon={Briefcase} title="RFP & Deals">
          <p className="text-muted-foreground mb-4">
            Track new business opportunities from initial contact to close. <strong>Leadership access required.</strong>
          </p>

          <h4 className="font-semibold mb-2">RFP Pipeline</h4>
          <p className="text-sm text-muted-foreground mb-2">
            RFPs move through: Vetting → Confirmed → Submitted → Outcome
          </p>

          <h4 className="font-semibold mb-2">Deal Stages</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Deals progress: Lead → Qualified → Proposal → Negotiation → Won/Lost
          </p>

          <h4 className="font-semibold mb-2">Conversion</h4>
          <p className="text-sm text-muted-foreground">
            Won deals can be converted to clients with one click, creating the client record automatically.
          </p>
        </Section>

        {/* Resources */}
        <Section id="resources" icon={Activity} title="Resources">
          <p className="text-muted-foreground mb-4">
            Monitor team capacity and workload. <strong>Team Lead+ access required.</strong>
          </p>

          <h4 className="font-semibold mb-2">Capacity View</h4>
          <p className="text-sm text-muted-foreground mb-4">
            See each team member's logged hours vs. their weekly capacity (typically 40 hours).
          </p>

          <h4 className="font-semibold mb-2">Utilization</h4>
          <p className="text-sm text-muted-foreground">
            Track billable utilization percentages by person, team, or department.
          </p>
        </Section>

        {/* Permissions */}
        <Section id="permissions" icon={Shield} title="Permissions">
          <p className="text-muted-foreground mb-4">
            SpokeStack uses role-based access control with these permission levels:
          </p>

          <div className="space-y-3">
            {[
              { level: "ADMIN", desc: "Full access to all settings and data", color: "bg-red-500" },
              { level: "LEADERSHIP", desc: "Access to RFPs, deals, and org reports", color: "bg-purple-500" },
              { level: "TEAM_LEAD", desc: "Manage team, approve time/leave", color: "bg-blue-500" },
              { level: "STAFF", desc: "Standard employee access", color: "bg-green-500" },
              { level: "FREELANCER", desc: "Limited to assigned work only", color: "bg-amber-500" },
            ].map((p) => (
              <div key={p.level} className="flex items-center gap-3">
                <Badge className={`${p.color} w-28 justify-center`}>{p.level}</Badge>
                <span className="text-sm text-muted-foreground">{p.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Admin Settings */}
        <Section id="admin" icon={Settings} title="Admin Settings">
          <p className="text-muted-foreground mb-4">
            Organization settings and configuration. <strong>Admin access required.</strong>
          </p>

          <h4 className="font-semibold mb-2">Available Settings</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Organization:</strong> Company name, logo, timezone</li>
            <li>• <strong>Users:</strong> Add/edit team members, set permissions</li>
            <li>• <strong>Departments:</strong> Manage team structure</li>
            <li>• <strong>Leave Types:</strong> Configure leave policies</li>
            <li>• <strong>Integrations:</strong> Connect external tools</li>
          </ul>

          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">
                Go to Admin Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        {/* API Reference */}
        <Section id="api" icon={Key} title="API Reference">
          <p className="text-muted-foreground mb-4">
            SpokeStack provides a REST API for integrations and automation.
          </p>

          <h4 className="font-semibold mb-2">Base URL</h4>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            https://spokestack.vercel.app/api/v1
          </code>

          <h4 className="font-semibold mt-4 mb-2">Authentication</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Session-based authentication via cookies. Login first to obtain a session.
          </p>

          <h4 className="font-semibold mb-2">Endpoints</h4>
          <p className="text-sm text-muted-foreground mb-4">
            70+ endpoints across Auth, Users, Clients, Briefs, Projects, Time, Leave, Team, RFP, Deals, and Resources.
          </p>

          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/settings/api">
              View Full API Documentation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Section>

        {/* Back to Top */}
        <div className="flex justify-center pt-8 pb-4">
          <Button variant="ghost" asChild>
            <a href="#" className="gap-2">
              <ArrowUp className="h-4 w-4" />
              Back to Top
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}
