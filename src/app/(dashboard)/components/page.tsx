"use client"

import { useState, useEffect } from "react"
import { StatsGrid, StatCard } from "@/components/ltd/patterns/stats-grid"
import { FilterBar, FilterSelect, FilterChip } from "@/components/ltd/patterns/filter-bar"
import { SectionCard, SectionGrid } from "@/components/ltd/patterns/section-card"
import { KanbanBoard, KanbanColumn, KanbanCard } from "@/components/ltd/patterns/kanban"
import { WidgetCard, WidgetListItem, WidgetProgress } from "@/components/ltd/patterns/widget-card"
import { FormField, FormSection, FormRow, FormActions, FormHeader } from "@/components/ltd/patterns/form-field"
import {
  DetailPageHeader,
  DetailPageLayout,
  DetailPageContent,
  DetailPageSidebar,
  DetailField,
  DetailFieldGroup,
  DetailSection,
  DetailTabs,
  Timeline,
  TimelineItem,
} from "@/components/ltd/patterns/detail-page"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdInput } from "@/components/ltd/primitives/ltd-input"
import { LtdTextarea } from "@/components/ltd/primitives/ltd-textarea"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { LtdTabs } from "@/components/ltd/primitives/ltd-tabs"
import { TimePeriodSelector, TimePeriodChips, useTimePeriod, type TimePeriodValue } from "@/components/ltd/primitives/ltd-time-period"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Edit,
  Trash,
  MessageSquare,
  Upload,
  Send,
  Sun,
  Moon,
  Inbox,
  Search,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  FolderOpen,
  Plus,
  Calendar,
} from "lucide-react"
import { setDensity } from "@/lib/design/modes"

type UserRole = "admin" | "leadership" | "team_lead" | "staff" | "freelancer"

const roleLabels: Record<UserRole, string> = {
  admin: "Admin (Will, Afaq, Albert)",
  leadership: "Leadership (CJ, Ted, Salma)",
  team_lead: "Team Lead (Klaudia, Rozanne)",
  staff: "Staff (27 employees)",
  freelancer: "Freelancer (6 contractors)",
}

const tabs = [
  { value: "stats", label: "Stats & Metrics" },
  { value: "filters", label: "Filters & Tables" },
  { value: "kanban", label: "Pipeline / Kanban" },
  { value: "widgets", label: "Dashboard Widgets" },
  { value: "forms", label: "Forms" },
  { value: "cards", label: "Cards & Sections" },
  { value: "details", label: "Detail Pages" },
  { value: "states", label: "Empty / Loading / Error" },
]

type Density = "compact" | "standard" | "comfortable"
type Theme = "light" | "dark"

