"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { lmtdWidgets, getWidgetsByCategory } from "@config/templates/lmtd/widgets/dashboard.widgets";
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
  GripVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface WidgetPickerProps {
  onSelect: (widget: UIWidgetTemplate) => void;
  selectedWidgets?: string[];
}

export function WidgetPicker({ onSelect, selectedWidgets = [] }: WidgetPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "data" | "navigation" | "layout">("all");

  const filteredWidgets = lmtdWidgets.filter((widget) => {
    const matchesSearch =
      widget.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
      widget.metadata.description.toLowerCase().includes(search.toLowerCase()) ||
      widget.metadata.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      category === "all" || widget.data.category === category;

    return matchesSearch && matchesCategory;
  });

  const dataWidgets = getWidgetsByCategory("data");
  const navigationWidgets = getWidgetsByCategory("navigation");
  const layoutWidgets = getWidgetsByCategory("layout");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-ltd-border-1">
        <h3 className="font-semibold text-ltd-text-1 mb-3">Widget Library</h3>
        <Input
          placeholder="Search widgets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-ltd-surface-3 border-ltd-border-1"
        />
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 mx-4 mt-2">
          <TabsTrigger value="all" onClick={() => setCategory("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="data" onClick={() => setCategory("data")}>
            Data
          </TabsTrigger>
          <TabsTrigger value="navigation" onClick={() => setCategory("navigation")}>
            Nav
          </TabsTrigger>
          <TabsTrigger value="layout" onClick={() => setCategory("layout")}>
            Layout
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredWidgets.length === 0 ? (
              <p className="text-sm text-ltd-text-3 text-center py-8">
                No widgets found matching your search.
              </p>
            ) : (
              filteredWidgets.map((widget) => {
                const iconKey = widget.metadata.icon;
                const Icon = (iconKey && iconMap[iconKey]) || FileText;
                const isSelected = selectedWidgets.includes(widget.metadata.id);

                return (
                  <div
                    key={widget.metadata.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("widget-id", widget.metadata.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => onSelect(widget)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all group",
                      "hover:border-ltd-primary hover:bg-ltd-primary/5",
                      isSelected
                        ? "border-ltd-primary bg-ltd-primary/10"
                        : "border-ltd-border-1 bg-ltd-surface-3"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-ltd-text-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          widget.data.category === "data" && "bg-blue-500/10 text-blue-500",
                          widget.data.category === "navigation" && "bg-purple-500/10 text-purple-500",
                          widget.data.category === "layout" && "bg-green-500/10 text-green-500"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ltd-text-1">
                          {widget.metadata.name}
                        </span>
                        {isSelected && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Added
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ltd-text-3 line-clamp-2 mt-0.5">
                        {widget.metadata.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {widget.metadata.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-ltd-surface-2"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
