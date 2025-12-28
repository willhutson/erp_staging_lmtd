"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Clock,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  FolderKanban,
  Building2,
  Activity,
  BookOpen,
  Zap,
  Shield,
  Target,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          SpokeStack Documentation
        </h1>
        <p className="text-muted-foreground mt-2">
          Product specifications, user guides, and module documentation
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">Version 1.0</Badge>
          <Badge variant="outline">Last updated: December 2024</Badge>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              New to SpokeStack? Start with Briefs and Time Tracking below.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              See Team Directory section for permission levels.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              API Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings/api" className="text-sm text-primary hover:underline">
              View API documentation →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <Tabs defaultValue="briefs" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="briefs" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            Briefs
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-4 w-4" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="rfp" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Briefcase className="h-4 w-4" />
            RFP
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* ========== BRIEFS ========== */}
        <TabsContent value="briefs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Briefs Module
              </CardTitle>
              <CardDescription>Creative brief management and workflow system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      The Briefs module is the core work management system for creative projects at TeamLMTD.
                      Each brief represents a discrete piece of work with a defined scope, deadline, and deliverables.
                      Briefs track work from initial request through completion, enabling visibility across the team.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Entities</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Brief</strong> - The work item with title, type, status, deadline</li>
                      <li>• <strong>Client</strong> - The client account the work is for</li>
                      <li>• <strong>Project</strong> - Optional grouping for related briefs</li>
                      <li>• <strong>Assignee</strong> - Team member responsible for delivery</li>
                      <li>• <strong>Time Entries</strong> - Hours logged against the brief</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Brief Types</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { type: "VIDEO_SHOOT", desc: "On-location or studio video production", naming: "Shoot: [Client] – [Topic]" },
                    { type: "VIDEO_EDIT", desc: "Post-production editing and effects", naming: "Edit: [Client] – [Topic]" },
                    { type: "DESIGN", desc: "Graphic design and visual assets", naming: "Design: [Client] – [Topic]" },
                    { type: "COPYWRITING_EN", desc: "English copywriting and content", naming: "Copy: [Client] – [Topic]" },
                    { type: "COPYWRITING_AR", desc: "Arabic copywriting and content", naming: "Copy: [Client] – [Topic]" },
                    { type: "PAID_MEDIA", desc: "Paid advertising campaigns", naming: "Paid Media: [Client] – [Topic]" },
                  ].map((item) => (
                    <div key={item.type} className="p-3 border rounded-lg">
                      <Badge variant="outline" className="font-mono text-xs mb-2">{item.type}</Badge>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">Naming: {item.naming}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Status Workflow</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { status: "DRAFT", color: "bg-gray-500" },
                      { status: "SUBMITTED", color: "bg-blue-500" },
                      { status: "APPROVED", color: "bg-indigo-500" },
                      { status: "IN_PROGRESS", color: "bg-amber-500" },
                      { status: "IN_REVIEW", color: "bg-purple-500" },
                      { status: "COMPLETED", color: "bg-green-500" },
                      { status: "CANCELLED", color: "bg-red-500" },
                    ].map((s) => (
                      <Badge key={s.status} className={s.color}>{s.status}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>DRAFT</strong> → Work in progress, not yet submitted for approval</p>
                    <p>• <strong>SUBMITTED</strong> → Awaiting team lead/client approval</p>
                    <p>• <strong>APPROVED</strong> → Ready to begin work</p>
                    <p>• <strong>IN_PROGRESS</strong> → Active work underway</p>
                    <p>• <strong>IN_REVIEW</strong> → Work complete, pending client review</p>
                    <p>• <strong>COMPLETED</strong> → Delivered and accepted</p>
                    <p>• <strong>CANCELLED</strong> → Work stopped, not to be completed</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">User Guide</h3>
                <div className="space-y-4">
                  <CollapsibleSection title="Creating a Brief">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Navigate to Briefs → Click "New Brief"</li>
                      <li>Select the brief type (Video Shoot, Design, etc.)</li>
                      <li>Fill in required fields: Title, Client, Deadline</li>
                      <li>Add description and any specific requirements</li>
                      <li>Save as Draft or Submit for approval</li>
                    </ol>
                  </CollapsibleSection>
                  <CollapsibleSection title="Assigning a Brief">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Open the brief detail page</li>
                      <li>Click the Assignee field</li>
                      <li>Select a team member from the dropdown</li>
                      <li>The assignee will be notified automatically</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Only Team Leads and above can assign briefs.
                    </p>
                  </CollapsibleSection>
                  <CollapsibleSection title="Logging Time">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Open the brief you worked on</li>
                      <li>Click "Log Time" or use the timer</li>
                      <li>Enter hours, description, and date</li>
                      <li>Mark as billable if client-chargeable</li>
                      <li>Submit the time entry</li>
                    </ol>
                  </CollapsibleSection>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Action</th>
                        <th className="text-center p-3">Staff</th>
                        <th className="text-center p-3">Team Lead</th>
                        <th className="text-center p-3">Leadership</th>
                        <th className="text-center p-3">Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { action: "View own briefs", staff: true, lead: true, leadership: true, admin: true },
                        { action: "View all briefs", staff: false, lead: true, leadership: true, admin: true },
                        { action: "Create briefs", staff: true, lead: true, leadership: true, admin: true },
                        { action: "Assign briefs", staff: false, lead: true, leadership: true, admin: true },
                        { action: "Approve briefs", staff: false, lead: true, leadership: true, admin: true },
                        { action: "Delete briefs", staff: false, lead: false, leadership: false, admin: true },
                      ].map((row) => (
                        <tr key={row.action} className="border-t">
                          <td className="p-3">{row.action}</td>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TIME TRACKING ========== */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Time Tracking Module
              </CardTitle>
              <CardDescription>Log hours, track billable time, and generate reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Track time spent on client work and internal tasks. Enables accurate billing,
                      resource utilization analysis, and project cost tracking. Supports both
                      manual entry and live timer functionality.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Manual Entry</strong> - Log hours with date, duration, description</li>
                      <li>• <strong>Live Timer</strong> - Start/stop timer for real-time tracking</li>
                      <li>• <strong>Billable Flag</strong> - Mark time as billable for invoicing</li>
                      <li>• <strong>Project/Brief Link</strong> - Associate time with work items</li>
                      <li>• <strong>Approval Workflow</strong> - Team leads approve entries</li>
                      <li>• <strong>Reports</strong> - By user, client, project, or date range</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">User Guide</h3>
                <div className="space-y-4">
                  <CollapsibleSection title="Logging Time Manually">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Navigate to Time → Click "Add Entry"</li>
                      <li>Select the date and enter hours worked</li>
                      <li>Choose a Brief or Project (optional)</li>
                      <li>Add a description of work completed</li>
                      <li>Toggle billable if client-chargeable</li>
                      <li>Save the entry</li>
                    </ol>
                  </CollapsibleSection>
                  <CollapsibleSection title="Using the Timer">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Click "Start Timer" from Time page or header</li>
                      <li>Select what you're working on (optional)</li>
                      <li>Timer runs in the background</li>
                      <li>Click "Stop" when done</li>
                      <li>Review and edit the entry before saving</li>
                    </ol>
                  </CollapsibleSection>
                  <CollapsibleSection title="Viewing Reports">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Navigate to Time → Reports tab</li>
                      <li>Select date range and grouping (user/client/project)</li>
                      <li>Filter by billable status if needed</li>
                      <li>Export to CSV for payroll or invoicing</li>
                    </ol>
                  </CollapsibleSection>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>All users</strong> can log their own time and view their entries</p>
                  <p>• <strong>Team Leads+</strong> can view and approve team member entries</p>
                  <p>• <strong>Leadership+</strong> can view all entries and run organization-wide reports</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== LEAVE ========== */}
        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Leave Management Module
              </CardTitle>
              <CardDescription>Request time off, track balances, and manage approvals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage employee time off requests, track leave balances, and maintain
                      team availability visibility. Integrates with resource planning to
                      adjust capacity calculations.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Leave Types</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: "ANNUAL", desc: "Paid annual leave" },
                    { type: "SICK", desc: "Illness or medical appointments" },
                    { type: "UNPAID", desc: "Unpaid time off" },
                    { type: "MATERNITY", desc: "Maternity leave" },
                    { type: "PATERNITY", desc: "Paternity leave" },
                    { type: "COMPASSIONATE", desc: "Bereavement or emergency" },
                    { type: "STUDY", desc: "Educational leave" },
                  ].map((t) => (
                    <div key={t.type} className="p-2 border rounded">
                      <Badge variant="outline" className="text-xs">{t.type}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Request Workflow</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
                    <Badge key={status} variant="secondary">{status}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Requests route to the user's team lead. Leadership can approve on behalf of any team.
                  Approved leave automatically updates the employee's balance.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">User Guide</h3>
                <div className="space-y-4">
                  <CollapsibleSection title="Requesting Leave">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Navigate to Leave → Click "Request Leave"</li>
                      <li>Select leave type and date range</li>
                      <li>Add reason (optional but recommended)</li>
                      <li>Submit request</li>
                      <li>Your team lead will be notified</li>
                    </ol>
                  </CollapsibleSection>
                  <CollapsibleSection title="Approving Requests (Team Leads)">
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Go to Leave → Approvals tab</li>
                      <li>Review pending requests from your team</li>
                      <li>Check team calendar for conflicts</li>
                      <li>Approve or reject with optional note</li>
                    </ol>
                  </CollapsibleSection>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>All users</strong> can request leave and view own balances</p>
                  <p>• <strong>Team Leads+</strong> can approve/reject team requests</p>
                  <p>• <strong>Leadership+</strong> can view all requests and balances</p>
                  <p>• <strong>Admins</strong> can manually adjust balances</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TEAM ========== */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                Team Directory Module
              </CardTitle>
              <CardDescription>Employee profiles, departments, and org structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Central directory of all team members with profiles, contact info,
                      department assignments, and reporting structure. Foundation for
                      permissions and resource planning.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permission Levels</h3>
                <div className="space-y-2">
                  {[
                    { level: "ADMIN", desc: "Full system access. Can manage users, settings, and all data.", color: "bg-red-500" },
                    { level: "LEADERSHIP", desc: "All data access. Can view RFPs, deals, and run reports.", color: "bg-purple-500" },
                    { level: "TEAM_LEAD", desc: "Team management. Can assign work, approve time/leave.", color: "bg-blue-500" },
                    { level: "STAFF", desc: "Standard access. Can create briefs, log time, request leave.", color: "bg-green-500" },
                    { level: "FREELANCER", desc: "Limited access. Can only see assigned work.", color: "bg-amber-500" },
                    { level: "CLIENT", desc: "Portal access only. Reviews and approves deliverables.", color: "bg-gray-500" },
                  ].map((p) => (
                    <div key={p.level} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge className={`${p.color} font-mono w-28 justify-center`}>{p.level}</Badge>
                      <p className="text-sm text-muted-foreground flex-1">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Profile Fields</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Basic Info</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Name, Email, Phone</li>
                      <li>• Avatar/Profile photo</li>
                      <li>• Job title and Department</li>
                      <li>• Team Lead (reporting to)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Work Details</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Weekly capacity (hours)</li>
                      <li>• Skills and expertise</li>
                      <li>• Hourly rate (for costing)</li>
                      <li>• Contract end date</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">UAE Fields</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Emirates ID + expiry</li>
                      <li>• Passport number + expiry</li>
                      <li>• Visa status + expiry</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Bank Details</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Bank name</li>
                      <li>• Account number</li>
                      <li>• IBAN</li>
                    </ul>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== CLIENTS ========== */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-500" />
                Clients Module
              </CardTitle>
              <CardDescription>Client account management and contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Manage client accounts, contacts, and relationships. Clients are the
                    foundation for projects, briefs, and billing. Each client has a unique
                    code for easy reference (e.g., CCAD, DET, ADEK).
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Client Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500">ACTIVE</Badge>
                  <Badge variant="secondary">INACTIVE</Badge>
                  <Badge variant="outline">PROSPECT</Badge>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Client Fields</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Name & Code</strong> - Company name and short code</li>
                  <li>• <strong>Industry</strong> - Business sector for reporting</li>
                  <li>• <strong>Account Manager</strong> - Internal point of contact</li>
                  <li>• <strong>Billing Currency</strong> - Default for invoicing</li>
                  <li>• <strong>Contacts</strong> - Multiple contacts per client</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>All users</strong> can view clients</p>
                  <p>• <strong>Leadership+</strong> can create and edit clients</p>
                  <p>• <strong>Admins</strong> can archive/delete clients</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== PROJECTS ========== */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-indigo-500" />
                Projects Module
              </CardTitle>
              <CardDescription>Project and retainer management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Projects group related briefs together and provide budget tracking.
                    Supports both fixed-scope projects and ongoing retainers. Track hours
                    and budget utilization in real-time.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Project Types</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: "RETAINER", desc: "Ongoing monthly engagement" },
                    { type: "PROJECT", desc: "Fixed-scope deliverable" },
                    { type: "PITCH", desc: "New business proposal" },
                    { type: "INTERNAL", desc: "Internal company work" },
                  ].map((t) => (
                    <div key={t.type} className="p-2 border rounded">
                      <Badge variant="outline">{t.type}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Budget Tracking</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Hours Budget</strong> - Total hours allocated</li>
                  <li>• <strong>Amount Budget</strong> - Monetary value</li>
                  <li>• <strong>Hours Used</strong> - Sum of time entries</li>
                  <li>• <strong>Utilization %</strong> - Used ÷ Budget</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== RFP ========== */}
        <TabsContent value="rfp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-rose-500" />
                RFP Management Module
              </CardTitle>
              <CardDescription>Track and manage request for proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Track RFPs from receipt through submission and outcome. Manage sub-tasks,
                    deadlines, and team assignments. Leadership-only module for new business pipeline.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">RFP Status Flow</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["VETTING", "ACTIVE", "AWAITING_REVIEW", "SUBMITTED", "CLOSED"].map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Outcomes</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500">WON</Badge>
                  <Badge className="bg-red-500">LOST</Badge>
                  <Badge variant="outline">WITHDRAWN</Badge>
                  <Badge variant="outline">CANCELLED</Badge>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Sub-Items</h3>
                <p className="text-sm text-muted-foreground">
                  Break RFP prep into tasks with assignees and due dates. Track completion %.
                </p>
              </section>

              <section className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <strong>Leadership+ only</strong> - RFPs are restricted to leadership team
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== DEALS ========== */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Deals Pipeline Module
              </CardTitle>
              <CardDescription>Sales pipeline and opportunity tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Track sales opportunities from lead through close. Monitor pipeline value,
                    weighted projections, and win rates. Convert won deals to clients automatically.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Deal Stages</h3>
                <div className="flex flex-wrap gap-2">
                  {["LEAD", "PITCH", "NEGOTIATION", "WON", "LOST"].map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Pipeline Metrics</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Total Value</strong> - Sum of all open deals</li>
                  <li>• <strong>Weighted Value</strong> - Value × probability %</li>
                  <li>• <strong>By Stage</strong> - Count and value per stage</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Deal Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Won deals can be converted to clients with one click. Contact info
                  and owner carry over to the new client record.
                </p>
              </section>

              <section className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <strong>Leadership+ only</strong> - Deals are restricted to leadership team
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== RESOURCES ========== */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Resources Module
              </CardTitle>
              <CardDescription>Team capacity and utilization planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3">Product Specification</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Monitor team capacity, track utilization, and identify availability.
                    Helps with resource allocation and workload balancing. Factors in
                    approved leave for accurate availability.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Capacity Metrics</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Weekly Capacity</strong> - Hours per person (default 40)</li>
                  <li>• <strong>Adjusted Capacity</strong> - Minus approved leave</li>
                  <li>• <strong>Hours Logged</strong> - Time entries for period</li>
                  <li>• <strong>Utilization %</strong> - Logged ÷ Capacity</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Utilization Status</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { status: "Overallocated", range: "≥100%", color: "text-red-500", bg: "bg-red-500/10" },
                    { status: "High", range: "80-99%", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { status: "Good", range: "50-79%", color: "text-green-500", bg: "bg-green-500/10" },
                    { status: "Available", range: "<50%", color: "text-blue-500", bg: "bg-blue-500/10" },
                  ].map((item) => (
                    <div key={item.status} className={`flex items-center gap-3 p-3 rounded-lg ${item.bg}`}>
                      <span className={`font-medium ${item.color}`}>{item.status}</span>
                      <span className="text-sm text-muted-foreground">{item.range}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Views</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Team View</strong> - All members with utilization</li>
                  <li>• <strong>Department View</strong> - Aggregated by department</li>
                  <li>• <strong>Individual View</strong> - Detailed breakdown per person</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>Team Leads+</strong> can view all resource data</p>
                  <p>• <strong>Staff</strong> can view own utilization only</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border rounded-lg hover:bg-muted/50">
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-3 pt-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
