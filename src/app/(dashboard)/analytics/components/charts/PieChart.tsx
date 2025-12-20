"use client";

import { useMemo } from "react";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
  }>;
  height?: number;
}

const COLORS = [
  "#52EDC7",
  "#1BA098",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#6366F1",
];

export function PieChart({ data, height = 200 }: PieChartProps) {
  const { slices, total } = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;

    const sliceData = data.map((item, i) => {
      const percentage = sum > 0 ? (item.value / sum) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        ...item,
        percentage: item.percentage ?? percentage,
        startAngle,
        endAngle: currentAngle,
        color: COLORS[i % COLORS.length],
      };
    });

    return { slices: sliceData, total: sum };
  }, [data]);

  const size = Math.min(height - 40, 180);
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  const getArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + r * Math.cos(startRad);
    const y1 = centerY + r * Math.sin(startRad);
    const x2 = centerX + r * Math.cos(endRad);
    const y2 = centerY + r * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex items-center gap-6" style={{ height }}>
      {/* Pie */}
      <div className="flex-shrink-0">
        <svg width={size} height={size}>
          {slices.map((slice, i) => (
            <path
              key={i}
              d={getArcPath(slice.startAngle, slice.endAngle, radius)}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>
                {slice.name}: {slice.value} ({slice.percentage.toFixed(1)}%)
              </title>
            </path>
          ))}
          {/* Center hole for donut effect */}
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="white" />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold fill-current"
          >
            {total}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate max-w-[120px]">{slice.name}</span>
            </div>
            <span className="text-muted-foreground">
              {slice.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
