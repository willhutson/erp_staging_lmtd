"use client";

import { GripVertical, X, Settings, LucideIcon } from "lucide-react";
import { WidgetDefinition } from "../types";
import {
  CheckSquare,
  Users,
  Calendar,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Square,
} from "lucide-react";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  CheckSquare,
  Users,
  Calendar,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Square,
};

interface WidgetWrapperProps {
  definition: WidgetDefinition;
  children: React.ReactNode;
  isEditing?: boolean;
  onRemove?: () => void;
  onSettings?: () => void;
}

export function WidgetWrapper({
  definition,
  children,
  isEditing = false,
  onRemove,
  onSettings,
}: WidgetWrapperProps) {
  // Get the icon component from the map
  const IconComponent = iconMap[definition.icon] || Square;

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {isEditing && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 drag-handle">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <IconComponent className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900 text-sm">{definition.name}</h3>
        </div>
        {isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
