import { LucideIcon } from "lucide-react";
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
}

export function WidgetWrapper({
  definition,
  children,
  isEditing = false,
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <IconComponent className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900 text-sm">{definition.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
