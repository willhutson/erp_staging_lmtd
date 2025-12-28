"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Plus,
  Save,
  Eye,
  Settings,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Move,
  GripVertical,
  ChevronLeft,
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  Hash,
  TrendingUp,
  Users,
  Layers,
  Palette,
  SlidersHorizontal,
  Database,
  Maximize2,
  Minimize2,
  Lock,
  Globe,
  X
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Widget types for sidebar
const availableWidgets = [
  { id: "line-chart", name: "Line Chart", icon: LineChart, category: "charts" },
  { id: "bar-chart", name: "Bar Chart", icon: BarChart3, category: "charts" },
  { id: "pie-chart", name: "Pie Chart", icon: PieChart, category: "charts" },
  { id: "kpi", name: "KPI Card", icon: Hash, category: "metrics" },
  { id: "trend", name: "Trend", icon: TrendingUp, category: "metrics" },
  { id: "table", name: "Data Table", icon: Table2, category: "tables" },
  { id: "leaderboard", name: "Leaderboard", icon: Users, category: "social" },
];

// Mock placed widgets
const mockPlacedWidgets = [
  {
    id: "w1",
    type: "kpi",
    title: "Total Impressions",
    x: 0,
    y: 0,
    width: 3,
    height: 2,
    config: { metric: "impressions", format: "number" },
  },
  {
    id: "w2",
    type: "kpi",
    title: "Engagement Rate",
    x: 3,
    y: 0,
    width: 3,
    height: 2,
    config: { metric: "engagement_rate", format: "percent" },
  },
  {
    id: "w3",
    type: "kpi",
    title: "Total Spend",
    x: 6,
    y: 0,
    width: 3,
    height: 2,
    config: { metric: "spend", format: "currency" },
  },
  {
    id: "w4",
    type: "kpi",
    title: "ROAS",
    x: 9,
    y: 0,
    width: 3,
    height: 2,
    config: { metric: "roas", format: "decimal" },
  },
  {
    id: "w5",
    type: "line-chart",
    title: "Performance Over Time",
    x: 0,
    y: 2,
    width: 8,
    height: 4,
    config: { metrics: ["impressions", "clicks", "conversions"] },
  },
  {
    id: "w6",
    type: "pie-chart",
    title: "Platform Distribution",
    x: 8,
    y: 2,
    width: 4,
    height: 4,
    config: { metric: "spend", groupBy: "platform" },
  },
  {
    id: "w7",
    type: "table",
    title: "Top Campaigns",
    x: 0,
    y: 6,
    width: 12,
    height: 4,
    config: { columns: ["name", "impressions", "clicks", "spend", "roas"] },
  },
];

