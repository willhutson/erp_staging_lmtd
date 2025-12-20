"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  invertChange?: boolean;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}

export function MetricCard({
  title,
  value,
  change,
  invertChange = false,
  icon,
  variant = "default",
}: MetricCardProps) {
  const isPositive = invertChange ? (change ?? 0) < 0 : (change ?? 0) > 0;
  const isNegative = invertChange ? (change ?? 0) > 0 : (change ?? 0) < 0;
  const isNeutral = change === 0 || change === undefined;

  const variantStyles = {
    default: "bg-card",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold">{value}</span>
          {change !== undefined && (
            <div
              className={`flex items-center text-sm ${
                isPositive
                  ? "text-green-600"
                  : isNegative
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : isNegative ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
