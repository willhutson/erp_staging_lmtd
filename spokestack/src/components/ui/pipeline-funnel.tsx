"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  value: number;
  color: string;
}

interface PipelineFunnelProps {
  stages: FunnelStage[];
  title?: string;
  showConversion?: boolean;
  showValue?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function calculateConversion(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round((current / previous) * 100);
}

export function PipelineFunnel({
  stages,
  title = "Pipeline",
  showConversion = true,
  showValue = true,
  className,
}: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <Card className={cn("overflow-hidden", className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-4">
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercent = (stage.count / maxCount) * 100;
            const prevStage = index > 0 ? stages[index - 1] : null;
            const conversion = prevStage ? calculateConversion(stage.count, prevStage.count) : 100;

            return (
              <div key={stage.id} className="relative">
                {/* Conversion arrow between stages */}
                {index > 0 && showConversion && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-1 z-10">
                    <ArrowRight className="h-2.5 w-2.5" />
                    <span>{conversion}%</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Stage bar */}
                  <div className="flex-1 relative">
                    <div
                      className={cn(
                        "h-10 rounded-lg transition-all duration-500 ease-out flex items-center px-3 relative overflow-hidden group cursor-pointer hover:opacity-90",
                        stage.color
                      )}
                      style={{ width: `${Math.max(widthPercent, 20)}%` }}
                    >
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      <span className="text-white font-medium text-sm truncate relative z-10">
                        {stage.name}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="w-20 text-right shrink-0">
                    <p className="font-bold text-lg tabular-nums">{stage.count}</p>
                    {showValue && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stage.value)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Pipeline</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stages.reduce((sum, s) => sum + s.value, 0))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold text-emerald-500">
              {stages.length > 1 ? calculateConversion(stages[stages.length - 1].count, stages[0].count) : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Horizontal mini funnel for inline use
interface MiniFunnelProps {
  stages: Array<{ name: string; count: number; color: string }>;
  className?: string;
}

export function MiniFunnel({ stages, className }: MiniFunnelProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map((stage, index) => (
        <React.Fragment key={stage.name}>
          <div className="flex items-center gap-1.5">
            <div
              className={cn("w-3 h-3 rounded-full", stage.color)}
            />
            <span className="text-sm font-medium">{stage.count}</span>
          </div>
          {index < stages.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Vertical funnel visualization (classic funnel shape)
interface VerticalFunnelProps {
  stages: FunnelStage[];
  className?: string;
}

export function VerticalFunnel({ stages, className }: VerticalFunnelProps) {
  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <div className={cn("space-y-0", className)}>
      {stages.map((stage, index) => {
        const widthPercent = (stage.count / maxCount) * 100;
        const nextStage = stages[index + 1];
        const nextWidthPercent = nextStage ? (nextStage.count / maxCount) * 100 : widthPercent;

        return (
          <div key={stage.id} className="relative group">
            {/* Main bar */}
            <div
              className="mx-auto transition-all duration-300 relative"
              style={{ width: `${Math.max(widthPercent, 30)}%` }}
            >
              <div
                className={cn(
                  "h-14 rounded-t-lg flex items-center justify-center text-white font-medium relative overflow-hidden cursor-pointer",
                  stage.color,
                  index === stages.length - 1 && "rounded-b-lg"
                )}
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="text-center relative z-10">
                  <p className="font-semibold">{stage.name}</p>
                  <p className="text-sm opacity-90">{stage.count} • {formatCurrency(stage.value)}</p>
                </div>
              </div>

              {/* Connector trapezoid */}
              {index < stages.length - 1 && (
                <div
                  className="h-2 mx-auto"
                  style={{
                    background: `linear-gradient(to bottom, ${getColorValue(stage.color)}, ${getColorValue(stages[index + 1].color)})`,
                    clipPath: `polygon(0 0, 100% 0, ${50 + (nextWidthPercent / widthPercent) * 50}% 100%, ${50 - (nextWidthPercent / widthPercent) * 50}% 100%)`,
                  }}
                />
              )}
            </div>

            {/* Conversion label */}
            {index < stages.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {calculateConversion(stages[index + 1].count, stage.count)}% →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract color value from Tailwind class (simplified)
function getColorValue(colorClass: string): string {
  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-cyan-500": "#06b6d4",
    "bg-emerald-500": "#10b981",
    "bg-amber-500": "#f59e0b",
    "bg-primary": "#52EDC7",
    "bg-violet-500": "#8b5cf6",
    "bg-pink-500": "#ec4899",
    "bg-slate-500": "#64748b",
  };
  return colorMap[colorClass] || "#6b7280";
}

// Demo data export
export const DEMO_PIPELINE_STAGES: FunnelStage[] = [
  { id: "1", name: "Prospects", count: 45, value: 2250000, color: "bg-slate-500" },
  { id: "2", name: "Qualified", count: 28, value: 1400000, color: "bg-blue-500" },
  { id: "3", name: "Proposal", count: 15, value: 890000, color: "bg-cyan-500" },
  { id: "4", name: "Negotiation", count: 8, value: 480000, color: "bg-amber-500" },
  { id: "5", name: "Won", count: 5, value: 320000, color: "bg-emerald-500" },
];
