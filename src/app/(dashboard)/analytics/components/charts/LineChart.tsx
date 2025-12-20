"use client";

import { useMemo } from "react";

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  lines: Array<{
    key: string;
    color: string;
    label: string;
  }>;
  height?: number;
}

export function LineChart({ data, xKey, lines, height = 200 }: LineChartProps) {
  const { maxValue, minValue, chartData, points } = useMemo(() => {
    let max = 0;
    let min = Infinity;

    const processed = data.map((item, i) => {
      const values: Record<string, number> = {};
      lines.forEach((line) => {
        const val = Number(item[line.key]) || 0;
        values[line.key] = val;
        if (val > max) max = val;
        if (val < min) min = val;
      });
      return {
        label: String(item[xKey]),
        values,
        index: i,
      };
    });

    // Calculate SVG points for each line
    const chartHeight = height - 60;
    const chartWidth = 100; // percentage
    const range = max - min || 1;

    const linePoints: Record<string, string> = {};
    lines.forEach((line) => {
      const pts = processed.map((item, i) => {
        const x = (i / (processed.length - 1 || 1)) * chartWidth;
        const y = chartHeight - ((item.values[line.key] - min) / range) * chartHeight;
        return `${x},${y}`;
      });
      linePoints[line.key] = pts.join(" ");
    });

    return {
      maxValue: max,
      minValue: min,
      chartData: processed,
      points: linePoints,
    };
  }, [data, xKey, lines, height]);

  const chartHeight = height - 60;

  return (
    <div className="w-full" style={{ height }}>
      {/* Legend */}
      <div className="flex gap-4 mb-4 justify-center">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-2 text-sm">
            <div
              className="w-6 h-0.5 rounded"
              style={{ backgroundColor: line.color }}
            />
            <span className="text-muted-foreground">{line.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={(y / 100) * chartHeight}
              x2="100"
              y2={(y / 100) * chartHeight}
              stroke="currentColor"
              strokeOpacity="0.1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Lines */}
          {lines.map((line) => (
            <polyline
              key={line.key}
              points={points[line.key]}
              fill="none"
              stroke={line.color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="transition-all"
            />
          ))}

          {/* Data points */}
          {lines.map((line) =>
            chartData.map((item, i) => {
              const x = (i / (chartData.length - 1 || 1)) * 100;
              const range = maxValue - minValue || 1;
              const y =
                chartHeight -
                ((item.values[line.key] - minValue) / range) * chartHeight;
              return (
                <circle
                  key={`${line.key}-${i}`}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill={line.color}
                  className="hover:r-3 transition-all"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>
                    {line.label}: {item.values[line.key]}
                  </title>
                </circle>
              );
            })
          )}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {chartData
            .filter(
              (_, i) =>
                i === 0 ||
                i === chartData.length - 1 ||
                i === Math.floor(chartData.length / 2)
            )
            .map((item) => (
              <span
                key={item.label}
                className="text-xs text-muted-foreground"
              >
                {item.label}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
