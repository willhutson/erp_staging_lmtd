"use client";

import { useMemo } from "react";

interface HeatmapChartProps {
  data: Array<{
    userId: string;
    userName: string;
    weekData: number[];
  }>;
  height?: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HeatmapChart({ data, height = 300 }: HeatmapChartProps) {
  const { maxValue, rows } = useMemo(() => {
    let max = 0;
    data.forEach((row) => {
      row.weekData.forEach((val) => {
        if (val > max) max = val;
      });
    });
    return { maxValue: max || 1, rows: data };
  }, [data]);

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return "bg-muted";
    if (intensity < 0.25) return "bg-primary/20";
    if (intensity < 0.5) return "bg-primary/40";
    if (intensity < 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  const cellSize = Math.min(40, (height - 60) / (rows.length + 1));

  return (
    <div className="overflow-x-auto" style={{ height }}>
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="flex mb-2">
          <div className="w-32 flex-shrink-0" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex-1 text-center text-xs text-muted-foreground"
              style={{ minWidth: cellSize }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {rows.slice(0, 10).map((row) => (
            <div key={row.userId} className="flex items-center">
              <div className="w-32 flex-shrink-0 text-sm truncate pr-2">
                {row.userName}
              </div>
              {row.weekData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center"
                  style={{ minWidth: cellSize, height: cellSize }}
                >
                  <div
                    className={`rounded ${getColor(value)} transition-colors hover:ring-2 hover:ring-primary/50`}
                    style={{
                      width: cellSize - 4,
                      height: cellSize - 4,
                    }}
                    title={`${row.userName}: ${value}h on ${DAYS[i]}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-muted" />
            <div className="w-4 h-4 rounded bg-primary/20" />
            <div className="w-4 h-4 rounded bg-primary/40" />
            <div className="w-4 h-4 rounded bg-primary/60" />
            <div className="w-4 h-4 rounded bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}
