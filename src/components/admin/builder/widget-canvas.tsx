"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { UIWidgetTemplate } from "@config/templates/types";
import { getWidgetById } from "@config/templates/lmtd/widgets/dashboard.widgets";
import { WidgetPreview } from "./widget-preview";
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
  GripVertical,
  Settings,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export interface PlacedWidget {
  id: string;
  widgetId: string;
  props: Record<string, unknown>;
  colSpan?: 1 | 2 | 3 | 4;
}

interface WidgetCanvasProps {
  widgets: PlacedWidget[];
  selectedWidgetId: string | null;
  onWidgetSelect: (id: string | null) => void;
  onWidgetRemove: (id: string) => void;
  onWidgetDuplicate: (id: string) => void;
  onWidgetMove: (id: string, direction: "up" | "down") => void;
  onWidgetAdd: (widgetId: string, position?: number) => void;
  onWidgetUpdate: (id: string, updates: Partial<PlacedWidget>) => void;
  columns?: 1 | 2 | 3 | 4;
}

export function WidgetCanvas({
  widgets,
  selectedWidgetId,
  onWidgetSelect,
  onWidgetRemove,
  onWidgetDuplicate,
  onWidgetMove,
  onWidgetAdd,
  onWidgetUpdate,
  columns = 3,
}: WidgetCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const widgetId = e.dataTransfer.getData("widget-id");
      if (widgetId) {
        onWidgetAdd(widgetId, index);
      }
      setDragOverIndex(null);
    },
    [onWidgetAdd]
  );

  const handleEmptyDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const widgetId = e.dataTransfer.getData("widget-id");
      if (widgetId) {
        onWidgetAdd(widgetId);
      }
    },
    [onWidgetAdd]
  );

  const colSpanClass = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
  };

  if (widgets.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center border-2 border-dashed border-ltd-border-1 rounded-xl bg-ltd-surface-2/50 m-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleEmptyDrop}
      >
        <div className="text-center max-w-md px-8 py-12">
          <LayoutGrid className="h-12 w-12 text-ltd-text-3 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
            Start Building Your Dashboard
          </h3>
          <p className="text-sm text-ltd-text-3 mb-4">
            Drag widgets from the library on the left, or click them to add to your canvas.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-ltd-text-3">
            <GripVertical className="h-4 w-4" />
            <span>Drag &amp; drop to reorder</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div
        className={cn(
          "grid gap-4 min-h-full",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleEmptyDrop}
      >
        {widgets.map((placed, index) => {
          const widgetDef = getWidgetById(placed.widgetId);
          if (!widgetDef) return null;

          const Icon = iconMap[widgetDef.metadata.icon] || FileText;
          const isSelected = selectedWidgetId === placed.id;
          const isDropTarget = dragOverIndex === index;

          return (
            <div
              key={placed.id}
              className={cn(
                "relative group",
                colSpanClass[placed.colSpan || 1],
                isDropTarget && "ring-2 ring-ltd-primary ring-offset-2"
              )}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <Card
                className={cn(
                  "h-full transition-all cursor-pointer",
                  isSelected
                    ? "ring-2 ring-ltd-primary border-ltd-primary"
                    : "hover:border-ltd-primary/50"
                )}
                onClick={() => onWidgetSelect(placed.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-ltd-text-3 cursor-grab active:cursor-grabbing" />
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          widgetDef.data.category === "data" && "bg-blue-500/10 text-blue-500",
                          widgetDef.data.category === "navigation" && "bg-purple-500/10 text-purple-500",
                          widgetDef.data.category === "layout" && "bg-green-500/10 text-green-500"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{widgetDef.metadata.name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                          {widgetDef.data.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Widget actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetMove(placed.id, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetMove(placed.id, "down");
                        }}
                        disabled={index === widgets.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetDuplicate(placed.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetRemove(placed.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Live Widget Preview */}
                  <div className="min-h-[80px] bg-ltd-surface-2 rounded-lg p-3 border border-ltd-border-1">
                    <WidgetPreview
                      widget={widgetDef}
                      props={placed.props}
                      compact={true}
                    />
                  </div>

                  {/* Config summary */}
                  {Object.keys(placed.props).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.entries(placed.props).slice(0, 3).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-ltd-primary flex items-center justify-center">
                  <Settings className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
