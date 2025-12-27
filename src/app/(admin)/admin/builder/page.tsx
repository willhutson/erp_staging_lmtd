"use client";

import { useState, useCallback } from "react";
import { WidgetPicker, WidgetCanvas, WidgetPropsEditor, type PlacedWidget } from "@/components/admin/builder";
import { getWidgetById } from "@config/templates/lmtd/widgets/dashboard.widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Eye,
  Settings2,
  LayoutGrid,
  ArrowLeft,
  Undo,
  Redo,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Simple ID generator using crypto API
const generateId = () => crypto.randomUUID();

export default function DashboardBuilderPage() {
  const [dashboardName, setDashboardName] = useState("Untitled Dashboard");
  const [columns, setColumns] = useState<1 | 2 | 3 | 4>(3);
  const [widgets, setWidgets] = useState<PlacedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [showProps, setShowProps] = useState(true);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || null;

  const handleAddWidget = useCallback((widgetId: string, position?: number) => {
    const widgetDef = getWidgetById(widgetId);
    if (!widgetDef) return;

    const newWidget: PlacedWidget = {
      id: generateId(),
      widgetId,
      props: widgetDef.data.props.reduce<Record<string, unknown>>(
        (acc, prop) => ({ ...acc, [prop.name]: prop.defaultValue }),
        {}
      ),
      colSpan: 1,
    };

    setWidgets((prev) => {
      if (position !== undefined) {
        const updated = [...prev];
        updated.splice(position, 0, newWidget);
        return updated;
      }
      return [...prev, newWidget];
    });

    setSelectedWidgetId(newWidget.id);
    toast.success(`Added ${widgetDef.metadata.name}`);
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
    toast.success("Widget removed");
  }, [selectedWidgetId]);

  const handleDuplicateWidget = useCallback((id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    const newWidget: PlacedWidget = {
      ...widget,
      id: generateId(),
      props: { ...widget.props },
    };

    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      const updated = [...prev];
      updated.splice(index + 1, 0, newWidget);
      return updated;
    });

    setSelectedWidgetId(newWidget.id);
    toast.success("Widget duplicated");
  }, [widgets]);

  const handleMoveWidget = useCallback((id: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  }, []);

  const handleUpdateWidget = useCallback((id: string, updates: Partial<PlacedWidget>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const handleSave = () => {
    // TODO: Implement actual save logic
    const config = {
      name: dashboardName,
      columns,
      widgets: widgets.map((w) => ({
        widgetId: w.widgetId,
        props: w.props,
        colSpan: w.colSpan,
      })),
    };
    console.log("Dashboard config:", config);
    toast.success("Dashboard saved!");
  };

  const handlePreview = () => {
    toast.info("Preview mode coming soon");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] -m-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ltd-border-1 bg-ltd-surface-2">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-ltd-border-1" />
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="w-64 h-9 font-semibold bg-transparent border-transparent hover:border-ltd-border-1 focus:border-ltd-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xs text-ltd-text-3">Columns:</span>
            <Select
              value={String(columns)}
              onValueChange={(v) => setColumns(parseInt(v) as 1 | 2 | 3 | 4)}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-ltd-border-1 mx-2" />

          <Button variant="ghost" size="sm" disabled className="gap-2">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled className="gap-2">
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-ltd-border-1 mx-2" />

          <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProps(!showProps)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            {showProps ? "Hide" : "Show"} Props
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Widget picker sidebar */}
        <div className="w-72 border-r border-ltd-border-1 bg-ltd-surface-2 flex flex-col">
          <WidgetPicker
            onSelect={(widget) => handleAddWidget(widget.metadata.id)}
            selectedWidgets={widgets.map((w) => w.widgetId)}
          />
        </div>

        {/* Canvas */}
        <WidgetCanvas
          widgets={widgets}
          selectedWidgetId={selectedWidgetId}
          onWidgetSelect={setSelectedWidgetId}
          onWidgetRemove={handleRemoveWidget}
          onWidgetDuplicate={handleDuplicateWidget}
          onWidgetMove={handleMoveWidget}
          onWidgetAdd={handleAddWidget}
          onWidgetUpdate={handleUpdateWidget}
          columns={columns}
        />

        {/* Props editor sidebar */}
        {showProps && (
          <div className="w-80 border-l border-ltd-border-1 bg-ltd-surface-2 flex flex-col">
            <WidgetPropsEditor
              widget={selectedWidget}
              onUpdate={(updates) => {
                if (selectedWidgetId) {
                  handleUpdateWidget(selectedWidgetId, updates);
                }
              }}
              onClose={() => setSelectedWidgetId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
