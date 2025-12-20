"use client";

import { useState, useCallback, Suspense } from "react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RGL = require("react-grid-layout");
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { LayoutConfig, WidgetConfig, widgetRegistry } from "../types";
import { WidgetWrapper } from "./WidgetWrapper";
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
} from "./widgets";
import { saveDashboardLayout } from "../actions/dashboard-actions";
import { Edit2, Save, X, Plus, RotateCcw } from "lucide-react";

const ResponsiveGridLayout = RGL.WidthProvider(RGL.Responsive);

interface DashboardGridProps {
  initialLayout: LayoutConfig;
}

// Define our own layout item type matching react-grid-layout
interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

function WidgetContent({ type }: { type: string }) {
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
}

function WidgetLoader() {
  return (
    <div className="animate-pulse space-y-2 p-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

export function DashboardGrid({ initialLayout }: DashboardGridProps) {
  const [layout, setLayout] = useState<LayoutConfig>(initialLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  // Convert our widget config to react-grid-layout format
  const gridLayout: GridLayoutItem[] = layout.widgets.map((widget) => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
    minW: widgetRegistry[widget.type]?.minWidth || 1,
    minH: widgetRegistry[widget.type]?.minHeight || 1,
    maxW: widgetRegistry[widget.type]?.maxWidth || 4,
    maxH: widgetRegistry[widget.type]?.maxHeight || 3,
    static: !isEditing,
  }));

  const handleLayoutChange = useCallback(
    (currentLayout: GridLayoutItem[]) => {
      if (!isEditing) return;

      setLayout((prev) => ({
        ...prev,
        widgets: prev.widgets.map((widget) => {
          const gridItem = currentLayout.find((item) => item.i === widget.id);
          if (!gridItem) return widget;
          return {
            ...widget,
            position: {
              x: gridItem.x,
              y: gridItem.y,
              w: gridItem.w,
              h: gridItem.h,
            },
          };
        }),
      }));
    },
    [isEditing]
  );

  const handleRemoveWidget = (widgetId: string) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
    }));
  };

  const handleAddWidget = (widgetType: string) => {
    const definition =
      widgetRegistry[widgetType as keyof typeof widgetRegistry];
    if (!definition) return;

    const [w, h] = definition.defaultSize.split("x").map(Number);

    // Find first available position
    const maxY = Math.max(
      ...layout.widgets.map((w) => w.position.y + w.position.h),
      0
    );

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: widgetType as WidgetConfig["type"],
      position: { x: 0, y: maxY, w, h },
    };

    setLayout((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    setShowWidgetPicker(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDashboardLayout(layout);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save layout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLayout(initialLayout);
    setIsEditing(false);
  };

  const handleReset = async () => {
    if (confirm("Reset dashboard to default layout?")) {
      const { defaultLayout } = await import("../types");
      setLayout(defaultLayout);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setShowWidgetPicker(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#52EDC7] text-gray-900 rounded-lg hover:bg-[#1BA098] hover:text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              <Edit2 className="w-4 h-4" />
              Edit Layout
            </button>
          )}
        </div>
      </div>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Widget</h2>
              <button
                onClick={() => setShowWidgetPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(widgetRegistry).map((widget) => {
                const alreadyAdded = layout.widgets.some(
                  (w) => w.type === widget.type
                );
                return (
                  <button
                    key={widget.type}
                    onClick={() => handleAddWidget(widget.type)}
                    disabled={alreadyAdded}
                    className={`p-4 text-left rounded-lg border transition-colors ${
                      alreadyAdded
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:border-[#52EDC7] hover:bg-[#52EDC7]/5"
                    }`}
                  >
                    <p className="font-medium text-sm">{widget.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {widget.description}
                    </p>
                    {alreadyAdded && (
                      <p className="text-xs text-gray-400 mt-1">Already added</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={isEditing ? "bg-gray-50 p-4 rounded-xl" : ""}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onLayoutChange={(currentLayout: any) => handleLayoutChange(currentLayout)}
          isDraggable={isEditing}
          isResizable={isEditing}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
        >
          {layout.widgets.map((widget) => {
            const definition = widgetRegistry[widget.type];
            if (!definition) return null;

            return (
              <div key={widget.id}>
                <WidgetWrapper
                  definition={definition}
                  isEditing={isEditing}
                  onRemove={() => handleRemoveWidget(widget.id)}
                >
                  <Suspense fallback={<WidgetLoader />}>
                    <WidgetContent type={widget.type} />
                  </Suspense>
                </WidgetWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
