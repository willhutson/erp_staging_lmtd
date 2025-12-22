export interface ActivityItem {
  id: string
  timestamp: string
  actor: string
  action: string
  metadata?: Record<string, string>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 pb-4 border-b border-ltd-border-1 last:border-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ltd-surface-3 flex items-center justify-center">
            <span className="text-xs font-medium text-ltd-text-1">{activity.actor.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ltd-text-1">
              <span className="font-medium">{activity.actor}</span> {activity.action}
            </p>
            <p className="text-xs text-ltd-text-3 mt-1">{activity.timestamp}</p>
            {activity.metadata && (
              <div className="mt-2 text-xs text-ltd-text-2">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
