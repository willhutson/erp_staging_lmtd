"use client";

import { useState, useCallback, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Eye,
  Settings2,
  LayoutGrid,
  ArrowLeft,
  Undo,
  Redo,
  FolderOpen,
  Plus,
  Download,
  Trash2,
  Copy,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getDashboards,
  getDashboard,
  saveDashboard,
  deleteDashboard,
  duplicateDashboard,
  type SavedDashboard,
  type DashboardLayoutConfig,
} from "./actions";

// Simple ID generator using crypto API
const generateId = () => crypto.randomUUID();

export default function DashboardBuilderPage() {
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const [dashboardName, setDashboardName] = useState("Untitled Dashboard");
  const [columns, setColumns] = useState<1 | 2 | 3 | 4>(3);
  const [widgets, setWidgets] = useState<PlacedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [showProps, setShowProps] = useState(true);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || null;

  // Load saved dashboards on mount
  useEffect(() => {
    loadSavedDashboards();
  }, []);

  const loadSavedDashboards = async () => {
    try {
      const dashboards = await getDashboards();
      setSavedDashboards(dashboards);
    } catch (error) {
      console.error("Failed to load dashboards:", error);
    }
  };

  const handleNewDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Create new dashboard anyway?");
      if (!confirmed) return;
    }
    setDashboardId(null);
    setDashboardName("Untitled Dashboard");
    setColumns(3);
    setWidgets([]);
    setSelectedWidgetId(null);
    setHasUnsavedChanges(false);
    toast.success("New dashboard created");
  };

  const handleLoadDashboard = async (id: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Load another dashboard anyway?");
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      const dashboard = await getDashboard(id);
      if (dashboard) {
        setDashboardId(dashboard.id);
        setDashboardName(dashboard.layout.name);
        setColumns(dashboard.layout.columns as 1 | 2 | 3 | 4);
        setWidgets(
          dashboard.layout.widgets.map((w) => ({
            id: generateId(),
            widgetId: w.widgetId,
            props: w.props,
            colSpan: w.colSpan as 1 | 2 | 3 | 4,
          }))
        );
        setSelectedWidgetId(null);
        setHasUnsavedChanges(false);
        toast.success(`Loaded "${dashboard.name}"`);
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

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
    setHasUnsavedChanges(true);
    toast.success(`Added ${widgetDef.metadata.name}`);
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  }, []);

  const handleUpdateWidget = useCallback((id: string, updates: Partial<PlacedWidget>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config: DashboardLayoutConfig = {
        name: dashboardName,
        columns,
        widgets: widgets.map((w) => ({
          widgetId: w.widgetId,
          props: w.props,
          colSpan: w.colSpan || 1,
        })),
      };

      const saved = await saveDashboard(config, dashboardId || undefined);
      setDashboardId(saved.id);
      setHasUnsavedChanges(false);
      await loadSavedDashboards();
      toast.success("Dashboard saved!");
    } catch (error) {
      toast.error("Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dashboardId) return;

    const confirmed = window.confirm("Are you sure you want to delete this dashboard?");
    if (!confirmed) return;

    try {
      await deleteDashboard(dashboardId);
      handleNewDashboard();
      await loadSavedDashboards();
      toast.success("Dashboard deleted");
    } catch (error) {
      toast.error("Failed to delete dashboard");
    }
  };

  const handleDuplicate = async () => {
    if (!dashboardId) return;

    try {
      const duplicated = await duplicateDashboard(dashboardId);
      setDashboardId(duplicated.id);
      setDashboardName(duplicated.layout.name);
      setHasUnsavedChanges(false);
      await loadSavedDashboards();
      toast.success("Dashboard duplicated");
    } catch (error) {
      toast.error("Failed to duplicate dashboard");
    }
  };

  const handleExport = () => {
    const config: DashboardLayoutConfig = {
      name: dashboardName,
      columns,
      widgets: widgets.map((w) => ({
        widgetId: w.widgetId,
        props: w.props,
        colSpan: w.colSpan || 1,
      })),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dashboardName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dashboard exported as JSON");
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

          {/* Dashboard selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                <span className="max-w-32 truncate">
                  {dashboardId ? dashboardName : "Select Dashboard"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={handleNewDashboard}>
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </DropdownMenuItem>
              {savedDashboards.length > 0 && <DropdownMenuSeparator />}
              {savedDashboards.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => handleLoadDashboard(d.id)}
                  className={d.id === dashboardId ? "bg-ltd-surface-3" : ""}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span className="truncate">{d.name}</span>
                  {d.isDefault && (
                    <span className="ml-auto text-[10px] text-ltd-text-3">Default</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-ltd-border-1" />

          <Input
            value={dashboardName}
            onChange={(e) => {
              setDashboardName(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="w-64 h-9 font-semibold bg-transparent border-transparent hover:border-ltd-border-1 focus:border-ltd-primary"
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-ltd-text-3 italic">Unsaved</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xs text-ltd-text-3">Columns:</span>
            <Select
              value={String(columns)}
              onValueChange={(v) => {
                setColumns(parseInt(v) as 1 | 2 | 3 | 4);
                setHasUnsavedChanges(true);
              }}
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

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          {dashboardId && (
            <>
              <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}

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
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
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
