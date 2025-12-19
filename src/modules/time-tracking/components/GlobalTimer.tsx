"use client";

import { useState, useEffect, useTransition } from "react";
import { Play, Square, Clock } from "lucide-react";
import { startTimer, stopTimer } from "../actions/timer-actions";
import type { TimeEntry, Brief, Client } from "@prisma/client";
import { cn } from "@/lib/utils";

type RunningTimer = TimeEntry & {
  brief: (Brief & { client: Client }) | null;
};

interface GlobalTimerProps {
  initialTimer: RunningTimer | null;
  briefs: (Brief & { client: Client })[];
}

export function GlobalTimer({ initialTimer, briefs }: GlobalTimerProps) {
  const [timer, setTimer] = useState<RunningTimer | null>(initialTimer);
  const [elapsed, setElapsed] = useState(0);
  const [selectedBriefId, setSelectedBriefId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!timer?.startTime) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(timer.startTime).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    startTransition(async () => {
      try {
        const entry = await startTimer(selectedBriefId || undefined);
        setTimer(entry as RunningTimer);
      } catch (error) {
        console.error("Failed to start timer:", error);
      }
    });
  };

  const handleStop = () => {
    if (!timer) return;

    startTransition(async () => {
      try {
        await stopTimer(timer.id);
        setTimer(null);
        setElapsed(0);
      } catch (error) {
        console.error("Failed to stop timer:", error);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        {/* Timer display */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span
            className={cn(
              "font-mono text-2xl font-bold",
              timer ? "text-[#1BA098]" : "text-gray-400"
            )}
          >
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Brief selector */}
        {!timer && (
          <select
            value={selectedBriefId}
            onChange={(e) => setSelectedBriefId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value="">Select a brief (optional)</option>
            {briefs.map((brief) => (
              <option key={brief.id} value={brief.id}>
                {brief.client.code} - {brief.title}
              </option>
            ))}
          </select>
        )}

        {/* Running timer info */}
        {timer && (
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {timer.brief
                ? `${timer.brief.client.code} - ${timer.brief.title}`
                : "No brief selected"}
            </p>
            <p className="text-xs text-gray-500">
              Started at{" "}
              {new Date(timer.startTime!).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Start/Stop button */}
        {timer ? (
          <button
            onClick={handleStop}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
      </div>
    </div>
  );
}
