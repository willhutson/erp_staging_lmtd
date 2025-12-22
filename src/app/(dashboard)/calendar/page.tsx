"use client"

import { useState } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const events = [
  { id: "1", title: "Client Presentation - TechCorp", date: 15, type: "meeting" },
  { id: "2", title: "Campaign Launch", date: 18, type: "deadline" },
  { id: "3", title: "Creative Review", date: 22, type: "review" },
  { id: "4", title: "Q1 Planning", date: 25, type: "meeting" },
]

export default function CalendarPage() {
  const [currentDate] = useState(new Date(2024, 0, 1))
  const month = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getEventsForDay = (day: number) => events.filter((e) => e.date === day)

  return (
    <PageShell
      title="Calendar"
      actions={
        <LtdButton>
          <Plus className="h-4 w-4" />
          Add Event
        </LtdButton>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {month} {year}
          </h2>
          <div className="flex gap-2">
            <LtdButton variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </LtdButton>
            <LtdButton variant="outline" size="sm">
              Today
            </LtdButton>
            <LtdButton variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </LtdButton>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="min-h-24 border-b border-r bg-muted/20" />
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isToday = day === 15
              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-24 border-b border-r p-2 hover:bg-muted/50 transition-colors",
                    isToday && "bg-ltd-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isToday &&
                        "inline-flex h-6 w-6 items-center justify-center rounded-full bg-ltd-primary text-ltd-primary-text",
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1.5 rounded-md cursor-pointer hover:opacity-80",
                          event.type === "meeting" &&
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                          event.type === "deadline" && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                          event.type === "review" &&
                            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {month} {event.date}, {year}
                  </div>
                </div>
                <LtdBadge
                  status={event.type === "deadline" ? "error" : event.type === "review" ? "warning" : "info"}
                >
                  {event.type}
                </LtdBadge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
