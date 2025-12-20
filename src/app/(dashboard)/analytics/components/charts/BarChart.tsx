"use client";

import { useMemo } from "react";

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: Array<{
    key: string;
    color: string;
    label: string;
  }>;
  height?: number;
}

export function BarChart({ data, xKey, bars, height = 200 }: BarChartProps) {
  const { maxValue, chartData } = useMemo(() => {
    let max = 0;
    const processed = data.map((item) => {
      const values: Record<string, number> = {};
      bars.forEach((bar) => {
        const val = Number(item[bar.key]) || 0;
        values[bar.key] = val;
        if (val > max) max = val;
      });
      return {
        label: String(item[xKey]),
        values,
      };
    });
    return { maxValue: max || 1, chartData: processed };
  }, [data, xKey, bars]);

  const barWidth = Math.max(20, Math.min(60, 300 / data.length));
  const _groupWidth = barWidth * bars.length + 10;
  void _groupWidth; // Reserved for future use

  return (
    <div className="w-full" style={{ height }}>
      {/* Legend */}
      <div className="flex gap-4 mb-4 justify-center">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: bar.color }}
            />
            <span className="text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-[calc(100%-60px)] flex items-end justify-center gap-2">
        {chartData.map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="flex items-end gap-1"
              style={{ height: height - 80 }}
            >
              {bars.map((bar) => {
                const value = item.values[bar.key];
                const barHeight = (value / maxValue) * (height - 80);
                return (
                  <div
                    key={bar.key}
                    className="rounded-t transition-all hover:opacity-80 relative group"
                    style={{
                      width: barWidth,
                      height: Math.max(2, barHeight),
                      backgroundColor: bar.color,
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {bar.label}: {value}
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground mt-2 truncate max-w-[80px]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
