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
    if (s >= 50) return "bg-green-50 border-green-200";
    if (s >= 0) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
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
      <p className="text-sm text-gray-500 mb-1">{label}</p>
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
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500"
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
        <p className="text-xs text-gray-400 mt-2">
          {score >= 50
            ? "Excellent"
            : score >= 30
              ? "Good"
              : score >= 0
                ? "Needs Improvement"
                : "Critical"}
        </p>
      )}
    </div>
  );
}
