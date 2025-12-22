import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Activity,
  FileText,
  Users,
  Briefcase,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { getActivityFeed } from "@/modules/content-engine/services/event-bus";
import { formatDistanceToNow } from "date-fns";

// Inferred type from service
type ActivityEvent = Awaited<ReturnType<typeof getActivityFeed>>[number];

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  BRIEF: <Briefcase className="h-4 w-4" />,
  DELIVERABLE: <FileText className="h-4 w-4" />,
  CLIENT: <Users className="h-4 w-4" />,
  RFP: <FileText className="h-4 w-4" />,
  SKILL: <Zap className="h-4 w-4" />,
  KNOWLEDGE_DOC: <FileText className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-green-100 text-green-700",
  UPDATED: "bg-blue-100 text-blue-700",
  DELETED: "bg-red-100 text-red-700",
  STATUS_CHANGED: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  SUBMITTED: "bg-indigo-100 text-indigo-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATED: <CheckCircle className="h-3 w-3" />,
  UPDATED: <Clock className="h-3 w-3" />,
  DELETED: <XCircle className="h-3 w-3" />,
  STATUS_CHANGED: <AlertCircle className="h-3 w-3" />,
  APPROVED: <CheckCircle className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
  COMPLETED: <CheckCircle className="h-3 w-3" />,
};

export default async function ActivityPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const events = await getActivityFeed({ limit: 50 });

  // Group events by date
  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#52EDC7]" />
              Activity Feed
            </h1>
            <p className="text-gray-500 mt-1">
              Recent events across your content engine
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Events will appear here as you work with briefs, deliverables, and knowledge
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {dayEvents.map((event) => (
                      <ActivityEventCard key={event.entityId + event.timestamp.toISOString()} event={event} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityEventCard({ event }: { event: ActivityEvent }) {
  const actionColor = ACTION_COLORS[event.action] || "bg-gray-100 text-gray-700";
  const actionIcon = ACTION_ICONS[event.action];
  const entityIcon = ENTITY_ICONS[event.entityType] || <FileText className="h-4 w-4" />;

  // Build description based on metadata
  const description = buildEventDescription(event);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Entity Icon */}
      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
        {entityIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={actionColor} variant="secondary">
            {actionIcon}
            <span className="ml-1">{event.action.replace("_", " ")}</span>
          </Badge>
          <span className="text-sm text-gray-500">
            {event.entityType.toLowerCase()}
          </span>
        </div>
        <p className="text-sm text-gray-700">{description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function buildEventDescription(event: ActivityEvent): string {
  const metadata = event.metadata as Record<string, unknown>;

  switch (event.action) {
    case "STATUS_CHANGED": {
      const from = (metadata.previousState as Record<string, unknown>)?.status || "unknown";
      const to = (metadata.newState as Record<string, unknown>)?.status || "unknown";
      return `Status changed from ${from} to ${to}`;
    }
    case "CREATED": {
      const name = (metadata.newState as Record<string, unknown>)?.title ||
        (metadata.newState as Record<string, unknown>)?.name ||
        event.entityId;
      return `Created: ${name}`;
    }
    case "UPDATED": {
      const fields = (metadata.changedFields as string[]) || [];
      return fields.length > 0
        ? `Updated: ${fields.join(", ")}`
        : "Updated";
    }
    case "ASSIGNED": {
      return "Assigned to team member";
    }
    case "APPROVED": {
      return "Approved";
    }
    case "REJECTED": {
      return "Rejected";
    }
    case "COMPLETED": {
      return "Marked as completed";
    }
    default:
      return event.action.toLowerCase().replace("_", " ");
  }
}

function groupEventsByDate(events: ActivityEvent[]): Record<string, ActivityEvent[]> {
  const grouped: Record<string, ActivityEvent[]> = {};

  for (const event of events) {
    const date = event.timestamp.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  }

  return grouped;
}
