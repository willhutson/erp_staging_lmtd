"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import type { ClientActivity, ActivityType } from "@prisma/client";
import { createActivity } from "../actions/activity-actions";
import { useRouter } from "next/navigation";

type ActivityWithUser = ClientActivity & {
  user: { id: string; name: string; avatarUrl: string | null };
};

interface ActivityTimelineProps {
  activities: ActivityWithUser[];
  clientId: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  NOTE: <MessageSquare className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  CALL: <Phone className="w-4 h-4" />,
  MEETING: <Calendar className="w-4 h-4" />,
  TASK: <CheckSquare className="w-4 h-4" />,
  STATUS_CHANGE: <ArrowRight className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  NOTE: "bg-gray-100 text-gray-600",
  EMAIL: "bg-blue-100 text-blue-600",
  CALL: "bg-green-100 text-green-600",
  MEETING: "bg-purple-100 text-purple-600",
  TASK: "bg-yellow-100 text-yellow-600",
  STATUS_CHANGE: "bg-orange-100 text-orange-600",
};

export function ActivityTimeline({
  activities,
  clientId,
}: ActivityTimelineProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("NOTE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createActivity({
          clientId,
          type: activityType,
          title,
          description: description || undefined,
        });
        setTitle("");
        setDescription("");
        setShowForm(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to create activity:", error);
      }
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return new Date(date).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Activity</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm text-[#1BA098] hover:underline"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["NOTE", "EMAIL", "CALL", "MEETING"] as ActivityType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivityType(type)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      activityType === type
                        ? "bg-[#52EDC7] text-gray-900"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {activityIcons[type]}
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity title..."
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !title}
                className="px-4 py-1.5 text-sm bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Log Activity"}
              </button>
            </div>
          </div>
        </form>
      )}

      {activities.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No activity logged yet
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activityColors[activity.type]
                }`}
              >
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  by {activity.user.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
