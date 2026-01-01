import { Suspense } from "react";
import { getDashboardLayout } from "@/modules/dashboard/actions/dashboard-actions";
import { DashboardGrid } from "@/modules/dashboard/components/DashboardGrid";
import { WidgetLoader } from "@/modules/dashboard/components/WidgetLoader";
import {
  MyTasksWidget,
  MyBriefedTasksWidget,
  UpcomingDeadlinesWidget,
  RecentBriefsWidget,
  TimeLoggedWidget,
  QuickActionsWidget,
  NPSScoreWidget,
  PipelineSummaryWidget,
  TeamCapacityWidget,
  ClientActivityWidget,
} from "@/modules/dashboard/components/widgets";
import { WidgetWrapper } from "@/modules/dashboard/components/WidgetWrapper";
import { widgetRegistry } from "@/modules/dashboard/types";
import { PageShell } from "@/components/ltd/patterns/page-shell";

// Server-rendered widget component
function ServerWidget({ type }: { type: string }) {
  const definition = widgetRegistry[type as keyof typeof widgetRegistry];
  if (!definition) return null;

  const getWidgetContent = () => {
    switch (type) {
      case "my-tasks":
        return <MyTasksWidget />;
      case "my-briefed-tasks":
        return <MyBriefedTasksWidget />;
      case "upcoming-deadlines":
        return <UpcomingDeadlinesWidget />;
      case "recent-briefs":
        return <RecentBriefsWidget />;
      case "time-logged":
        return <TimeLoggedWidget />;
      case "quick-actions":
        return <QuickActionsWidget />;
      case "nps-score":
        return <NPSScoreWidget />;
      case "pipeline-summary":
        return <PipelineSummaryWidget />;
      case "team-capacity":
        return <TeamCapacityWidget />;
      case "client-activity":
        return <ClientActivityWidget />;
      default:
        return <div className="text-gray-400 text-sm">Unknown widget</div>;
    }
  };

  return (
    <WidgetWrapper definition={definition} isEditing={false}>
      <Suspense fallback={<WidgetLoader />}>
        {getWidgetContent()}
      </Suspense>
    </WidgetWrapper>
  );
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const layout = await getDashboardLayout();

  // Pre-render widgets server-side
  const renderedWidgets: Record<string, React.ReactNode> = {};
  for (const widget of layout.widgets) {
    renderedWidgets[widget.id] = <ServerWidget type={widget.type} />;
  }

  return (
    <PageShell
      title="Dashboard"
      description="Overview of your agency performance"
      maxWidth="full"
    >
      <DashboardGrid
        initialLayout={layout}
        renderedWidgets={renderedWidgets}
      />
    </PageShell>
  );
}