export default function DashboardEditorPage() {
  const [dashboardName, setDashboardName] = useState("Executive Overview");
  const [placedWidgets, setPlacedWidgets] = useState(mockPlacedWidgets);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const getWidgetIcon = (type: string) => {
    const widget = availableWidgets.find((w) => w.id === type);
    return widget?.icon || Layers;
  };

  const handleWidgetSelect = (widgetId: string) => {
    setSelectedWidget(selectedWidget === widgetId ? null : widgetId);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setPlacedWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setSelectedWidget(null);
    setHasChanges(true);
  };

  const handleDuplicateWidget = (widgetId: string) => {
    const widget = placedWidgets.find((w) => w.id === widgetId);
    if (widget) {
      const newWidget = {
        ...widget,
        id: `w${Date.now()}`,
        title: `${widget.title} (Copy)`,
        y: widget.y + widget.height,
      };
      setPlacedWidgets((prev) => [...prev, newWidget]);
      setHasChanges(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Top Toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/Builder/dashboards">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <Input
              value={dashboardName}
              onChange={(e) => {
                setDashboardName(e.target.value);
                setHasChanges(true);
              }}
              className="h-8 w-64 border-none bg-transparent font-medium text-lg focus-visible:ring-1"
            />
            {hasChanges && (
              <Badge variant="outline" className="text-xs">Unsaved</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Dashboard Settings</SheetTitle>
                <SheetDescription>
                  Configure dashboard visibility and preferences
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Dashboard Name</Label>
                  <Input value={dashboardName} onChange={(e) => setDashboardName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input placeholder="Optional description..." />
                </div>
                <div className="grid gap-2">
                  <Label>Visibility</Label>
                  <Select defaultValue="ORGANIZATION">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                      <SelectItem value="ORGANIZATION">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Team
                        </div>
                      </SelectItem>
                      <SelectItem value="CLIENT">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Client Portal
                        </div>
                      </SelectItem>
                      <SelectItem value="PUBLIC">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Refresh Interval</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Manual only</SelectItem>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Widget Panel (Left Sidebar) */}
        {!isPreviewMode && isWidgetPanelOpen && (
          <div className="w-64 border-r bg-background flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-medium text-sm">Widgets</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsWidgetPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {/* Charts */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Charts</h4>
                  <div className="space-y-1">
                    {availableWidgets
                      .filter((w) => w.category === "charts")
                      .map((widget) => (
                        <Button
                          key={widget.id}
                          variant="ghost"
                          className="w-full justify-start h-9 px-2"
                          draggable
                        >
                          <widget.icon className="mr-2 h-4 w-4" />
                          <span className="text-sm">{widget.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
                {/* Metrics */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Metrics</h4>
                  <div className="space-y-1">
                    {availableWidgets
                      .filter((w) => w.category === "metrics")
                      .map((widget) => (
                        <Button
                          key={widget.id}
                          variant="ghost"
                          className="w-full justify-start h-9 px-2"
                          draggable
                        >
                          <widget.icon className="mr-2 h-4 w-4" />
                          <span className="text-sm">{widget.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
                {/* Tables */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Tables</h4>
                  <div className="space-y-1">
                    {availableWidgets
                      .filter((w) => w.category === "tables")
                      .map((widget) => (
                        <Button
                          key={widget.id}
                          variant="ghost"
                          className="w-full justify-start h-9 px-2"
                          draggable
                        >
                          <widget.icon className="mr-2 h-4 w-4" />
                          <span className="text-sm">{widget.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
                {/* Social */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Social</h4>
                  <div className="space-y-1">
                    {availableWidgets
                      .filter((w) => w.category === "social")
                      .map((widget) => (
                        <Button
                          key={widget.id}
                          variant="ghost"
                          className="w-full justify-start h-9 px-2"
                          draggable
                        >
                          <widget.icon className="mr-2 h-4 w-4" />
                          <span className="text-sm">{widget.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-6">
          {!isWidgetPanelOpen && !isPreviewMode && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-20 z-10"
              onClick={() => setIsWidgetPanelOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          )}

          {/* Grid Canvas */}
          <div
            className="min-h-[800px] rounded-lg border-2 border-dashed border-muted-foreground/20 bg-background p-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gridAutoRows: "60px",
              gap: "16px",
            }}
          >
            {placedWidgets.map((widget) => {
              const Icon = getWidgetIcon(widget.type);
              const isSelected = selectedWidget === widget.id;

              return (
                <div
                  key={widget.id}
                  className={`relative rounded-lg border bg-card shadow-sm transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-primary border-primary"
                      : "hover:shadow-md hover:border-muted-foreground/30"
                  }`}
                  style={{
                    gridColumn: `span ${widget.width}`,
                    gridRow: `span ${widget.height}`,
                  }}
                  onClick={() => handleWidgetSelect(widget.id)}
                >
                  {/* Widget Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {!isPreviewMode && (
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      )}
                      <span className="text-sm font-medium truncate">{widget.title}</span>
                    </div>
                    {!isPreviewMode && isSelected && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateWidget(widget.id);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWidget(widget.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Widget Content Placeholder */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-muted-foreground">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">{widget.type.replace("-", " ")}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State Drop Zone */}
            {placedWidgets.length === 0 && (
              <div className="col-span-12 row-span-4 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Drag widgets here to build your dashboard</p>
                  <p className="text-sm">Or click a widget from the sidebar to add it</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget Config Panel (Right Sidebar) */}
        {!isPreviewMode && selectedWidget && (
          <div className="w-72 border-l bg-background flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-medium text-sm">Widget Settings</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedWidget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <Tabs defaultValue="data">
                  <TabsList className="w-full">
                    <TabsTrigger value="data" className="flex-1">
                      <Database className="mr-1 h-3 w-3" />
                      Data
                    </TabsTrigger>
                    <TabsTrigger value="style" className="flex-1">
                      <Palette className="mr-1 h-3 w-3" />
                      Style
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="data" className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={placedWidgets.find((w) => w.id === selectedWidget)?.title || ""}
                        onChange={(e) => {
                          setPlacedWidgets((prev) =>
                            prev.map((w) =>
                              w.id === selectedWidget ? { ...w, title: e.target.value } : w
                            )
                          );
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Data Source</Label>
                      <Select defaultValue="campaigns">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="campaigns">Campaigns</SelectItem>
                          <SelectItem value="creators">Creators</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="media">Media Buying</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Metric</Label>
                      <Select defaultValue="impressions">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="impressions">Impressions</SelectItem>
                          <SelectItem value="clicks">Clicks</SelectItem>
                          <SelectItem value="conversions">Conversions</SelectItem>
                          <SelectItem value="spend">Spend</SelectItem>
                          <SelectItem value="roas">ROAS</SelectItem>
                          <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Date Range</Label>
                      <Select defaultValue="30d">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label>Width (columns)</Label>
                      <Select
                        value={String(placedWidgets.find((w) => w.id === selectedWidget)?.width || 3)}
                        onValueChange={(value) => {
                          setPlacedWidgets((prev) =>
                            prev.map((w) =>
                              w.id === selectedWidget ? { ...w, width: parseInt(value) } : w
                            )
                          );
                          setHasChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 columns</SelectItem>
                          <SelectItem value="3">3 columns</SelectItem>
                          <SelectItem value="4">4 columns</SelectItem>
                          <SelectItem value="6">6 columns</SelectItem>
                          <SelectItem value="8">8 columns</SelectItem>
                          <SelectItem value="12">Full width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Height (rows)</Label>
                      <Select
                        value={String(placedWidgets.find((w) => w.id === selectedWidget)?.height || 2)}
                        onValueChange={(value) => {
                          setPlacedWidgets((prev) =>
                            prev.map((w) =>
                              w.id === selectedWidget ? { ...w, height: parseInt(value) } : w
                            )
                          );
                          setHasChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 rows</SelectItem>
                          <SelectItem value="3">3 rows</SelectItem>
                          <SelectItem value="4">4 rows</SelectItem>
                          <SelectItem value="6">6 rows</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="grid gap-2">
                      <Label>Number Format</Label>
                      <Select defaultValue="number">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="currency">Currency</SelectItem>
                          <SelectItem value="percent">Percentage</SelectItem>
                          <SelectItem value="compact">Compact (1.2K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Show Trend</Label>
                      <Select defaultValue="yes">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
