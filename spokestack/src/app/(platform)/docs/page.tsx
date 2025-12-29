"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Rocket,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Shield,
  Package,
  Building2,
  Megaphone,
  Globe,
  Code,
  Database,
  Key,
  Github,
  Mail,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  Calendar,
  Briefcase,
  FolderKanban,
  TrendingUp,
  Activity,
  Headphones,
  Radio,
  BarChart3,
  Layers,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

type DocSection = {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  href?: string;
  content?: React.ReactNode;
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentation
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Everything you need to know about using SpokeStack
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">Version 1.0</Badge>
          <Badge variant="outline">Last updated: December 2025</Badge>
        </div>
      </div>

      {/* Documentation Sections */}
      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger value="guides" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Rocket className="h-4 w-4" />
            User Guides
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4" />
            Admin Guides
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ExternalLink className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* ========== USER GUIDES ========== */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DocCard
              icon={Rocket}
              iconColor="text-green-500"
              title="Getting Started"
              description="First steps for new users"
              isActive={activeSection === "getting-started"}
              onClick={() => setActiveSection(activeSection === "getting-started" ? null : "getting-started")}
            />
            <DocCard
              icon={LayoutDashboard}
              iconColor="text-blue-500"
              title="Hub Overview"
              description="Understanding the main dashboard"
              isActive={activeSection === "hub-overview"}
              onClick={() => setActiveSection(activeSection === "hub-overview" ? null : "hub-overview")}
            />
            <DocCard
              icon={MessageSquare}
              iconColor="text-purple-500"
              title="SpokeChat"
              description="Team messaging and communication"
              isActive={activeSection === "spokechat"}
              onClick={() => setActiveSection(activeSection === "spokechat" ? null : "spokechat")}
            />
          </div>

          {/* Expanded Content */}
          {activeSection === "getting-started" && (
            <ExpandedSection title="Getting Started" icon={Rocket} iconColor="text-green-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Welcome to SpokeStack</h3>
                  <p className="text-muted-foreground mb-4">
                    SpokeStack is your all-in-one platform for managing creative projects, tracking time,
                    and collaborating with your team. This guide will help you get up and running quickly.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">1. Complete Your Profile</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Click your avatar in the top-right corner</li>
                    <li>Select "Profile Settings"</li>
                    <li>Upload a profile photo</li>
                    <li>Fill in your job title and department</li>
                    <li>Set your weekly capacity hours (default is 40)</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/admin/settings/profile">Go to Profile Settings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">2. Explore the Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Hub shows an overview of your work including:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>My Briefs</strong> - Work assigned to you</li>
                    <li>• <strong>Time This Week</strong> - Hours logged</li>
                    <li>• <strong>Upcoming Deadlines</strong> - What's due soon</li>
                    <li>• <strong>Team Activity</strong> - Recent updates</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">3. Start Tracking Time</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Click the clock icon in the header to start the timer</li>
                    <li>Or go to Time → Add Entry for manual logging</li>
                    <li>Link your time to a brief or project</li>
                    <li>Mark billable hours when working on client projects</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/time">Go to Time Tracking <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">4. View Your Briefs</h3>
                  <p className="text-sm text-muted-foreground">
                    Briefs are the core of your work in SpokeStack. View all briefs assigned to you,
                    update their status, and log time against them.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/briefs">View Briefs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </section>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "hub-overview" && (
            <ExpandedSection title="Hub Overview" icon={LayoutDashboard} iconColor="text-blue-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Your Personal Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    The Hub is your central command center in SpokeStack. It gives you a quick overview
                    of your work, deadlines, and team activity all in one place.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Dashboard Widgets</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Active Briefs
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Shows briefs assigned to you that are in progress, with status and deadline.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        Time Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your logged hours this week vs. your capacity target.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        Upcoming Deadlines
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Briefs due in the next 7 days, sorted by urgency.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        Recent Activity
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Team updates, brief status changes, and comments.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Navigation Sidebar</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The left sidebar provides quick access to all modules:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Hub</strong> - Return to your dashboard</li>
                    <li>• <strong>Briefs</strong> - All briefs and work items</li>
                    <li>• <strong>Time</strong> - Time tracking and reports</li>
                    <li>• <strong>Leave</strong> - Request and manage time off</li>
                    <li>• <strong>Team</strong> - Directory and org chart</li>
                    <li>• <strong>Clients</strong> - Client accounts</li>
                    <li>• <strong>Projects</strong> - Project management</li>
                  </ul>
                </section>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "spokechat" && (
            <ExpandedSection title="SpokeChat" icon={MessageSquare} iconColor="text-purple-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Team Communication</h3>
                  <p className="text-muted-foreground mb-4">
                    SpokeChat is the built-in messaging system for real-time team communication.
                    Send messages, share files, and stay connected with your team.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Direct Messages</strong> - Private 1:1 conversations with team members</li>
                    <li>• <strong>Group Channels</strong> - Team or project-based discussions</li>
                    <li>• <strong>File Sharing</strong> - Share images, documents, and links</li>
                    <li>• <strong>@Mentions</strong> - Tag team members to get their attention</li>
                    <li>• <strong>Notifications</strong> - Desktop and mobile alerts for new messages</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Getting Started with Chat</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Click "Chat" in the sidebar navigation</li>
                    <li>Start a new conversation with the + button</li>
                    <li>Search for team members by name</li>
                    <li>Type your message and press Enter to send</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/chat">Open SpokeChat <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </section>
              </div>
            </ExpandedSection>
          )}
        </TabsContent>

        {/* ========== ADMIN GUIDES ========== */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DocCard
              icon={Settings}
              iconColor="text-gray-500"
              title="Admin Dashboard"
              description="Managing your organization"
              isActive={activeSection === "admin-dashboard"}
              onClick={() => setActiveSection(activeSection === "admin-dashboard" ? null : "admin-dashboard")}
            />
            <DocCard
              icon={Users}
              iconColor="text-blue-500"
              title="User Management"
              description="Adding and managing team members"
              isActive={activeSection === "user-management"}
              onClick={() => setActiveSection(activeSection === "user-management" ? null : "user-management")}
            />
            <DocCard
              icon={Shield}
              iconColor="text-amber-500"
              title="Permission Levels"
              description="Understanding roles and access"
              isActive={activeSection === "permissions"}
              onClick={() => setActiveSection(activeSection === "permissions" ? null : "permissions")}
            />
          </div>

          {activeSection === "admin-dashboard" && (
            <ExpandedSection title="Admin Dashboard" icon={Settings} iconColor="text-gray-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Organization Administration</h3>
                  <p className="text-muted-foreground mb-4">
                    The Admin section provides tools for managing your organization's settings,
                    users, integrations, and more. Only users with Admin permission level can access these features.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Admin Menu</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Organization Settings</h4>
                      <p className="text-sm text-muted-foreground">Company name, logo, timezone, and branding</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/admin/settings/organization">Configure <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">User Management</h4>
                      <p className="text-sm text-muted-foreground">Add, edit, and deactivate team members</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/admin/users">Manage Users <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Integrations</h4>
                      <p className="text-sm text-muted-foreground">Connect external tools and services</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/admin/integrations">View Integrations <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Billing</h4>
                      <p className="text-sm text-muted-foreground">Subscription, invoices, and payment methods</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/admin/settings/billing">View Billing <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg">
                  <p className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <strong>Admin access required</strong> - Only users with Admin permission level can access these settings
                  </p>
                </section>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "user-management" && (
            <ExpandedSection title="User Management" icon={Users} iconColor="text-blue-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Managing Team Members</h3>
                  <p className="text-muted-foreground mb-4">
                    Add new team members, update profiles, set permissions, and manage access to your organization.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Adding a New User</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Go to Admin → Users</li>
                    <li>Click "Add User" button</li>
                    <li>Enter name, email, and job title</li>
                    <li>Select department and team lead</li>
                    <li>Choose permission level</li>
                    <li>Set weekly capacity hours</li>
                    <li>Click Save - an invitation email will be sent</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/admin/users">Go to Users <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">User Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-green-500">Active</Badge>
                    <Badge variant="secondary">Pending Invite</Badge>
                    <Badge variant="destructive">Deactivated</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Deactivated users cannot log in but their historical data is preserved.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Bulk Actions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Export Users</strong> - Download CSV of all users</li>
                    <li>• <strong>Resend Invites</strong> - Re-send pending invitations</li>
                    <li>• <strong>Update Department</strong> - Move multiple users at once</li>
                  </ul>
                </section>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "permissions" && (
            <ExpandedSection title="Permission Levels" icon={Shield} iconColor="text-amber-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Role-Based Access Control</h3>
                  <p className="text-muted-foreground mb-4">
                    SpokeStack uses permission levels to control what each user can see and do.
                    Each user is assigned one permission level that determines their access across all modules.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Permission Levels</h3>
                  <div className="space-y-3">
                    {[
                      { level: "ADMIN", desc: "Full system access. Can manage users, organization settings, billing, and all data. Typically reserved for system administrators.", color: "bg-red-500" },
                      { level: "LEADERSHIP", desc: "All data access including RFPs, deals, and financials. Can run organization-wide reports. For department heads and executives.", color: "bg-purple-500" },
                      { level: "TEAM_LEAD", desc: "Team management capabilities. Can assign work, approve time/leave for their team, and view team metrics.", color: "bg-blue-500" },
                      { level: "STAFF", desc: "Standard employee access. Can create briefs, log time, request leave, and view their own work.", color: "bg-green-500" },
                      { level: "FREELANCER", desc: "Limited contractor access. Can only see work assigned to them and log time against it.", color: "bg-amber-500" },
                      { level: "CLIENT", desc: "External portal access only. Can view and approve deliverables for their projects.", color: "bg-gray-500" },
                    ].map((p) => (
                      <div key={p.level} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Badge className={`${p.color} font-mono shrink-0`}>{p.level}</Badge>
                        <p className="text-sm text-muted-foreground">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Module Access Matrix</h3>
                  <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">Feature</th>
                          <th className="text-center p-3">Staff</th>
                          <th className="text-center p-3">Team Lead</th>
                          <th className="text-center p-3">Leadership</th>
                          <th className="text-center p-3">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { feature: "View own briefs & time", staff: true, lead: true, leadership: true, admin: true },
                          { feature: "Create briefs", staff: true, lead: true, leadership: true, admin: true },
                          { feature: "View team data", staff: false, lead: true, leadership: true, admin: true },
                          { feature: "Approve time/leave", staff: false, lead: true, leadership: true, admin: true },
                          { feature: "View RFPs & Deals", staff: false, lead: false, leadership: true, admin: true },
                          { feature: "Manage clients", staff: false, lead: false, leadership: true, admin: true },
                          { feature: "Admin settings", staff: false, lead: false, leadership: false, admin: true },
                          { feature: "User management", staff: false, lead: false, leadership: false, admin: true },
                        ].map((row) => (
                          <tr key={row.feature} className="border-t">
                            <td className="p-3">{row.feature}</td>
                            <td className="text-center p-3">{row.staff ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                            <td className="text-center p-3">{row.lead ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                            <td className="text-center p-3">{row.leadership ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                            <td className="text-center p-3">{row.admin ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </ExpandedSection>
          )}
        </TabsContent>

        {/* ========== MODULE DOCUMENTATION ========== */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DocCard
              icon={Package}
              iconColor="text-blue-500"
              title="ERP Bundle"
              description="Briefs, Time Tracking, Leave, Team, RFP"
              isActive={activeSection === "erp-bundle"}
              onClick={() => setActiveSection(activeSection === "erp-bundle" ? null : "erp-bundle")}
            />
            <DocCard
              icon={Building2}
              iconColor="text-green-500"
              title="Agency Bundle"
              description="Clients, Retainers, Projects, Resources, CRM"
              isActive={activeSection === "agency-bundle"}
              onClick={() => setActiveSection(activeSection === "agency-bundle" ? null : "agency-bundle")}
            />
            <DocCard
              icon={Megaphone}
              iconColor="text-purple-500"
              title="Marketing Bundle"
              description="Listening, Trackers, Media Buying, Analytics, Builder"
              isActive={activeSection === "marketing-bundle"}
              onClick={() => setActiveSection(activeSection === "marketing-bundle" ? null : "marketing-bundle")}
            />
            <DocCard
              icon={Globe}
              iconColor="text-amber-500"
              title="Client Portal"
              description="Dashboard, Approvals, Deliverables, Reports"
              isActive={activeSection === "client-portal"}
              onClick={() => setActiveSection(activeSection === "client-portal" ? null : "client-portal")}
            />
          </div>

          {activeSection === "erp-bundle" && (
            <ExpandedSection title="ERP Bundle" icon={Package} iconColor="text-blue-500">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  The ERP Bundle provides core business operations for creative agencies: work management,
                  time tracking, leave management, team directory, and new business tracking.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={FileText}
                    title="Briefs"
                    description="Creative brief management and workflow. Track work from request to delivery."
                    href="/briefs"
                    features={["7 brief types", "Status workflow", "Time tracking", "Client assignment"]}
                  />
                  <ModuleCard
                    icon={Clock}
                    title="Time Tracking"
                    description="Log hours, use timers, and generate reports for billing and payroll."
                    href="/time"
                    features={["Manual & timer entry", "Billable flagging", "Weekly reports", "Export to CSV"]}
                  />
                  <ModuleCard
                    icon={Calendar}
                    title="Leave Management"
                    description="Request time off, track balances, and manage approvals."
                    href="/leave"
                    features={["Multiple leave types", "Approval workflow", "Balance tracking", "Team calendar"]}
                  />
                  <ModuleCard
                    icon={Users}
                    title="Team Directory"
                    description="Employee profiles, departments, and organization structure."
                    href="/team"
                    features={["Profile management", "Org chart", "Skills tracking", "Contact info"]}
                  />
                  <ModuleCard
                    icon={Briefcase}
                    title="RFP Management"
                    description="Track proposals from receipt through submission. Leadership only."
                    href="/rfp"
                    features={["Pipeline tracking", "Sub-task management", "Outcome tracking", "Win rate analysis"]}
                  />
                </div>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "agency-bundle" && (
            <ExpandedSection title="Agency Bundle" icon={Building2} iconColor="text-green-500">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  The Agency Bundle handles client relationships, project management, resource planning,
                  and CRM functionality for managing your agency's client work.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={Building2}
                    title="Clients"
                    description="Client account management, contacts, and relationships."
                    href="/clients"
                    features={["Client profiles", "Contact management", "Industry tracking", "Account managers"]}
                  />
                  <ModuleCard
                    icon={FolderKanban}
                    title="Projects"
                    description="Project and retainer management with budget tracking."
                    href="/projects"
                    features={["Budget tracking", "Hours allocation", "Brief grouping", "Utilization reporting"]}
                  />
                  <ModuleCard
                    icon={Activity}
                    title="Resources"
                    description="Team capacity planning and utilization monitoring."
                    href="/resources"
                    features={["Capacity tracking", "Utilization %", "Availability view", "Leave integration"]}
                  />
                  <ModuleCard
                    icon={TrendingUp}
                    title="Deals"
                    description="Sales pipeline and opportunity tracking. Leadership only."
                    href="/crm/deals"
                    features={["Pipeline stages", "Value tracking", "Probability %", "Client conversion"]}
                  />
                  <ModuleCard
                    icon={Users}
                    title="CRM Contacts"
                    description="External contacts and relationship management."
                    href="/crm/contacts"
                    features={["Contact database", "Company linking", "Activity history", "Notes"]}
                  />
                </div>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "marketing-bundle" && (
            <ExpandedSection title="Marketing Bundle" icon={Megaphone} iconColor="text-purple-500">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  The Marketing Bundle provides social listening, campaign tracking, media buying management,
                  analytics dashboards, and custom report building.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={Headphones}
                    title="Social Listening"
                    description="Monitor brand mentions, hashtags, and competitor activity."
                    href="/listening"
                    features={["Brand monitoring", "Hashtag tracking", "Sentiment analysis", "Alerts"]}
                  />
                  <ModuleCard
                    icon={Radio}
                    title="Trackers"
                    description="Track keywords, URLs, and content across platforms."
                    href="/listening/trackers"
                    features={["Keyword tracking", "URL monitoring", "Platform filtering", "Trend analysis"]}
                  />
                  <ModuleCard
                    icon={TrendingUp}
                    title="Media Buying"
                    description="Manage ad accounts, budgets, and campaign spend."
                    href="/mediabuying"
                    features={["Budget management", "Platform accounts", "Spend tracking", "ROI reporting"]}
                  />
                  <ModuleCard
                    icon={BarChart3}
                    title="Analytics"
                    description="Performance dashboards and campaign reporting."
                    href="/analytics"
                    features={["Custom dashboards", "Platform analytics", "Creator tracking", "Campaign metrics"]}
                  />
                  <ModuleCard
                    icon={Layers}
                    title="Builder"
                    description="Create custom dashboards and report templates."
                    href="/builder"
                    features={["Drag-and-drop", "Widget library", "Data sources", "Export options"]}
                  />
                </div>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "client-portal" && (
            <ExpandedSection title="Client Portal" icon={Globe} iconColor="text-amber-500">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  The Client Portal provides a dedicated space for external clients to review work,
                  approve deliverables, and access project reports.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <ModuleCard
                    icon={LayoutDashboard}
                    title="Portal Dashboard"
                    description="Client overview of their projects and pending items."
                    href="/portal"
                    features={["Project summary", "Pending approvals", "Recent activity", "Quick links"]}
                  />
                  <ModuleCard
                    icon={CheckCircle}
                    title="Approvals"
                    description="Review and approve briefs and deliverables."
                    href="/portal/approvals"
                    features={["Pending queue", "Approve/reject", "Comments", "Version history"]}
                  />
                  <ModuleCard
                    icon={FileText}
                    title="Deliverables"
                    description="Access completed work and download files."
                    href="/portal/deliverables"
                    features={["File downloads", "Status tracking", "Feedback", "Archive access"]}
                  />
                  <ModuleCard
                    icon={BarChart3}
                    title="Reports"
                    description="View project reports and analytics."
                    href="/portal/reports"
                    features={["Time reports", "Budget status", "Performance metrics", "Export options"]}
                  />
                </div>

                <section className="bg-blue-500/10 border border-blue-500/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Setting Up Client Access</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Create a user with CLIENT permission level</li>
                    <li>Link them to their client account</li>
                    <li>Share the portal login URL with them</li>
                    <li>They'll only see projects for their client</li>
                  </ol>
                </section>
              </div>
            </ExpandedSection>
          )}
        </TabsContent>

        {/* ========== TECHNICAL DOCUMENTATION ========== */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DocCard
              icon={Code}
              iconColor="text-gray-500"
              title="Architecture"
              description="System design and tech stack"
              isActive={activeSection === "architecture"}
              onClick={() => setActiveSection(activeSection === "architecture" ? null : "architecture")}
            />
            <DocCard
              icon={Key}
              iconColor="text-green-500"
              title="API Reference"
              description="Endpoints and integration"
              href="/admin/settings/api"
            />
            <DocCard
              icon={Database}
              iconColor="text-blue-500"
              title="Database Schema"
              description="Data models and relationships"
              isActive={activeSection === "database"}
              onClick={() => setActiveSection(activeSection === "database" ? null : "database")}
            />
          </div>

          {activeSection === "architecture" && (
            <ExpandedSection title="Architecture" icon={Code} iconColor="text-gray-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Technology Stack</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Frontend</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Next.js 14</strong> - React framework with App Router</li>
                        <li>• <strong>TypeScript</strong> - Type-safe development</li>
                        <li>• <strong>Tailwind CSS</strong> - Utility-first styling</li>
                        <li>• <strong>shadcn/ui</strong> - Component library</li>
                        <li>• <strong>Lucide Icons</strong> - Icon system</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Backend</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Next.js API Routes</strong> - REST API</li>
                        <li>• <strong>Prisma</strong> - Database ORM</li>
                        <li>• <strong>PostgreSQL</strong> - Primary database</li>
                        <li>• <strong>Supabase Auth</strong> - Authentication</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Core Principles</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Multi-tenant Architecture</strong> - All data is isolated by organizationId</li>
                    <li>• <strong>Server-First</strong> - Use Server Components and Server Actions by default</li>
                    <li>• <strong>Config-Driven</strong> - Tenant behavior defined in /config, never hardcoded</li>
                    <li>• <strong>Type Safety</strong> - Full TypeScript with strict mode enabled</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Project Structure</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`/src
  /app              # Next.js App Router pages
    /(auth)         # Login, signup
    /(platform)     # Main app (protected)
    /portal         # Client portal
    /api            # REST API routes

  /components
    /ui             # shadcn/ui components
    /layout         # Shell, sidebar, header

  /lib
    prisma.ts       # Database client
    auth.ts         # Authentication config`}
                  </pre>
                </section>
              </div>
            </ExpandedSection>
          )}

          {activeSection === "database" && (
            <ExpandedSection title="Database Schema" icon={Database} iconColor="text-blue-500">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-3">Core Entities</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { name: "Organization", desc: "Multi-tenant root entity" },
                      { name: "User", desc: "Team members with permission levels" },
                      { name: "Client", desc: "Client accounts (CCAD, DET, etc.)" },
                      { name: "Project", desc: "Project and retainer containers" },
                      { name: "Brief", desc: "Work items with 7 types" },
                      { name: "TimeEntry", desc: "Logged hours with billable flag" },
                      { name: "LeaveRequest", desc: "Time off requests" },
                      { name: "RFP", desc: "Request for proposals" },
                    ].map((entity) => (
                      <div key={entity.name} className="p-3 border rounded-lg">
                        <Badge variant="outline" className="font-mono mb-1">{entity.name}</Badge>
                        <p className="text-sm text-muted-foreground">{entity.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Key Relationships</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Organization → Users</strong> - One org has many users</li>
                    <li>• <strong>Client → Projects → Briefs</strong> - Hierarchical work structure</li>
                    <li>• <strong>User → TimeEntries</strong> - Users log time against briefs</li>
                    <li>• <strong>User → LeaveRequests</strong> - Users request time off</li>
                    <li>• <strong>Brief → TimeEntries</strong> - Track hours per brief</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-3">Enums</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-1 text-sm">BriefStatus</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        DRAFT, SUBMITTED, APPROVED, IN_PROGRESS, IN_REVIEW, COMPLETED, CANCELLED
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-1 text-sm">BriefType</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        VIDEO_SHOOT, VIDEO_EDIT, DESIGN, COPYWRITING_EN, COPYWRITING_AR, PAID_MEDIA, RFP
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-1 text-sm">PermissionLevel</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        ADMIN, LEADERSHIP, TEAM_LEAD, STAFF, FREELANCER, CLIENT
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-1 text-sm">LeaveType</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        ANNUAL, SICK, UNPAID, MATERNITY, PATERNITY, COMPASSIONATE, STUDY
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </ExpandedSection>
          )}
        </TabsContent>

        {/* ========== ADDITIONAL RESOURCES ========== */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Repository
                </CardTitle>
                <CardDescription>View source code and contribute</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access the SpokeStack source code, report issues, and contribute to development.
                </p>
                <Button variant="outline" asChild>
                  <a href="https://github.com/willhutson/erp_staging_lmtd" target="_blank" rel="noopener noreferrer">
                    Open GitHub <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Having issues or questions? Reach out to our support team for assistance.
                </p>
                <Button variant="outline" asChild>
                  <a href="mailto:support@spokestack.io">
                    support@spokestack.io <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Frequently accessed pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  { label: "My Briefs", href: "/briefs/my" },
                  { label: "Time Tracking", href: "/time" },
                  { label: "Request Leave", href: "/leave/request" },
                  { label: "Team Directory", href: "/team" },
                  { label: "My Profile", href: "/admin/settings/profile" },
                  { label: "API Reference", href: "/admin/settings/api" },
                ].map((link) => (
                  <Button key={link.href} variant="ghost" className="justify-start" asChild>
                    <Link href={link.href}>
                      <ChevronRight className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Components

function DocCard({
  icon: Icon,
  iconColor,
  title,
  description,
  href,
  isActive,
  onClick,
}: {
  icon: typeof BookOpen;
  iconColor: string;
  title: string;
  description: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <Card className={`cursor-pointer hover:shadow-md transition-all ${isActive ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-sm text-primary mt-2 flex items-center gap-1">
          {href ? "View docs" : isActive ? "Hide" : "Read guide"}
          <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "rotate-90" : ""}`} />
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

function ExpandedSection({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-in slide-in-from-top-2 duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  href,
  features,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  href: string;
  features: string[];
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          {features.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={href}>
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
