"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEntryWithRelations } from "../types";
import { CalendarEntryCard } from "./CalendarEntryCard";
import { BriefDeadlineList } from "./BriefDeadlineMarker";
import type { BriefDeadlineMarker } from "../actions/brief-deadline-actions";

interface StudioCalendarProps {
  entries: CalendarEntryWithRelations[];
  briefDeadlines?: BriefDeadlineMarker[];
  onDateClick?: (date: Date) => void;
  onEntryClick?: (entry: CalendarEntryWithRelations) => void;
  onEntryDrop?: (entryId: string, newDate: Date) => void;
  onCreateClick?: (date: Date) => void;
  onDeadlineClick?: (deadline: BriefDeadlineMarker) => void;
  className?: string;
}

export function StudioCalendar({
  entries,
  briefDeadlines = [],
  onDateClick,
  onEntryClick,
  onEntryDrop,
  onCreateClick,
  onDeadlineClick,
  className,
}: StudioCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);

  // Calculate the days to display (including padding from prev/next months)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, CalendarEntryWithRelations[]> = {};
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.scheduledDate), "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry);
    });
    return grouped;
  }, [entries]);

  // Group deadlines by date
  const deadlinesByDate = useMemo(() => {
    const grouped: Record<string, BriefDeadlineMarker[]> = {};
    briefDeadlines.forEach((deadline) => {
      const dateKey = format(new Date(deadline.deadline), "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(deadline);
    });
    return grouped;
  }, [briefDeadlines]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, entryId: string) => {
    setDraggedEntryId(entryId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", entryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData("text/plain");
    if (entryId && onEntryDrop) {
      onEntryDrop(entryId, date);
    }
    setDraggedEntryId(null);
  };

  const handleDragEnd = () => {
    setDraggedEntryId(null);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ltd-border-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-ltd-text-1" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-ltd-text-1" />
          </button>
          <h2 className="text-lg font-semibold text-ltd-text-1 ml-2">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <button
          onClick={handleToday}
          className="px-3 py-1.5 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-ltd-border-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-ltd-text-3 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEntries = entriesByDate[dateKey] || [];
          const dayDeadlines = deadlinesByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const hasDeadlines = dayDeadlines.length > 0;

          return (
            <div
              key={dateKey}
              className={cn(
                "min-h-[100px] p-1 border-b border-r border-ltd-border-1 transition-colors",
                !isCurrentMonth && "bg-ltd-surface-1",
                draggedEntryId && "hover:bg-ltd-primary/5"
              )}
              onClick={() => onDateClick?.(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full",
                    isDayToday
                      ? "bg-ltd-primary text-ltd-primary-text"
                      : isCurrentMonth
                      ? "text-ltd-text-1"
                      : "text-ltd-text-3"
                  )}
                >
                  {format(day, "d")}
                </span>
                {onCreateClick && isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateClick(day);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 hover:bg-ltd-surface-3 transition-opacity group-hover:opacity-50"
                  >
                    <Plus className="w-3 h-3 text-ltd-text-3" />
                  </button>
                )}
              </div>

              {/* Brief Deadline Markers */}
              {hasDeadlines && (
                <div className="mb-1">
                  <BriefDeadlineList
                    deadlines={dayDeadlines}
                    onDeadlineClick={onDeadlineClick}
                    maxDisplay={2}
                  />
                </div>
              )}

              {/* Entries */}
              <div className="space-y-0.5 overflow-hidden">
                {dayEntries.slice(0, hasDeadlines ? 2 : 3).map((entry) => (
                  <CalendarEntryCard
                    key={entry.id}
                    entry={entry}
                    compact
                    draggable
                    onDragStart={(e) => handleDragStart(e, entry.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEntryClick?.(entry)}
                  />
                ))}
                {dayEntries.length > (hasDeadlines ? 2 : 3) && (
                  <button
                    className="w-full text-xs text-ltd-text-3 hover:text-ltd-primary text-left px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick?.(day);
                    }}
                  >
                    +{dayEntries.length - (hasDeadlines ? 2 : 3)} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
