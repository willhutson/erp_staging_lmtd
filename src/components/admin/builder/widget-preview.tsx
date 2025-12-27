"use client";

import { cn } from "@/lib/utils";
import type { UIWidgetTemplate } from "@config/templates/types";
import {
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Zap,
  TrendingUp,
  GitBranch,
  Users,
  Building2,
  Type,
  LayoutGrid,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Zap,
  TrendingUp,
  GitBranch,
  Users,
  Building2,
  Type,
  LayoutGrid,
};

interface WidgetPreviewProps {
  widget: UIWidgetTemplate;
  props: Record<string, unknown>;
  compact?: boolean;
}

// Mock data for previews
const mockTaskItems = [
  { title: "Design homepage mockup", status: "in_progress", priority: "high" },
  { title: "Review client feedback", status: "pending", priority: "medium" },
  { title: "Update brand guidelines", status: "pending", priority: "low" },
];

const mockDeadlineItems = [
  { title: "Website Launch", date: "Dec 29", overdue: false },
  { title: "Q4 Report", date: "Dec 31", overdue: false },
  { title: "Client Review", date: "Jan 2", overdue: false },
];

const mockTimeData = { logged: 32, target: 40 };

const mockNPSData = { score: 72, promoters: 65, passives: 20, detractors: 15 };

const mockPipelineData = [
  { stage: "Vetting", count: 4, value: "45K" },
  { stage: "Active", count: 7, value: "120K" },
  { stage: "Submitted", count: 3, value: "85K" },
];

const mockTeamData = [
  { name: "Sarah M.", capacity: 85 },
  { name: "John D.", capacity: 60 },
  { name: "Alex K.", capacity: 40 },
];

export function WidgetPreview({ widget, props, compact = false }: WidgetPreviewProps) {
  const widgetId = widget.metadata.id;

  // Render different previews based on widget type
  switch (widgetId) {
    case "widget-my-tasks":
      return <MyTasksPreview props={props} compact={compact} />;
    case "widget-upcoming-deadlines":
      return <DeadlinesPreview props={props} compact={compact} />;
    case "widget-recent-briefs":
      return <RecentBriefsPreview props={props} compact={compact} />;
    case "widget-time-logged":
      return <TimeLoggedPreview props={props} compact={compact} />;
    case "widget-quick-actions":
      return <QuickActionsPreview props={props} compact={compact} />;
    case "widget-nps-score":
      return <NPSPreview props={props} compact={compact} />;
    case "widget-pipeline-summary":
      return <PipelinePreview props={props} compact={compact} />;
    case "widget-team-capacity":
      return <TeamCapacityPreview props={props} compact={compact} />;
    case "widget-client-activity":
      return <ClientActivityPreview props={props} compact={compact} />;
    case "widget-section-header":
      return <SectionHeaderPreview props={props} compact={compact} />;
    case "widget-grid-layout":
      return <GridLayoutPreview props={props} compact={compact} />;
    default:
      return <DefaultPreview widget={widget} compact={compact} />;
  }
}

// Individual preview components
function MyTasksPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const limit = Number(props.limit) || 3;
  const items = mockTaskItems.slice(0, Math.min(limit, compact ? 2 : 3));

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-ltd-surface-3/50">
          <div className={cn(
            "w-2 h-2 rounded-full",
            item.status === "in_progress" ? "bg-blue-500" : "bg-gray-300"
          )} />
          <span className={cn("text-xs truncate flex-1", compact && "text-[10px]")}>
            {item.title}
          </span>
          <span className={cn(
            "text-[8px] px-1 py-0.5 rounded",
            item.priority === "high" ? "bg-red-100 text-red-600" :
            item.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
            "bg-gray-100 text-gray-600"
          )}>
            {item.priority}
          </span>
        </div>
      ))}
    </div>
  );
}

function DeadlinesPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const showOverdue = props.showOverdue !== false;
  const items = mockDeadlineItems.slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-1.5 rounded bg-ltd-surface-3/50">
          <span className={cn("text-xs truncate", compact && "text-[10px]")}>
            {item.title}
          </span>
          <span className={cn(
            "text-[10px] font-medium",
            item.overdue && showOverdue ? "text-red-500" : "text-ltd-text-2"
          )}>
            {item.date}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentBriefsPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const items = ["Homepage Redesign", "Social Campaign", "Brand Video"].slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-ltd-surface-3/50">
          <FileText className="h-3 w-3 text-ltd-text-3" />
          <span className={cn("text-xs truncate", compact && "text-[10px]")}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function TimeLoggedPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const showTarget = props.showTarget !== false;
  const target = Number(props.targetHours) || 40;
  const percentage = (mockTimeData.logged / target) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className={cn("text-2xl font-bold text-ltd-text-1", compact && "text-lg")}>
          {mockTimeData.logged}h
        </span>
        {showTarget && (
          <span className="text-xs text-ltd-text-3">/ {target}h target</span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
      <span className="text-[10px] text-ltd-text-3">This Week</span>
    </div>
  );
}

function QuickActionsPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const layout = props.layout || "grid";
  const actions = [
    { icon: FileText, label: "New Brief" },
    { icon: Clock, label: "Log Time" },
    { icon: Users, label: "Team" },
  ];

  if (layout === "list") {
    return (
      <div className="space-y-1">
        {actions.map((action, i) => (
          <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-ltd-primary/10 text-ltd-primary">
            <action.icon className="h-3 w-3" />
            <span className="text-xs">{action.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-1.5", compact ? "grid-cols-3" : "grid-cols-3")}>
      {actions.map((action, i) => (
        <div key={i} className="flex flex-col items-center gap-1 p-2 rounded bg-ltd-primary/10 text-ltd-primary">
          <action.icon className="h-4 w-4" />
          <span className="text-[10px]">{action.label}</span>
        </div>
      ))}
    </div>
  );
}

function NPSPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const showBreakdown = props.showBreakdown !== false;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className={cn("text-3xl font-bold text-ltd-primary", compact && "text-2xl")}>
          {mockNPSData.score}
        </span>
        <span className="text-xs text-ltd-text-3">NPS Score</span>
      </div>
      {showBreakdown && !compact && (
        <div className="flex gap-2 text-[10px]">
          <span className="text-green-600">{mockNPSData.promoters}% Promoters</span>
          <span className="text-gray-500">{mockNPSData.passives}% Passive</span>
          <span className="text-red-500">{mockNPSData.detractors}% Detractors</span>
        </div>
      )}
    </div>
  );
}

function PipelinePreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const showValue = props.showValue !== false;
  const items = mockPipelineData.slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-1.5">
      {items.map((stage, i) => (
        <div key={i} className="flex items-center justify-between p-1.5 rounded bg-ltd-surface-3/50">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-5 h-5 rounded text-[10px] font-medium flex items-center justify-center",
              "bg-ltd-primary/10 text-ltd-primary"
            )}>
              {stage.count}
            </span>
            <span className={cn("text-xs", compact && "text-[10px]")}>{stage.stage}</span>
          </div>
          {showValue && (
            <span className="text-[10px] text-ltd-text-3">${stage.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TeamCapacityPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const view = props.view || "bars";
  const items = mockTeamData.slice(0, compact ? 2 : 3);

  if (view === "heatmap") {
    return (
      <div className="grid grid-cols-3 gap-1">
        {items.map((member, i) => (
          <div key={i} className={cn(
            "p-2 rounded text-center text-[10px]",
            member.capacity > 80 ? "bg-red-100 text-red-700" :
            member.capacity > 50 ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-green-700"
          )}>
            <div className="font-medium">{member.name}</div>
            <div>{member.capacity}%</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((member, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-ltd-text-1">{member.name}</span>
            <span className="text-ltd-text-3">{member.capacity}%</span>
          </div>
          <Progress value={member.capacity} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

function ClientActivityPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const items = [
    { client: "CCAD", action: "Brief submitted", time: "2h ago" },
    { client: "DET", action: "Feedback received", time: "4h ago" },
    { client: "ADEK", action: "Approval given", time: "1d ago" },
  ].slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-ltd-surface-3/50">
          <Building2 className="h-3 w-3 text-ltd-text-3" />
          <div className="flex-1 min-w-0">
            <span className={cn("text-xs font-medium", compact && "text-[10px]")}>
              {item.client}
            </span>
            <span className="text-[10px] text-ltd-text-3 ml-1">{item.action}</span>
          </div>
          <span className="text-[8px] text-ltd-text-3">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeaderPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const title = String(props.title) || "Section Title";
  const subtitle = String(props.subtitle) || "";
  const showDivider = props.showDivider !== false;

  return (
    <div className={cn("space-y-1", showDivider && "border-b border-ltd-border-1 pb-2")}>
      <h3 className={cn("font-semibold text-ltd-text-1", compact ? "text-sm" : "text-base")}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-[10px] text-ltd-text-3">{subtitle}</p>
      )}
    </div>
  );
}

function GridLayoutPreview({ props, compact }: { props: Record<string, unknown>; compact: boolean }) {
  const columns = Number(props.columns) || 3;

  return (
    <div className={cn("grid gap-1.5", `grid-cols-${columns}`)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-8 bg-ltd-surface-3/50 rounded border border-dashed border-ltd-border-1 flex items-center justify-center">
          <span className="text-[8px] text-ltd-text-3">Slot {i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function DefaultPreview({ widget, compact }: { widget: UIWidgetTemplate; compact: boolean }) {
  const iconKey = widget.metadata.icon;
  const Icon = (iconKey && iconMap[iconKey]) || FileText;

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <Icon className={cn("text-ltd-text-3 mb-2", compact ? "h-6 w-6" : "h-8 w-8")} />
      <span className="text-[10px] text-ltd-text-3">
        {widget.metadata.name} Preview
      </span>
    </div>
  );
}
