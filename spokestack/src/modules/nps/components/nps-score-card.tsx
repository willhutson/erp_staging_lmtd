"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NPSScoreCardProps {
  score: number;
  previousScore?: number | null;
  label?: string;
  size?: "sm" | "lg";
}

export function NPSScoreCard({
  score,
  previousScore,
  label = "NPS Score",
  size = "lg",
}: NPSScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 50) return "text-green-600";
    if (s >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (s: number) => {
    if (s >= 50) return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    if (s >= 0) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
    return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 50) return "Excellent";
    if (s >= 30) return "Good";
    if (s >= 0) return "Needs Improvement";
    return "Critical";
  };

  const trend = previousScore !== null && previousScore !== undefined
    ? score - previousScore
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border",
        getScoreBg(score),
        size === "lg" ? "p-6" : "p-4"
      )}
    >
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span
          className={cn(
            "font-bold",
            getScoreColor(score),
            size === "lg" ? "text-4xl" : "text-2xl"
          )}
        >
          {score > 0 ? "+" : ""}
          {score}
        </span>
        {trend !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm mb-1",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            {Math.abs(trend)}
          </span>
        )}
      </div>
      {size === "lg" && (
        <p className="text-xs text-muted-foreground mt-2">
          {getScoreLabel(score)}
        </p>
      )}
    </div>
  );
}