export default function ComponentsShowcase() {
  const [mounted, setMounted] = useState(false)
  const [currentRole, setCurrentRole] = useState<UserRole>("admin")
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [detailTab, setDetailTab] = useState("overview")
  const [timePeriod, setTimePeriod] = useState<TimePeriodValue | undefined>()
  const [density, setDensityState] = useState<Density>("standard")
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    setMounted(true)
    // Read initial theme from localStorage or detect from class
    const stored = localStorage.getItem("theme")
    if (stored === "dark") {
      setThemeState("dark")
    } else if (document.documentElement.classList.contains("dark")) {
      setThemeState("dark")
    } else {
      setThemeState("light")
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleDensityChange = (d: Density) => {
    setDensityState(d)
    setDensity(d)
  }

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="h-32 rounded-lg bg-ltd-surface-2 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Control Panel */}
      <div className="rounded-[var(--ltd-radius-lg)] border-2 border-ltd-primary bg-ltd-primary/5 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-ltd-text-1 mb-4">View as Role</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <LtdButton
                key={role}
                variant={currentRole === role ? "default" : "outline"}
                onClick={() => setCurrentRole(role)}
                size="sm"
              >
                {roleLabels[role]}
              </LtdButton>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-ltd-primary/20">
          {/* Density */}
          <div>
            <h3 className="text-sm font-semibold text-ltd-text-2 mb-3">Density</h3>
            <div className="flex gap-2">
              {(["compact", "standard", "comfortable"] as Density[]).map((d) => (
                <LtdButton
                  key={d}
                  variant={density === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDensityChange(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </LtdButton>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-semibold text-ltd-text-2 mb-3">Theme</h3>
            <div className="flex gap-2">
              <LtdButton
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-1" /> Light
              </LtdButton>
              <LtdButton
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-1" /> Dark
              </LtdButton>
            </div>
          </div>
        </div>
      </div>

      <LtdTabs defaultValue="stats" tabs={tabs} className="space-y-6">
        {/* Stats Tab */}
        <div data-tab="stats" className="space-y-6">
          <h3 className="text-lg font-semibold text-ltd-text-1">
            Stats View for: {roleLabels[currentRole]}
          </h3>

          {/* Admin/Leadership sees everything */}
          {(currentRole === "admin" || currentRole === "leadership") && (
            <StatsGrid columns={4}>
              <StatCard
                label="Total Revenue"
                value="$1.2M"
                change={12}
                trend="up"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatCard
                label="Active Clients"
                value="4"
                change={0}
                trend="neutral"
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Pipeline Value"
                value="$450K"
                change={8}
                trend="up"
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <StatCard
                label="Team Utilization"
                value="78%"
                change={-3}
                trend="down"
                icon={<Users className="h-5 w-5" />}
              />
            </StatsGrid>
          )}

          {/* Team Lead sees team metrics */}
          {currentRole === "team_lead" && (
            <StatsGrid columns={4}>
              <StatCard
                label="Team Members"
                value="8"
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Active Briefs"
                value="12"
                change={4}
                trend="up"
                icon={<FileText className="h-5 w-5" />}
              />
              <StatCard
                label="Team Utilization"
                value="82%"
                change={5}
                trend="up"
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <StatCard
                label="Pending Reviews"
                value="3"
                icon={<Clock className="h-5 w-5" />}
              />
            </StatsGrid>
          )}

          {/* Staff sees personal metrics */}
          {currentRole === "staff" && (
            <StatsGrid columns={3}>
              <StatCard
                label="My Active Briefs"
                value="4"
                icon={<FileText className="h-5 w-5" />}
              />
              <StatCard
                label="Hours This Week"
                value="32"
                changeLabel="of 40 target"
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                label="Completed This Month"
                value="8"
                change={15}
                trend="up"
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </StatsGrid>
          )}

          {/* Freelancer sees limited metrics */}
          {currentRole === "freelancer" && (
            <StatsGrid columns={2}>
              <StatCard
                label="Assigned Briefs"
                value="2"
                icon={<FileText className="h-5 w-5" />}
              />
              <StatCard
                label="Hours Logged"
                value="18"
                icon={<Clock className="h-5 w-5" />}
              />
            </StatsGrid>
          )}
        </div>

        {/* Filters Tab */}
        <div data-tab="filters" className="space-y-6">
          {/* Time Period Selectors */}
          <SectionCard
            title="Time Period Filters"
            description="Date range selection for reports and dashboards"
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-ltd-text-2 mb-3">Dropdown Selector</h4>
                <div className="flex items-center gap-4">
                  <TimePeriodSelector
                    value={timePeriod}
                    onChange={setTimePeriod}
                    size="md"
                  />
                  <span className="text-sm text-ltd-text-3">
                    {timePeriod ? `Selected: ${timePeriod.label}` : "Default: Last 30 Days"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ltd-text-2 mb-3">Chip Style (Compact)</h4>
                <TimePeriodChips
                  value={timePeriod}
                  onChange={setTimePeriod}
                  presets={["last_7_days", "last_30_days", "this_month", "this_quarter"]}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-ltd-text-2 mb-3">Small Size</h4>
                <TimePeriodSelector
                  value={timePeriod}
                  onChange={setTimePeriod}
                  size="sm"
                />
              </div>
            </div>
          </SectionCard>

          <FilterBar
            searchValue={searchValue}
            searchPlaceholder="Search briefs..."
            onSearchChange={setSearchValue}
            showClear={!!(searchValue || statusFilter)}
            onClear={() => {
              setSearchValue("")
              setStatusFilter("")
            }}
          >
            <FilterSelect
              label="All Statuses"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "Draft", value: "draft" },
                { label: "In Progress", value: "in_progress" },
                { label: "In Review", value: "in_review" },
                { label: "Completed", value: "completed" },
              ]}
            />
            {(currentRole === "admin" || currentRole === "leadership" || currentRole === "team_lead") && (
              <FilterSelect
                label="All Assignees"
                value=""
                onChange={() => {}}
                options={[
                  { label: "Klaudia", value: "klaudia" },
                  { label: "Ted", value: "ted" },
                  { label: "Rozanne", value: "rozanne" },
                ]}
              />
            )}
            <TimePeriodSelector
              value={timePeriod}
              onChange={setTimePeriod}
              size="sm"
            />
          </FilterBar>

          {(searchValue || statusFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchValue && (
                <FilterChip label={`Search: ${searchValue}`} onRemove={() => setSearchValue("")} />
              )}
              {statusFilter && (
                <FilterChip label={`Status: ${statusFilter}`} onRemove={() => setStatusFilter("")} />
              )}
            </div>
          )}

          <SectionCard title="Brief Results" description="Filtered brief list">
            <div className="divide-y divide-ltd-border-1">
              {[
                { title: "CCAD Social Campaign", client: "Creative City Abu Dhabi", status: "In Progress" },
                { title: "DET Tourism Video", client: "Dept of Economy & Tourism", status: "In Review" },
                { title: "ADEK Education Post", client: "ADEK", status: "Draft" },
              ].map((brief, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium text-ltd-text-1">{brief.title}</div>
                    <div className="text-sm text-ltd-text-2">{brief.client}</div>
                  </div>
                  <LtdBadge
                    status={
                      brief.status === "In Progress"
                        ? "info"
                        : brief.status === "In Review"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {brief.status}
                  </LtdBadge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Kanban Tab */}
        <div data-tab="kanban" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ltd-text-1">
              {currentRole === "admin" || currentRole === "leadership"
                ? "Deal Pipeline"
                : currentRole === "team_lead"
                ? "Team Brief Pipeline"
                : "My Brief Pipeline"}
            </h3>
            <div className="flex items-center gap-3">
              <TimePeriodChips
                value={timePeriod}
                onChange={setTimePeriod}
                presets={["this_month", "this_quarter", "this_year", "all_time"]}
              />
              <TimePeriodSelector
                value={timePeriod}
                onChange={setTimePeriod}
                size="sm"
                presets={["this_month", "last_month", "this_quarter", "last_quarter", "this_year", "all_time"]}
              />
            </div>
          </div>

          {/* Filter context indicator */}
          {timePeriod && timePeriod.preset !== "all_time" && (
            <div className="flex items-center gap-2 text-sm text-ltd-text-2 bg-ltd-surface-2 px-3 py-2 rounded-[var(--ltd-radius-md)]">
              <Calendar className="w-4 h-4" />
              <span>Showing deals from <strong className="text-ltd-text-1">{timePeriod.label}</strong></span>
              <button
                onClick={() => setTimePeriod(undefined)}
                className="ml-auto text-ltd-text-3 hover:text-ltd-text-1"
              >
                Clear
              </button>
            </div>
          )}

          <KanbanBoard>
            <KanbanColumn title="Lead" count={3} color="#718096">
              <KanbanCard
                title="New Tourism Client"
                subtitle="Initial contact"
                meta={[{ label: "Value", value: "$50K" }]}
                avatar={{ initials: "CJ", color: "#52EDC7" }}
                lastActivity={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
              />
              <KanbanCard
                title="Tech Startup"
                subtitle="Discovery call scheduled"
                meta={[{ label: "Value", value: "$30K" }]}
                avatar={{ initials: "SA", color: "#7B61FF" }}
                lastActivity={new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)}
                staleDays={14}
              />
            </KanbanColumn>

            <KanbanColumn title="Pitch" count={2} color="#4D9CFF">
              <KanbanCard
                title="Government Entity"
                subtitle="Proposal due Friday"
                status="High Priority"
                statusVariant="warning"
                meta={[{ label: "Value", value: "$120K" }]}
                avatar={{ initials: "WH", color: "#52EDC7" }}
              />
            </KanbanColumn>

            <KanbanColumn title="Negotiation" count={1} color="#FFB547">
              <KanbanCard
                title="Hotel Chain"
                subtitle="Contract review"
                meta={[{ label: "Value", value: "$80K" }]}
                avatar={{ initials: "HG", color: "#FF6B9D" }}
                lastActivity={new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)}
              />
            </KanbanColumn>

            <KanbanColumn title="Won" count={4} color="#00D68F">
              <KanbanCard
                title="CCAD Retainer"
                subtitle="160 hrs/month"
                status="Active"
                statusVariant="success"
                meta={[{ label: "Value", value: "$160K/yr" }]}
              />
            </KanbanColumn>
          </KanbanBoard>
        </div>

        {/* Widgets Tab */}
        <div data-tab="widgets" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WidgetCard title="My Tasks" subtitle="Due this week">
            <WidgetListItem
              title="Review CCAD designs"
              subtitle="Due tomorrow"
              status={<LtdBadge status="warning">Urgent</LtdBadge>}
            />
            <WidgetListItem
              title="Submit DET copy"
              subtitle="Due Friday"
              status={<LtdBadge status="info">In Progress</LtdBadge>}
            />
            <WidgetListItem
              title="Team standup"
              subtitle="Today 10am"
              status={<LtdBadge status="neutral">Scheduled</LtdBadge>}
            />
          </WidgetCard>

          <WidgetCard title="Time This Week">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-ltd-text-1">32h</div>
                <div className="text-sm text-ltd-text-2">of 40h target</div>
              </div>
              <WidgetProgress label="Utilization" value={80} color="primary" />
              <WidgetProgress label="Billable" value={75} color="success" />
            </div>
          </WidgetCard>

          {(currentRole === "admin" || currentRole === "leadership") && (
            <WidgetCard title="Pipeline Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Total Value</span>
                  <span className="font-semibold text-ltd-text-1">$450K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Weighted</span>
                  <span className="font-semibold text-ltd-text-1">$180K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Win Rate</span>
                  <span className="font-semibold text-ltd-success">42%</span>
                </div>
              </div>
            </WidgetCard>
          )}

          {(currentRole === "team_lead" || currentRole === "admin") && (
            <WidgetCard title="Team Capacity">
              <div className="space-y-3">
                <WidgetProgress label="Klaudia" value={90} color="warning" />
                <WidgetProgress label="Ted" value={75} color="success" />
                <WidgetProgress label="Nejib" value={60} color="primary" />
                <WidgetProgress label="John" value={45} color="primary" />
              </div>
            </WidgetCard>
          )}

          <WidgetCard title="Recent Activity">
            <WidgetListItem
              title="Brief submitted"
              subtitle="CCAD Social Campaign • 2h ago"
            />
            <WidgetListItem
              title="Comment added"
              subtitle="DET Video Edit • 4h ago"
            />
            <WidgetListItem
              title="Status changed"
              subtitle="ADEK Design → In Review • 1d ago"
            />
          </WidgetCard>
        </div>

        {/* Forms Tab */}
        <div data-tab="forms">
          <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-6">
            <FormHeader title="New Brief" description="Create a new design brief">
              <LtdButton variant="outline">Cancel</LtdButton>
              <LtdButton>Create Brief</LtdButton>
            </FormHeader>

            <div className="space-y-8">
              <FormSection title="Basic Information" description="Brief details and client">
                <FormRow>
                  <FormField label="Brief Title" required>
                    <LtdInput placeholder="Enter brief title" />
                  </FormField>
                  <FormField label="Client" required>
                    <select className="w-full h-[var(--ltd-density-control-height)] rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-overlay px-3 text-sm">
                      <option>Select client...</option>
                      <option>Creative City Abu Dhabi</option>
                      <option>Dept of Economy & Tourism</option>
                      <option>ADEK</option>
                    </select>
                  </FormField>
                </FormRow>
                <FormField label="Description" description="Detailed brief requirements">
                  <LtdTextarea placeholder="Describe the brief..." rows={4} />
                </FormField>
              </FormSection>

              <FormSection title="Timeline" description="Deadlines and scheduling">
                <FormRow columns={3}>
                  <FormField label="Start Date">
                    <LtdInput type="date" />
                  </FormField>
                  <FormField label="Due Date" required>
                    <LtdInput type="date" />
                  </FormField>
                  <FormField label="Estimated Hours">
                    <LtdInput type="number" placeholder="0" />
                  </FormField>
                </FormRow>
              </FormSection>

              {(currentRole === "admin" || currentRole === "leadership" || currentRole === "team_lead") && (
                <FormSection title="Assignment" description="Team member assignment">
                  <FormRow>
                    <FormField label="Assignee">
                      <select className="w-full h-[var(--ltd-density-control-height)] rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-overlay px-3 text-sm">
                        <option>Select team member...</option>
                        <option>Klaudia Pszczolinska</option>
                        <option>Ted Totsidis</option>
                        <option>Nejib Ben Ayed</option>
                      </select>
                    </FormField>
                    <FormField label="Priority">
                      <select className="w-full h-[var(--ltd-density-control-height)] rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-overlay px-3 text-sm">
                        <option>Normal</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </FormField>
                  </FormRow>
                </FormSection>
              )}
            </div>
          </div>
        </div>

        {/* Cards Tab */}
        <div data-tab="cards">
          <SectionGrid columns={2}>
            <SectionCard title="Client Overview" description="CCAD account details">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Industry</span>
                  <span className="text-ltd-text-1">Government</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Retainer</span>
                  <span className="text-ltd-text-1">160 hrs/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Account Manager</span>
                  <span className="text-ltd-text-1">CJ Holland</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ltd-text-2">Status</span>
                  <LtdBadge status="success">Active</LtdBadge>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Recent Briefs"
              actions={<LtdButton variant="outline" size="sm">View All</LtdButton>}
              noPadding
            >
              <div className="divide-y divide-ltd-border-1">
                {["Social Campaign Q1", "Video Series", "Brand Guidelines"].map((brief, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3">
                    <span className="text-ltd-text-1">{brief}</span>
                    <LtdBadge status={i === 0 ? "info" : i === 1 ? "warning" : "success"}>
                      {i === 0 ? "Active" : i === 1 ? "Review" : "Done"}
                    </LtdBadge>
                  </div>
                ))}
              </div>
            </SectionCard>
          </SectionGrid>
        </div>

        {/* Detail Pages Tab */}
        <div data-tab="details" className="space-y-6">
          <DetailPageHeader
            title="CCAD Social Campaign Q1"
            subtitle="Video Shoot brief for Creative City Abu Dhabi"
            badge={{ label: "In Progress", status: "info" }}
            backHref="/briefs"
            backLabel="All Briefs"
            actions={
              <>
                {(currentRole === "admin" || currentRole === "leadership" || currentRole === "team_lead") && (
                  <>
                    <LtdButton variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </LtdButton>
                    <LtdButton variant="outline" size="sm">
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </LtdButton>
                  </>
                )}
                <LtdButton size="sm">
                  <Send className="h-4 w-4 mr-1" /> Submit for Review
                </LtdButton>
              </>
            }
          />

          <DetailTabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "comments", label: "Comments", count: 5 },
              { id: "files", label: "Files", count: 12 },
              { id: "activity", label: "Activity" },
            ]}
            activeTab={detailTab}
            onTabChange={setDetailTab}
          />

          <DetailPageLayout>
            <DetailPageContent>
              {detailTab === "overview" && (
                <DetailSection title="Brief Details" description="Core information about this brief">
                  <div className="prose prose-sm max-w-none text-ltd-text-1">
                    <p>
                      Create a series of social media videos showcasing the Creative City Abu Dhabi cultural events
                      for Q1 2025. The content should highlight the art exhibitions, music performances, and
                      community workshops planned for the season.
                    </p>
                    <h4>Deliverables</h4>
                    <ul>
                      <li>4x 60-second videos for Instagram Reels</li>
                      <li>4x 15-second teasers for Stories</li>
                      <li>1x 3-minute hero video for website</li>
                    </ul>
                    <h4>Requirements</h4>
                    <ul>
                      <li>Bilingual captions (English/Arabic)</li>
                      <li>Brand guidelines compliance</li>
                      <li>Music licensing approved</li>
                    </ul>
                  </div>
                </DetailSection>
              )}

              {detailTab === "comments" && (
                <DetailSection title="Comments" actions={<LtdButton size="sm"><MessageSquare className="h-4 w-4 mr-1" /> Add Comment</LtdButton>}>
                  <div className="space-y-4">
                    {[
                      { author: "CJ Holland", text: "Looking great! Just need to finalize the music selection.", time: "2 hours ago" },
                      { author: "Klaudia Pszczolinska", text: "Updated the color grading as requested.", time: "Yesterday" },
                      { author: "Ted Totsidis", text: "Can we add more b-roll of the art installations?", time: "2 days ago" },
                    ].map((comment, i) => (
                      <div key={i} className="rounded-lg bg-ltd-surface-2 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-ltd-text-1">{comment.author}</span>
                          <span className="text-xs text-ltd-text-3">{comment.time}</span>
                        </div>
                        <p className="text-sm text-ltd-text-2">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {detailTab === "files" && (
                <DetailSection title="Files" actions={<LtdButton size="sm"><Upload className="h-4 w-4 mr-1" /> Upload</LtdButton>}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { name: "Hero_Video_v3.mp4", size: "245 MB", type: "video" },
                      { name: "Reel_1_Final.mp4", size: "42 MB", type: "video" },
                      { name: "Storyboard.pdf", size: "2.4 MB", type: "document" },
                      { name: "Music_License.pdf", size: "156 KB", type: "document" },
                    ].map((file, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-ltd-border-1 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ltd-surface-3">
                          <FileText className="h-5 w-5 text-ltd-text-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ltd-text-1 truncate">{file.name}</div>
                          <div className="text-xs text-ltd-text-3">{file.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {detailTab === "activity" && (
                <DetailSection title="Activity Timeline">
                  <Timeline>
                    <TimelineItem
                      title="Status changed to In Progress"
                      description="Brief moved from Draft to In Progress"
                      timestamp="Dec 20, 2024 at 2:30 PM"
                      icon={<CheckCircle className="h-4 w-4" />}
                    />
                    <TimelineItem
                      title="Comment added"
                      description="CJ Holland left a comment"
                      timestamp="Dec 20, 2024 at 11:15 AM"
                      icon={<MessageSquare className="h-4 w-4" />}
                    />
                    <TimelineItem
                      title="File uploaded"
                      description="Hero_Video_v3.mp4 was uploaded by Klaudia"
                      timestamp="Dec 19, 2024 at 4:45 PM"
                      icon={<Upload className="h-4 w-4" />}
                    />
                    <TimelineItem
                      title="Brief created"
                      description="Brief was created by CJ Holland"
                      timestamp="Dec 15, 2024 at 9:00 AM"
                      icon={<FileText className="h-4 w-4" />}
                      isLast
                    />
                  </Timeline>
                </DetailSection>
              )}
            </DetailPageContent>

            <DetailPageSidebar>
              <DetailFieldGroup title="Details">
                <DetailField label="Client" value="Creative City Abu Dhabi" />
                <DetailField label="Brief Type" value="Video Shoot" />
                <DetailField label="Due Date" value="Jan 15, 2025" />
                <DetailField label="Estimated Hours" value="40" />
              </DetailFieldGroup>

              <DetailFieldGroup title="Assignment">
                <DetailField
                  label="Assignee"
                  value={
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-ltd-primary flex items-center justify-center text-xs font-medium text-white">
                        KP
                      </div>
                      <span>Klaudia Pszczolinska</span>
                    </div>
                  }
                />
                <DetailField
                  label="Account Manager"
                  value={
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#7B61FF] flex items-center justify-center text-xs font-medium text-white">
                        CJ
                      </div>
                      <span>CJ Holland</span>
                    </div>
                  }
                />
              </DetailFieldGroup>

              {(currentRole === "admin" || currentRole === "leadership" || currentRole === "team_lead") && (
                <DetailFieldGroup title="Time Tracking">
                  <DetailField label="Logged" value="28 of 40 hours" />
                  <div className="h-2 rounded-full bg-ltd-surface-3 overflow-hidden">
                    <div className="h-full bg-ltd-primary" style={{ width: "70%" }} />
                  </div>
                </DetailFieldGroup>
              )}
            </DetailPageSidebar>
          </DetailPageLayout>
        </div>

        {/* States Tab */}
        <div data-tab="states" className="space-y-8">
          <h3 className="text-lg font-semibold text-ltd-text-1">
            UI States for Different Scenarios
          </h3>

          {/* Empty States */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-ltd-text-2">Empty States</h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* No Data */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-surface-3 flex items-center justify-center mb-4">
                  <Inbox className="w-6 h-6 text-ltd-text-3" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">No briefs yet</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  Create your first brief to get started with project management.
                </p>
                <LtdButton size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Create Brief
                </LtdButton>
              </div>

              {/* No Search Results */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-surface-3 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-ltd-text-3" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">No results found</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <LtdButton variant="outline" size="sm">Clear Filters</LtdButton>
              </div>

              {/* Empty Folder */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-surface-3 flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-ltd-text-3" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">No files uploaded</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  Drag and drop files here or click to upload.
                </p>
                <LtdButton variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" /> Upload Files
                </LtdButton>
              </div>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-ltd-text-2">Loading States</h4>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Skeleton Card */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-ltd-surface-3 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-ltd-surface-3 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-ltd-surface-3 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-ltd-surface-3 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-ltd-surface-3 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-ltd-surface-3 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-ltd-surface-3 rounded animate-pulse" />
                </div>
              </div>

              {/* Skeleton List */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay divide-y divide-ltd-border-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-ltd-surface-3 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-ltd-surface-3 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-ltd-surface-3 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-ltd-surface-3 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Skeleton Stats Grid */}
              <div className="grid grid-cols-4 gap-4 col-span-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4 space-y-3">
                    <div className="h-3 w-20 bg-ltd-surface-3 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-ltd-surface-3 rounded animate-pulse" />
                    <div className="h-2 w-12 bg-ltd-surface-3 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Spinner State */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-12 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-ltd-surface-3" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-ltd-primary border-t-transparent animate-spin" />
                </div>
                <p className="mt-4 text-sm text-ltd-text-2">Loading briefs...</p>
              </div>
            </div>
          </div>

          {/* Error States */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-ltd-text-2">Error States</h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Generic Error */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-error/30 bg-ltd-error/5 p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-error/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-ltd-error" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">Something went wrong</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  We couldn't load your briefs. Please try again.
                </p>
                <LtdButton variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" /> Retry
                </LtdButton>
              </div>

              {/* Connection Error */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-warning/30 bg-ltd-warning/5 p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-warning/10 flex items-center justify-center mb-4">
                  <WifiOff className="w-6 h-6 text-ltd-warning" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">No internet connection</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  Please check your connection and try again.
                </p>
                <LtdButton variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" /> Retry
                </LtdButton>
              </div>

              {/* Permission Error */}
              <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-ltd-surface-3 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-ltd-text-3" />
                </div>
                <h5 className="font-medium text-ltd-text-1 mb-1">Access restricted</h5>
                <p className="text-sm text-ltd-text-2 mb-4">
                  You don't have permission to view this content.
                </p>
                <LtdButton variant="outline" size="sm">Request Access</LtdButton>
              </div>
            </div>
          </div>

          {/* Inline States */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-ltd-text-2">Inline States (within content)</h4>
            <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
              <div className="p-4 border-b border-ltd-border-1">
                <h5 className="font-medium text-ltd-text-1">Briefs</h5>
              </div>

              {/* Inline Loading */}
              <div className="p-4 border-b border-ltd-border-1 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-ltd-primary border-t-transparent animate-spin" />
                <span className="text-sm text-ltd-text-2">Loading more briefs...</span>
              </div>

              {/* Inline Error */}
              <div className="p-4 border-b border-ltd-border-1 flex items-center justify-between bg-ltd-error/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-ltd-error" />
                  <span className="text-sm text-ltd-text-1">Failed to load recent briefs</span>
                </div>
                <button className="text-sm text-ltd-primary hover:underline">Retry</button>
              </div>

              {/* Inline Empty */}
              <div className="p-8 text-center">
                <p className="text-sm text-ltd-text-2">No briefs match your filters</p>
              </div>
            </div>
          </div>

          {/* Toast / Alert Banners */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-ltd-text-2">Toast & Alert Banners</h4>
            <div className="space-y-3">
              {/* Success Toast */}
              <div className="rounded-[var(--ltd-radius-md)] border border-ltd-success/30 bg-ltd-success/10 px-4 py-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-ltd-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ltd-text-1">Brief created successfully</p>
                  <p className="text-xs text-ltd-text-2">Your new brief has been saved and assigned.</p>
                </div>
                <button className="text-ltd-text-2 hover:text-ltd-text-1">&times;</button>
              </div>

              {/* Warning Toast */}
              <div className="rounded-[var(--ltd-radius-md)] border border-ltd-warning/30 bg-ltd-warning/10 px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-ltd-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ltd-text-1">Unsaved changes</p>
                  <p className="text-xs text-ltd-text-2">You have unsaved changes that will be lost.</p>
                </div>
                <button className="text-ltd-text-2 hover:text-ltd-text-1">&times;</button>
              </div>

              {/* Error Toast */}
              <div className="rounded-[var(--ltd-radius-md)] border border-ltd-error/30 bg-ltd-error/10 px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-ltd-error flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ltd-text-1">Upload failed</p>
                  <p className="text-xs text-ltd-text-2">File exceeds maximum size of 50MB.</p>
                </div>
                <button className="text-ltd-text-2 hover:text-ltd-text-1">&times;</button>
              </div>

              {/* Info Toast */}
              <div className="rounded-[var(--ltd-radius-md)] border border-ltd-primary/30 bg-ltd-primary/10 px-4 py-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-ltd-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ltd-text-1">Auto-saving...</p>
                  <p className="text-xs text-ltd-text-2">Your changes are being saved automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LtdTabs>
    </div>
  )
}
