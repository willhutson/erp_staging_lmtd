"use client";

import { ReactNode } from "react";
import { LayoutConfig } from "../types";

interface DashboardGridProps {
  initialLayout: LayoutConfig;
  renderedWidgets: Record<string, ReactNode>;
}

export function DashboardGrid({ initialLayout, renderedWidgets }: DashboardGridProps) {
  // Sort widgets by their position (top to bottom, left to right)
  const sortedWidgets = [...initialLayout.widgets].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Grid layout using CSS Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            style={{
              gridColumn: `span ${Math.min(widget.position.w, 12)}`,
              gridRow: `span ${widget.position.h}`,
            }}
          >
            {renderedWidgets[widget.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
