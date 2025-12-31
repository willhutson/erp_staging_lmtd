"use client";

import { X } from "lucide-react";
import type { Client, User } from "@prisma/client";
import type { BriefType } from "@/../config/forms";
import { briefTypeLabels } from "@/../config/forms";

export interface FilterState {
  assigneeId: string | null;
  clientId: string | null;
  briefType: BriefType | null;
  briefedById: string | null;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  clients: Client[];
  users: User[];
}

export function FilterBar({
  filters,
  onFilterChange,
  clients,
  users,
}: FilterBarProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFilterChange({ ...filters, [key]: value || null });
  };

  const clearFilters = () => {
    onFilterChange({
      assigneeId: null,
      clientId: null,
      briefType: null,
      briefedById: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  const briefTypes: BriefType[] = [
    "VIDEO_SHOOT",
    "VIDEO_EDIT",
    "DESIGN",
    "COPYWRITING_EN",
    "COPYWRITING_AR",
    "PAID_MEDIA",
    "REPORT",
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Assignee Filter */}
      <select
        value={filters.assigneeId || ""}
        onChange={(e) => updateFilter("assigneeId", e.target.value || null)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
      >
        <option value="">All Assignees</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* Client Filter */}
      <select
        value={filters.clientId || ""}
        onChange={(e) => updateFilter("clientId", e.target.value || null)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
      >
        <option value="">All Clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {/* Brief Type Filter */}
      <select
        value={filters.briefType || ""}
        onChange={(e) =>
          updateFilter("briefType", (e.target.value as BriefType) || null)
        }
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
      >
        <option value="">All Types</option>
        {briefTypes.map((type) => (
          <option key={type} value={type}>
            {briefTypeLabels[type]}
          </option>
        ))}
      </select>

      {/* Briefed By Filter */}
      <select
        value={filters.briefedById || ""}
        onChange={(e) => updateFilter("briefedById", e.target.value || null)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
      >
        <option value="">All Briefers</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear filters
        </button>
      )}

      {/* Active filter count */}
      {hasActiveFilters && (
        <span className="text-xs text-gray-500">
          {Object.values(filters).filter((v) => v !== null).length} active
        </span>
      )}
    </div>
  );
}
