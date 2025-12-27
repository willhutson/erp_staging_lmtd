"use client";

import { getWidgetById } from "@config/templates/lmtd/widgets/dashboard.widgets";
import type { PlacedWidget } from "./widget-canvas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface WidgetPropsEditorProps {
  widget: PlacedWidget | null;
  onUpdate: (updates: Partial<PlacedWidget>) => void;
  onClose: () => void;
}

export function WidgetPropsEditor({ widget, onUpdate, onClose }: WidgetPropsEditorProps) {
  if (!widget) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-ltd-text-3">
          <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a widget to configure</p>
        </div>
      </div>
    );
  }

  const widgetDef = getWidgetById(widget.widgetId);
  if (!widgetDef) {
    return (
      <div className="p-4 text-sm text-red-500">
        Widget definition not found
      </div>
    );
  }

  const iconKey = widgetDef.metadata.icon;
  const Icon = (iconKey && iconMap[iconKey]) || FileText;

  const handlePropChange = (name: string, value: unknown) => {
    onUpdate({
      props: {
        ...widget.props,
        [name]: value,
      },
    });
  };

  const handleColSpanChange = (value: string) => {
    onUpdate({
      colSpan: parseInt(value) as 1 | 2 | 3 | 4,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-ltd-border-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                widgetDef.data.category === "data" && "bg-blue-500/10 text-blue-500",
                widgetDef.data.category === "navigation" && "bg-purple-500/10 text-purple-500",
                widgetDef.data.category === "layout" && "bg-green-500/10 text-green-500"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ltd-text-1">{widgetDef.metadata.name}</h3>
              <Badge variant="secondary" className="text-[10px] mt-1">
                v{widgetDef.metadata.version}
              </Badge>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-ltd-text-3 mt-2">{widgetDef.metadata.description}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Layout settings */}
          <div>
            <h4 className="text-xs font-semibold text-ltd-text-2 uppercase tracking-wider mb-3">
              Layout
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Column Span</Label>
                <Select
                  value={String(widget.colSpan || 1)}
                  onValueChange={handleColSpanChange}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Column</SelectItem>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Widget-specific props */}
          <div>
            <h4 className="text-xs font-semibold text-ltd-text-2 uppercase tracking-wider mb-3">
              Configuration
            </h4>
            <div className="space-y-4">
              {widgetDef.data.props.map((prop) => {
                const currentValue = widget.props[prop.name] ?? prop.defaultValue;

                switch (prop.type) {
                  case "string":
                    return (
                      <div key={prop.name}>
                        <Label className="text-sm">{prop.label}</Label>
                        <Input
                          className="mt-1.5"
                          value={currentValue as string}
                          onChange={(e) => handlePropChange(prop.name, e.target.value)}
                          placeholder={`Enter ${prop.label.toLowerCase()}`}
                        />
                      </div>
                    );

                  case "number":
                    return (
                      <div key={prop.name}>
                        <Label className="text-sm">{prop.label}</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Slider
                            className="flex-1"
                            value={[currentValue as number]}
                            onValueChange={([val]) => handlePropChange(prop.name, val)}
                            min={0}
                            max={100}
                            step={1}
                          />
                          <Input
                            type="number"
                            className="w-20"
                            value={currentValue as number}
                            onChange={(e) => handlePropChange(prop.name, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    );

                  case "boolean":
                    return (
                      <div key={prop.name} className="flex items-center justify-between">
                        <Label className="text-sm">{prop.label}</Label>
                        <Switch
                          checked={currentValue as boolean}
                          onCheckedChange={(checked) => handlePropChange(prop.name, checked)}
                        />
                      </div>
                    );

                  case "select":
                    return (
                      <div key={prop.name}>
                        <Label className="text-sm">{prop.label}</Label>
                        <Select
                          value={currentValue as string}
                          onValueChange={(value) => handlePropChange(prop.name, value)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {prop.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );

                  default:
                    return (
                      <div key={prop.name} className="text-sm text-ltd-text-3">
                        Unsupported prop type: {prop.type}
                      </div>
                    );
                }
              })}
            </div>
          </div>

          <Separator />

          {/* Dependencies info */}
          <div>
            <h4 className="text-xs font-semibold text-ltd-text-2 uppercase tracking-wider mb-3">
              Dependencies
            </h4>
            <div className="space-y-2">
              {widgetDef.dependencies.modules.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-ltd-text-3">Modules:</span>
                  {widgetDef.dependencies.modules.map((mod) => (
                    <Badge key={mod} variant="outline" className="text-[10px]">
                      {mod}
                    </Badge>
                  ))}
                </div>
              )}
              {widgetDef.dependencies.resources.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-ltd-text-3">Resources:</span>
                  {widgetDef.dependencies.resources.map((res) => (
                    <Badge key={res} variant="outline" className="text-[10px]">
                      {res}
                    </Badge>
                  ))}
                </div>
              )}
              {widgetDef.dependencies.modules.length === 0 &&
                widgetDef.dependencies.resources.length === 0 && (
                  <p className="text-xs text-ltd-text-3">No dependencies</p>
                )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
