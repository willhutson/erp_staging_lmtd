"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FuelGaugeProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "linear" | "circular";
  className?: string;
}

function getLevel(value: number): "low" | "medium" | "high" | "critical" {
  if (value < 50) return "low";
  if (value < 75) return "medium";
  if (value < 90) return "high";
  return "critical";
}

function getColor(level: "low" | "medium" | "high" | "critical"): string {
  switch (level) {
    case "low":
      return "text-emerald-500";
    case "medium":
      return "text-amber-500";
    case "high":
      return "text-orange-500";
    case "critical":
      return "text-red-500";
  }
}

export function FuelGauge({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  variant = "linear",
  className,
}: FuelGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const level = getLevel(percentage);
  const colorClass = getColor(level);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const circularSizes = {
    sm: { size: 48, stroke: 4 },
    md: { size: 64, stroke: 6 },
    lg: { size: 80, stroke: 8 },
  };

  if (variant === "circular") {
    const { size: circleSize, stroke } = circularSizes[size];
    const radius = (circleSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          {/* Value circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(colorClass, "transition-all duration-500")}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-semibold", size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base")}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        {label && (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
          {showValue && (
            <span className={cn("text-sm font-medium", colorClass)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "fuel-gauge w-full rounded-full overflow-hidden",
          sizeClasses[size]
        )}
        style={{ "--gauge-fill": `${percentage}%` } as React.CSSProperties}
        data-level={level}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      />
    </div>
  );
}

// Capacity indicator for team workload
interface CapacityIndicatorProps {
  allocated: number;
  available: number;
  label?: string;
  showDetails?: boolean;
  className?: string;
}

export function CapacityIndicator({
  allocated,
  available,
  label,
  showDetails = true,
  className,
}: CapacityIndicatorProps) {
  const percentage = available > 0 ? (allocated / available) * 100 : 0;
  const remaining = available - allocated;
  const level = getLevel(percentage);

  return (
    <div className={cn("space-y-2", className)}>
      <FuelGauge
        value={allocated}
        max={available}
        label={label}
        showValue
      />
      {showDetails && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{allocated}h allocated</span>
          <span className={cn(
            remaining < 0 ? "text-red-500 font-medium" : ""
          )}>
            {remaining >= 0 ? `${remaining}h remaining` : `${Math.abs(remaining)}h over`}
          </span>
        </div>
      )}
    </div>
  );
}

// Retainer burn gauge
interface RetainerBurnProps {
  used: number;
  total: number;
  clientName?: string;
  showWarning?: boolean;
  className?: string;
}

export function RetainerBurn({
  used,
  total,
  clientName,
  showWarning = true,
  className,
}: RetainerBurnProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        {clientName && (
          <span className="font-medium text-sm">{clientName}</span>
        )}
        <span className={cn(
          "text-sm",
          isOverLimit ? "text-red-500 font-semibold" :
          isNearLimit ? "text-amber-500" :
          "text-muted-foreground"
        )}>
          {used}h / {total}h
        </span>
      </div>
      <FuelGauge
        value={used}
        max={total}
        showValue={false}
      />
      {showWarning && isNearLimit && !isOverLimit && (
        <p className="text-xs text-amber-500 flex items-center gap-1">
          <span className="animate-pulse">⚠</span>
          Approaching retainer limit
        </p>
      )}
      {showWarning && isOverLimit && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="animate-pulse">🚨</span>
          Over retainer limit by {used - total}h
        </p>
      )}
    </div>
  );
}
