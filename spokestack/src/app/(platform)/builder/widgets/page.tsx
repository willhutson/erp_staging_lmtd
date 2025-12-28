"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  Hash,
  TrendingUp,
  Gauge,
  Map,
  Calendar,
  Users,
  Plus,
  Search,
  Star,
  StarOff,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Settings2,
  Layers,
  Grid3X3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Widget categories and types
const widgetCategories = [
  { id: "charts", name: "Charts", icon: BarChart3 },
  { id: "metrics", name: "Metrics", icon: Hash },
  { id: "tables", name: "Tables", icon: Table2 },
  { id: "social", name: "Social", icon: Users },
  { id: "custom", name: "Custom", icon: Layers },
];

// Mock widgets data
const mockWidgets = [
  {
    id: "1",
    name: "Line Chart",
    type: "LINE_CHART",
    category: "charts",
    description: "Display trends over time with customizable axes",
    icon: LineChart,
    isBuiltIn: true,
    isFavorite: true,
    usageCount: 45,
  },
  {
    id: "2",
    name: "Bar Chart",
    type: "BAR_CHART",
    category: "charts",
    description: "Compare values across categories",
    icon: BarChart3,
    isBuiltIn: true,
    isFavorite: true,
    usageCount: 38,
  },
  {
    id: "3",
    name: "Pie Chart",
    type: "PIE_CHART",
    category: "charts",
    description: "Show proportions and percentages",
    icon: PieChart,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 22,
  },
  {
    id: "4",
    name: "KPI Card",
    type: "KPI",
    category: "metrics",
    description: "Display single metric with trend indicator",
    icon: Hash,
    isBuiltIn: true,
    isFavorite: true,
    usageCount: 67,
  },
  {
    id: "5",
    name: "Trend Indicator",
    type: "TREND",
    category: "metrics",
    description: "Show metric change with arrow and percentage",
    icon: TrendingUp,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 31,
  },
  {
    id: "6",
    name: "Gauge",
    type: "GAUGE",
    category: "metrics",
    description: "Display progress towards a goal",
    icon: Gauge,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 15,
  },
  {
    id: "7",
    name: "Data Table",
    type: "TABLE",
    category: "tables",
    description: "Display tabular data with sorting and filtering",
    icon: Table2,
    isBuiltIn: true,
    isFavorite: true,
    usageCount: 52,
  },
  {
    id: "8",
    name: "Pivot Table",
    type: "PIVOT_TABLE",
    category: "tables",
    description: "Cross-tabulate data with aggregations",
    icon: Grid3X3,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 12,
  },
  {
    id: "9",
    name: "Creator Leaderboard",
    type: "CREATOR_LEADERBOARD",
    category: "social",
    description: "Rank creators by performance metrics",
    icon: Users,
    isBuiltIn: true,
    isFavorite: true,
    usageCount: 28,
  },
  {
    id: "10",
    name: "Content Calendar",
    type: "CONTENT_CALENDAR",
    category: "social",
    description: "Display scheduled content in calendar view",
    icon: Calendar,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 19,
  },
  {
    id: "11",
    name: "Platform Map",
    type: "PLATFORM_MAP",
    category: "social",
    description: "Visualize platform distribution",
    icon: Map,
    isBuiltIn: true,
    isFavorite: false,
    usageCount: 8,
  },
  {
    id: "12",
    name: "CCAD Performance Widget",
    type: "CUSTOM",
    category: "custom",
    description: "Custom widget for CCAD client metrics",
    icon: Layers,
    isBuiltIn: false,
    isFavorite: false,
    usageCount: 5,
    createdBy: "Will Hutson",
  },
];

export default function WidgetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(
    mockWidgets.filter((w) => w.isFavorite).map((w) => w.id)
  );

  const filteredWidgets = mockWidgets.filter((widget) => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (widgetId: string) => {
    setFavorites((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = widgetCategories.find((c) => c.id === category);
    return (
      <Badge variant="outline" className="text-xs">
        {categoryConfig?.name || category}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widget Library</h1>
          <p className="text-muted-foreground">
            Browse and create widgets for your dashboards
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Custom Widget</DialogTitle>
              <DialogDescription>
                Build a new widget with custom data sources and configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Widget Name</Label>
                <Input id="name" placeholder="e.g., Monthly Performance Summary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="What does this widget display?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseType">Base Widget Type</Label>
                <Select defaultValue="LINE_CHART">
                  <SelectTrigger>
                    <SelectValue placeholder="Select base type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINE_CHART">Line Chart</SelectItem>
                    <SelectItem value="BAR_CHART">Bar Chart</SelectItem>
                    <SelectItem value="PIE_CHART">Pie Chart</SelectItem>
                    <SelectItem value="KPI">KPI Card</SelectItem>
                    <SelectItem value="TABLE">Data Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select defaultValue="campaigns">
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campaigns">Campaign Performance</SelectItem>
                    <SelectItem value="creators">Creator Metrics</SelectItem>
                    <SelectItem value="content">Content Analytics</SelectItem>
                    <SelectItem value="media">Media Buying</SelectItem>
                    <SelectItem value="custom">Custom Query (BigQuery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Widget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Widgets
            </CardTitle>
            <Layers className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWidgets.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockWidgets.filter((w) => w.isBuiltIn).length} built-in, {mockWidgets.filter((w) => !w.isBuiltIn).length} custom
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favorites
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Used
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KPI Card</div>
            <p className="text-xs text-muted-foreground">67 uses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <Grid3X3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgetCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {widgetCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search widgets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Favorites Section */}
          {selectedCategory === "all" && favorites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Favorites
              </h3>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredWidgets
                  .filter((w) => favorites.includes(w.id))
                  .map((widget) => (
                    <WidgetCard
                      key={widget.id}
                      widget={widget}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(widget.id)}
                      getCategoryBadge={getCategoryBadge}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* All Widgets */}
          <div className="space-y-3">
            {selectedCategory === "all" && favorites.length > 0 && (
              <h3 className="text-sm font-medium text-muted-foreground">All Widgets</h3>
            )}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredWidgets
                .filter((w) => selectedCategory !== "all" || !favorites.includes(w.id))
                .map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    isFavorite={favorites.includes(widget.id)}
                    onToggleFavorite={() => toggleFavorite(widget.id)}
                    getCategoryBadge={getCategoryBadge}
                  />
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface WidgetCardProps {
  widget: typeof mockWidgets[0];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  getCategoryBadge: (category: string) => JSX.Element;
}

function WidgetCard({ widget, isFavorite, onToggleFavorite, getCategoryBadge }: WidgetCardProps) {
  const Icon = widget.icon;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{widget.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getCategoryBadge(widget.category)}
                {widget.isBuiltIn && (
                  <Badge variant="secondary" className="text-xs">Built-in</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleFavorite}
            >
              {isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                {!widget.isBuiltIn && (
                  <>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2 text-sm">
          {widget.description}
        </CardDescription>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{widget.usageCount} uses</span>
          {widget.createdBy && <span>By {widget.createdBy}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
