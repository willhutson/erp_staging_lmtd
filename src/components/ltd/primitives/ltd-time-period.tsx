"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimePeriodPreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "all_time"
  | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimePeriodValue {
  preset: TimePeriodPreset;
  range: DateRange;
  label: string;
}

interface TimePeriodSelectorProps {
  value?: TimePeriodValue;
  onChange?: (value: TimePeriodValue) => void;
  presets?: TimePeriodPreset[];
  showCustom?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const presetLabels: Record<TimePeriodPreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  last_week: "Last Week",
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  this_quarter: "This Quarter",
  last_quarter: "Last Quarter",
  this_year: "This Year",
  last_year: "Last Year",
  all_time: "All Time",
  custom: "Custom Range",
};

function getPresetRange(preset: TimePeriodPreset): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (preset) {
    case "today":
      return { start: today, end: tomorrow };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }

    case "this_week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: tomorrow };
    }

    case "last_week": {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 7);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }

    case "last_7_days": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { start: sevenDaysAgo, end: tomorrow };
    }

    case "last_30_days": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { start: thirtyDaysAgo, end: tomorrow };
    }

    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: tomorrow };
    }

    case "last_month": {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfLastMonth, end: endOfLastMonth };
    }

    case "this_quarter": {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfQuarter = new Date(now.getFullYear(), quarterMonth, 1);
      return { start: startOfQuarter, end: tomorrow };
    }

    case "last_quarter": {
      const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfLastQuarter = new Date(now.getFullYear(), currentQuarterMonth - 3, 1);
      const endOfLastQuarter = new Date(now.getFullYear(), currentQuarterMonth, 1);
      return { start: startOfLastQuarter, end: endOfLastQuarter };
    }

    case "this_year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfYear, end: tomorrow };
    }

    case "last_year": {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfLastYear, end: endOfLastYear };
    }

    case "all_time":
      return { start: new Date(2020, 0, 1), end: tomorrow };

    case "custom":
    default:
      return { start: today, end: tomorrow };
  }
}

const defaultPresets: TimePeriodPreset[] = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "this_quarter",
  "all_time",
];

export function TimePeriodSelector({
  value,
  onChange,
  presets = defaultPresets,
  showCustom = true,
  size = "md",
  className,
}: TimePeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentValue = useMemo(() => {
    if (value) return value;
    const defaultPreset = "last_30_days";
    return {
      preset: defaultPreset,
      range: getPresetRange(defaultPreset),
      label: presetLabels[defaultPreset],
    };
  }, [value]);

  const handlePresetSelect = (preset: TimePeriodPreset) => {
    if (preset === "custom") {
      setShowCustomInput(true);
      return;
    }

    const range = getPresetRange(preset);
    onChange?.({
      preset,
      range,
      label: presetLabels[preset],
    });
    setIsOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;

    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setDate(end.getDate() + 1); // Include the end date

    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    onChange?.({
      preset: "custom",
      range: { start, end },
      label: `${formatDate(start)} – ${formatDate(new Date(customEnd))}`,
    });
    setIsOpen(false);
    setShowCustomInput(false);
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 hover:bg-ltd-surface-2 transition-colors",
          sizeClasses[size]
        )}
      >
        <Calendar className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4", "text-ltd-text-2")} />
        <span className="font-medium">{currentValue.label}</span>
        <ChevronDown
          className={cn(
            size === "sm" ? "w-3 h-3" : "w-4 h-4",
            "text-ltd-text-3 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay shadow-lg overflow-hidden">
            {/* Preset options */}
            <div className="py-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-ltd-surface-2 transition-colors",
                    currentValue.preset === preset
                      ? "text-ltd-primary bg-ltd-primary/5"
                      : "text-ltd-text-1"
                  )}
                >
                  <span>{presetLabels[preset]}</span>
                  {currentValue.preset === preset && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}

              {showCustom && (
                <>
                  <div className="border-t border-ltd-border-1 my-1" />
                  <button
                    onClick={() => handlePresetSelect("custom")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-ltd-surface-2 transition-colors",
                      currentValue.preset === "custom" || showCustomInput
                        ? "text-ltd-primary bg-ltd-primary/5"
                        : "text-ltd-text-1"
                    )}
                  >
                    <span>{presetLabels.custom}</span>
                    {currentValue.preset === "custom" && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Custom date input */}
            {showCustomInput && (
              <div className="border-t border-ltd-border-1 p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-ltd-text-2 mb-1">
                      Start
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-sm)] focus:outline-none focus:ring-2 focus:ring-ltd-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ltd-text-2 mb-1">
                      End
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-sm)] focus:outline-none focus:ring-2 focus:ring-ltd-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="w-full px-3 py-1.5 text-sm font-medium bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for inline use
export function TimePeriodChips({
  value,
  onChange,
  presets = ["last_7_days", "last_30_days", "this_month", "this_quarter"],
  className,
}: Omit<TimePeriodSelectorProps, "size" | "showCustom">) {
  const currentPreset = value?.preset || "last_30_days";

  const handleSelect = (preset: TimePeriodPreset) => {
    const range = getPresetRange(preset);
    onChange?.({
      preset,
      range,
      label: presetLabels[preset],
    });
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => handleSelect(preset)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full transition-colors",
            currentPreset === preset
              ? "bg-ltd-primary text-ltd-primary-text"
              : "bg-ltd-surface-2 text-ltd-text-2 hover:bg-ltd-surface-3"
          )}
        >
          {presetLabels[preset]}
        </button>
      ))}
    </div>
  );
}

// Helper hook for using time periods
export function useTimePeriod(initialPreset: TimePeriodPreset = "last_30_days") {
  const [timePeriod, setTimePeriod] = useState<TimePeriodValue>(() => ({
    preset: initialPreset,
    range: getPresetRange(initialPreset),
    label: presetLabels[initialPreset],
  }));

  return {
    timePeriod,
    setTimePeriod,
    startDate: timePeriod.range.start,
    endDate: timePeriod.range.end,
    isPreset: (preset: TimePeriodPreset) => timePeriod.preset === preset,
  };
}
