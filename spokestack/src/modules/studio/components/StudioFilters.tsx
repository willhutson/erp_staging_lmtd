"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface StudioFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: {
    id: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
  className?: string;
}

export function StudioFilters({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  className,
}: StudioFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = filters.filter((f) => f.value).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 border rounded-[var(--ltd-radius-md)] text-sm transition-colors",
              showFilters || activeFiltersCount > 0
                ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
            )}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-ltd-primary text-ltd-primary-text text-xs font-medium rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex-1 min-w-[150px] max-w-[200px]">
              <label className="block text-xs font-medium text-ltd-text-3 mb-1.5">
                {filter.label}
              </label>
              <select
                value={filter.value || ""}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                filters.forEach((f) => f.onChange?.(""));
              }}
              className="self-end inline-flex items-center gap-1.5 px-3 py-2 text-sm text-ltd-text-2 hover:text-ltd-text-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
