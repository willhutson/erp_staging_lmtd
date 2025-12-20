import { Suspense } from "react";
import { getDashboardLayout } from "@/modules/dashboard/actions/dashboard-actions";
import { DashboardGrid } from "@/modules/dashboard/components/DashboardGrid";
import { WidgetLoader } from "@/modules/dashboard/components/WidgetLoader";
import {
  MyTasksWidget,
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

// Server-rendered widget component
function ServerWidget({ type }: { type: string }) {
  const definition = widgetRegistry[type as keyof typeof widgetRegistry];
  if (!definition) return null;

  const getWidgetContent = () => {
    switch (type) {
      case "my-tasks":
        return <MyTasksWidget />;
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

export default async function DashboardPage() {
  const layout = await getDashboardLayout();

  // Pre-render widgets server-side
  const renderedWidgets: Record<string, React.ReactNode> = {};
  for (const widget of layout.widgets) {
    renderedWidgets[widget.id] = <ServerWidget type={widget.type} />;
  }

  return (
    <DashboardGrid
      initialLayout={layout}
      renderedWidgets={renderedWidgets}
    />
  );
}
