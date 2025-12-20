# Phase 6: Notification System - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Phase 5 (Form Submissions)

---

## Overview

The notification system provides multi-channel communication to keep users informed about events relevant to them. It's designed as a platform component with tenant-specific configuration.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EVENT SOURCES                    NOTIFICATION ENGINE         CHANNELS       │
│                                                                              │
│  ┌─────────────┐                 ┌─────────────────┐      ┌─────────────┐   │
│  │ Brief       │──┐              │                 │      │ In-App      │   │
│  │ Events      │  │              │  • Filter       │  ┌──▶│ (Real-time) │   │
│  └─────────────┘  │              │  • Enrich       │  │   └─────────────┘   │
│                   │              │  • Template     │  │                      │
│  ┌─────────────┐  │  ┌───────┐  │  • Route        │  │   ┌─────────────┐   │
│  │ Submission  │──┼─▶│ Queue │─▶│  • Deliver      │──┼──▶│ Email       │   │
│  │ Events      │  │  └───────┘  │                 │  │   └─────────────┘   │
│  └─────────────┘  │              │                 │  │                      │
│                   │              └─────────────────┘  │   ┌─────────────┐   │
│  ┌─────────────┐  │                                  └──▶│ Slack       │   │
│  │ Time        │──┤                                      └─────────────┘   │
│  │ Events      │  │                                                         │
│  └─────────────┘  │              ┌─────────────────┐      ┌─────────────┐   │
│                   │              │ USER PREFERENCES │      │ Push        │   │
│  ┌─────────────┐  │              │                 │  ┌──▶│ (Future)    │   │
│  │ System      │──┘              │ Per-user config │──┘   └─────────────┘   │
│  │ Events      │                 │ for channels    │                         │
│  └─────────────┘                 └─────────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Platform Tables

```prisma
// Notification records
model Notification {
  id              String   @id @default(cuid())
  organizationId  String

  // Recipient
  userId          String

  // Content
  type            String   // e.g., "brief.assigned", "submission.approved"
  title           String
  body            String?

  // Navigation
  actionUrl       String?  // Where to go when clicked
  actionLabel     String?  // "View Brief"

  // Context
  entityType      String?  // "brief", "submission", "rfp"
  entityId        String?
  metadata        Json?    // Additional context data

  // Status
  isRead          Boolean  @default(false)
  readAt          DateTime?
  isArchived      Boolean  @default(false)
  archivedAt      DateTime?

  // Delivery tracking
  channels        String[] @default(["in_app"])
  deliveryStatus  Json     @default("{}")
  // Structure: { "email": "sent", "slack": "delivered", "in_app": "read" }

  // Timestamps
  createdAt       DateTime @default(now())
  expiresAt       DateTime?  // Auto-archive after this

  // Relations
  user            User     @relation(fields: [userId], references: [id])

  @@index([userId, isRead, createdAt])
  @@index([organizationId, createdAt])
  @@index([entityType, entityId])
  @@map("notifications")
}

// User notification preferences
model NotificationPreference {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Global settings
  emailEnabled    Boolean  @default(true)
  slackEnabled    Boolean  @default(true)
  inAppEnabled    Boolean  @default(true)

  // Digest settings
  emailDigest     String   @default("instant")  // "instant", "daily", "weekly", "none"
  digestTime      String?  @default("09:00")    // When to send digest

  // Quiet hours
  quietHoursEnabled Boolean @default(false)
  quietHoursStart  String?  @default("22:00")
  quietHoursEnd    String?  @default("08:00")
  timezone         String   @default("Asia/Dubai")

  // Per-type preferences (overrides globals)
  typePreferences  Json     @default("{}")
  // Structure: {
  //   "brief.assigned": { "email": true, "slack": true, "in_app": true },
  //   "brief.deadline": { "email": false, "slack": true, "in_app": true },
  //   ...
  // }

  // Relations
  user            User     @relation(fields: [userId], references: [id])

  @@map("notification_preferences")
}

// Notification templates (per-tenant customization)
model NotificationTemplate {
  id              String   @id @default(cuid())
  organizationId  String

  type            String   // e.g., "brief.assigned"
  channel         String   // "email", "slack", "in_app"

  // Content
  subject         String?  // For email
  title           String   // For in-app/slack
  body            String   // Supports {{variables}}

  // Slack-specific
  slackBlocks     Json?    // Block Kit JSON

  // Email-specific
  emailTemplate   String?  // HTML template name

  isActive        Boolean  @default(true)

  @@unique([organizationId, type, channel])
  @@map("notification_templates")
}

// Scheduled notifications (digests, reminders)
model ScheduledNotification {
  id              String   @id @default(cuid())
  organizationId  String

  type            String   // "deadline_reminder", "timesheet_reminder", "digest"

  // Schedule
  cronExpression  String   // "0 8 * * *" (daily at 8am)
  timezone        String   @default("Asia/Dubai")

  // Filter
  targetFilter    Json?    // Who to notify: { "departments": ["Creative"], "roles": ["STAFF"] }

  // Template
  templateType    String   // Links to NotificationTemplate.type

  isActive        Boolean  @default(true)
  lastRunAt       DateTime?
  nextRunAt       DateTime?

  @@map("scheduled_notifications")
}
```

---

## Notification Types

### Event Catalog

| Category | Type | Title Template | Default Channels |
|----------|------|----------------|------------------|
| **Briefs** | `brief.assigned` | "Brief assigned to you" | in_app, email, slack |
| | `brief.status_changed` | "Brief status updated" | in_app |
| | `brief.deadline_24h` | "Brief due tomorrow" | in_app, email, slack |
| | `brief.deadline_overdue` | "Brief is overdue" | in_app, email, slack |
| | `brief.comment` | "New comment on brief" | in_app, slack |
| | `brief.feedback` | "Client feedback received" | in_app, email, slack |
| **Submissions** | `submission.received` | "New submission to review" | in_app, email |
| | `submission.approved` | "Your submission was approved" | in_app, email |
| | `submission.rejected` | "Your submission needs changes" | in_app, email |
| **Time** | `time.weekly_reminder` | "Please submit your timesheet" | in_app, email, slack |
| | `time.approved` | "Timesheet approved" | in_app |
| | `time.rejected` | "Timesheet needs revision" | in_app, email |
| **RFP** | `rfp.deadline_7d` | "RFP due in 7 days" | in_app, slack |
| | `rfp.status_changed` | "RFP status updated" | in_app |
| | `rfp.won` | "RFP Won!" | in_app, email, slack |
| | `rfp.lost` | "RFP outcome received" | in_app, email |
| **System** | `system.announcement` | Dynamic | all |
| | `system.mention` | "You were mentioned" | in_app, email, slack |

---

## Service Architecture

### NotificationService

```typescript
// src/lib/notifications/notification-service.ts

import { db } from '@/lib/db';
import { EmailService } from './channels/email';
import { SlackService } from './channels/slack';

interface SendOptions {
  type: string;
  recipientId: string;
  title: string;
  body?: string;
  actionUrl?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;

  // Override defaults
  channels?: ('in_app' | 'email' | 'slack')[];
  priority?: 'low' | 'normal' | 'high';
}

class NotificationService {
  private emailService: EmailService;
  private slackService: SlackService;

  constructor() {
    this.emailService = new EmailService();
    this.slackService = new SlackService();
  }

  /**
   * Send a notification to a user
   */
  async send(options: SendOptions): Promise<Notification> {
    // 1. Get user and their preferences
    const user = await db.user.findUnique({
      where: { id: options.recipientId },
      include: { notificationPreference: true },
    });

    if (!user) throw new Error('User not found');

    // 2. Determine channels based on preferences and type
    const channels = this.resolveChannels(
      options.type,
      options.channels,
      user.notificationPreference
    );

    // 3. Check quiet hours
    if (this.isQuietHours(user.notificationPreference)) {
      // Queue for later delivery or skip non-urgent
      if (options.priority !== 'high') {
        return this.queueForLater(options, user.notificationPreference);
      }
    }

    // 4. Create notification record
    const notification = await db.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: options.recipientId,
        type: options.type,
        title: options.title,
        body: options.body,
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata,
        channels,
        deliveryStatus: {},
      },
    });

    // 5. Dispatch to channels
    const deliveryPromises = [];

    if (channels.includes('email')) {
      deliveryPromises.push(
        this.deliverEmail(notification, user)
          .then(() => this.updateDeliveryStatus(notification.id, 'email', 'sent'))
          .catch((e) => this.updateDeliveryStatus(notification.id, 'email', 'failed', e.message))
      );
    }

    if (channels.includes('slack')) {
      deliveryPromises.push(
        this.deliverSlack(notification, user)
          .then(() => this.updateDeliveryStatus(notification.id, 'slack', 'sent'))
          .catch((e) => this.updateDeliveryStatus(notification.id, 'slack', 'failed', e.message))
      );
    }

    // In-app is instant (just the DB record)
    if (channels.includes('in_app')) {
      await this.updateDeliveryStatus(notification.id, 'in_app', 'delivered');
    }

    // Don't wait for external delivery
    Promise.all(deliveryPromises);

    return notification;
  }

  /**
   * Send to multiple recipients
   */
  async sendBatch(
    recipientIds: string[],
    options: Omit<SendOptions, 'recipientId'>
  ): Promise<void> {
    await Promise.all(
      recipientIds.map((id) => this.send({ ...options, recipientId: id }))
    );
  }

  /**
   * Get notifications for a user
   */
  async getForUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
      types?: string[];
    } = {}
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      isArchived: false,
      ...(options.unreadOnly && { isRead: false }),
      ...(options.types && { type: { in: options.types } }),
    };

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 20,
        skip: options.offset || 0,
      }),
      db.notification.count({ where: { userId, isRead: false, isArchived: false } }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Private methods

  private resolveChannels(
    type: string,
    override: string[] | undefined,
    prefs: NotificationPreference | null
  ): string[] {
    if (override) return override;

    const defaults = this.getDefaultChannels(type);
    if (!prefs) return defaults;

    // Check type-specific preferences
    const typePrefs = prefs.typePreferences?.[type];
    if (typePrefs) {
      return Object.entries(typePrefs)
        .filter(([_, enabled]) => enabled)
        .map(([channel]) => channel);
    }

    // Apply global preferences
    return defaults.filter((channel) => {
      switch (channel) {
        case 'email': return prefs.emailEnabled;
        case 'slack': return prefs.slackEnabled;
        case 'in_app': return prefs.inAppEnabled;
        default: return true;
      }
    });
  }

  private getDefaultChannels(type: string): string[] {
    // Define defaults per notification type
    const defaults: Record<string, string[]> = {
      'brief.assigned': ['in_app', 'email', 'slack'],
      'brief.status_changed': ['in_app'],
      'brief.deadline_24h': ['in_app', 'email', 'slack'],
      'brief.deadline_overdue': ['in_app', 'email', 'slack'],
      'submission.received': ['in_app', 'email'],
      'submission.approved': ['in_app', 'email'],
      'submission.rejected': ['in_app', 'email'],
      // ... more defaults
    };

    return defaults[type] || ['in_app'];
  }

  private isQuietHours(prefs: NotificationPreference | null): boolean {
    if (!prefs?.quietHoursEnabled) return false;

    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: prefs.timezone }));
    const currentTime = `${userTime.getHours().toString().padStart(2, '0')}:${userTime.getMinutes().toString().padStart(2, '0')}`;

    const start = prefs.quietHoursStart || '22:00';
    const end = prefs.quietHoursEnd || '08:00';

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    return currentTime >= start && currentTime < end;
  }

  private async deliverEmail(notification: Notification, user: User): Promise<void> {
    // Get template
    const template = await this.getTemplate(
      notification.organizationId,
      notification.type,
      'email'
    );

    await this.emailService.send({
      to: user.email,
      subject: template?.subject || notification.title,
      template: template?.emailTemplate || 'default',
      data: {
        userName: user.name,
        title: notification.title,
        body: notification.body,
        actionUrl: notification.actionUrl,
        actionLabel: notification.actionLabel,
        ...notification.metadata,
      },
    });
  }

  private async deliverSlack(notification: Notification, user: User): Promise<void> {
    // Get Slack user mapping
    const slackUser = await db.slackUserMapping.findFirst({
      where: { userId: user.id },
    });

    if (!slackUser) {
      throw new Error('User not linked to Slack');
    }

    // Get template
    const template = await this.getTemplate(
      notification.organizationId,
      notification.type,
      'slack'
    );

    await this.slackService.sendDM({
      slackUserId: slackUser.slackUserId,
      text: notification.title,
      blocks: template?.slackBlocks || this.buildSlackBlocks(notification),
    });
  }

  private buildSlackBlocks(notification: Notification): SlackBlock[] {
    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${notification.title}*\n${notification.body || ''}`,
        },
      },
    ];

    if (notification.actionUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: notification.actionLabel || 'View' },
            url: notification.actionUrl,
          },
        ],
      });
    }

    return blocks;
  }

  private async getTemplate(
    organizationId: string,
    type: string,
    channel: string
  ): Promise<NotificationTemplate | null> {
    return db.notificationTemplate.findFirst({
      where: {
        organizationId,
        type,
        channel,
        isActive: true,
      },
    });
  }

  private async updateDeliveryStatus(
    notificationId: string,
    channel: string,
    status: string,
    error?: string
  ): Promise<void> {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    const deliveryStatus = notification?.deliveryStatus as Record<string, unknown> || {};
    deliveryStatus[channel] = { status, error, timestamp: new Date().toISOString() };

    await db.notification.update({
      where: { id: notificationId },
      data: { deliveryStatus },
    });
  }
}

export const notificationService = new NotificationService();
```

---

## Event Triggers

### Integration with Existing Actions

```typescript
// src/modules/briefs/actions/brief-actions.ts

import { notificationService } from '@/lib/notifications';

export async function assignBrief(briefId: string, assigneeId: string) {
  const session = await auth();

  // Update brief
  const brief = await db.brief.update({
    where: { id: briefId },
    data: { assigneeId },
    include: { client: true, createdBy: true },
  });

  // Send notification
  await notificationService.send({
    type: 'brief.assigned',
    recipientId: assigneeId,
    title: 'New brief assigned to you',
    body: brief.title,
    actionUrl: `/briefs/${briefId}`,
    actionLabel: 'View Brief',
    entityType: 'brief',
    entityId: briefId,
    metadata: {
      clientName: brief.client.name,
      assignedBy: session?.user?.name,
    },
  });

  return brief;
}
```

### Event Emitter Pattern (Alternative)

```typescript
// src/lib/events/event-emitter.ts

import { EventEmitter } from 'events';
import { notificationService } from '@/lib/notifications';

const emitter = new EventEmitter();

// Register handlers
emitter.on('brief.assigned', async (data) => {
  await notificationService.send({
    type: 'brief.assigned',
    recipientId: data.assigneeId,
    title: 'New brief assigned to you',
    body: data.briefTitle,
    actionUrl: `/briefs/${data.briefId}`,
    entityType: 'brief',
    entityId: data.briefId,
  });
});

emitter.on('brief.status_changed', async (data) => {
  // Notify creator and assignee
  const recipients = [data.createdById, data.assigneeId].filter(Boolean);

  for (const recipientId of recipients) {
    await notificationService.send({
      type: 'brief.status_changed',
      recipientId,
      title: `Brief status: ${data.newStatus}`,
      body: data.briefTitle,
      actionUrl: `/briefs/${data.briefId}`,
      entityType: 'brief',
      entityId: data.briefId,
    });
  }
});

// Usage in actions
export function emit(event: string, data: unknown) {
  emitter.emit(event, data);
}
```

---

## Scheduled Notifications

### Cron Jobs

```typescript
// src/jobs/scheduled-notifications.ts

import { db } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Run daily at 8 AM - Deadline reminders
 */
export async function sendDeadlineReminders() {
  const tomorrow = addDays(new Date(), 1);

  // Find briefs due tomorrow
  const briefs = await db.brief.findMany({
    where: {
      deadline: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      assigneeId: { not: null },
    },
    include: { client: true },
  });

  for (const brief of briefs) {
    await notificationService.send({
      type: 'brief.deadline_24h',
      recipientId: brief.assigneeId!,
      title: 'Brief due tomorrow',
      body: `${brief.title} - ${brief.client.name}`,
      actionUrl: `/briefs/${brief.id}`,
      entityType: 'brief',
      entityId: brief.id,
      priority: 'high',
    });
  }
}

/**
 * Run daily at 9 AM - Overdue check
 */
export async function sendOverdueNotifications() {
  const today = startOfDay(new Date());

  // Find overdue briefs
  const briefs = await db.brief.findMany({
    where: {
      deadline: { lt: today },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      assigneeId: { not: null },
    },
    include: { client: true, assignee: true },
  });

  for (const brief of briefs) {
    // Notify assignee
    await notificationService.send({
      type: 'brief.deadline_overdue',
      recipientId: brief.assigneeId!,
      title: 'Brief is overdue',
      body: brief.title,
      actionUrl: `/briefs/${brief.id}`,
      entityType: 'brief',
      entityId: brief.id,
      priority: 'high',
    });

    // Also notify team lead
    if (brief.assignee?.teamLeadId) {
      await notificationService.send({
        type: 'brief.deadline_overdue',
        recipientId: brief.assignee.teamLeadId,
        title: 'Team brief is overdue',
        body: `${brief.title} (assigned to ${brief.assignee.name})`,
        actionUrl: `/briefs/${brief.id}`,
        entityType: 'brief',
        entityId: brief.id,
      });
    }
  }
}

/**
 * Run every Friday at 4 PM - Timesheet reminders
 */
export async function sendTimesheetReminders() {
  const week = {
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),  // Sunday
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  };

  // Get users who haven't logged enough time
  const users = await db.user.findMany({
    where: {
      isActive: true,
      permissionLevel: { notIn: ['CLIENT'] },
    },
    include: {
      timeEntries: {
        where: {
          date: { gte: week.start, lte: week.end },
        },
      },
    },
  });

  for (const user of users) {
    const loggedHours = user.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );

    if (loggedHours < user.weeklyCapacity * 0.8) {  // Less than 80%
      await notificationService.send({
        type: 'time.weekly_reminder',
        recipientId: user.id,
        title: 'Please complete your timesheet',
        body: `You've logged ${loggedHours}h of ${user.weeklyCapacity}h this week`,
        actionUrl: '/time',
        metadata: {
          loggedHours,
          targetHours: user.weeklyCapacity,
        },
      });
    }
  }
}
```

### Job Registration (Vercel Cron or Inngest)

```typescript
// src/app/api/cron/notifications/route.ts

import { sendDeadlineReminders, sendOverdueNotifications, sendTimesheetReminders } from '@/jobs/scheduled-notifications';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // Verify cron secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get('job');

  switch (job) {
    case 'deadline-reminders':
      await sendDeadlineReminders();
      break;
    case 'overdue-check':
      await sendOverdueNotifications();
      break;
    case 'timesheet-reminders':
      await sendTimesheetReminders();
      break;
    default:
      return new Response('Unknown job', { status: 400 });
  }

  return new Response('OK');
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/notifications?job=deadline-reminders",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/notifications?job=overdue-check",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/notifications?job=timesheet-reminders",
      "schedule": "0 16 * * 5"
    }
  ]
}
```

---

## UI Components

### NotificationBell (Header Component)

```typescript
// src/components/notifications/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { getUnreadCount } from '@/modules/notifications/actions';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    getUnreadCount().then(setUnreadCount);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onRead={() => setUnreadCount((c) => Math.max(0, c - 1))}
        />
      )}
    </div>
  );
}
```

### NotificationDropdown

```typescript
// src/components/notifications/NotificationDropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Check, Archive } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '@/modules/notifications/actions';

interface Props {
  onClose: () => void;
  onRead: () => void;
}

export function NotificationDropdown({ onClose, onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications({ limit: 10 })
      .then((data) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    onRead();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onRead();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border shadow-lg z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-[#52EDC7] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 ${
                !notification.isRead ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  {notification.body && (
                    <p className="text-sm text-gray-600 mt-0.5">{notification.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Check className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              {notification.actionUrl && (
                <Link
                  href={notification.actionUrl}
                  onClick={onClose}
                  className="text-sm text-[#52EDC7] hover:underline mt-2 inline-block"
                >
                  {notification.actionLabel || 'View'}
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-sm text-gray-600 hover:text-gray-900"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
```

### Notification Preferences Page

```typescript
// src/app/(dashboard)/settings/notifications/page.tsx

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NotificationPreferencesForm } from './PreferencesForm';

export default async function NotificationPreferencesPage() {
  const session = await auth();

  const preferences = await db.notificationPreference.findUnique({
    where: { userId: session!.user.id },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Notification Preferences</h1>
      <NotificationPreferencesForm initialPreferences={preferences} />
    </div>
  );
}
```

---

## Server Actions

```typescript
// src/modules/notifications/actions/notification-actions.ts
'use server';

import { auth } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNotifications(options: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return notificationService.getForUser(session.user.id, options);
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  return db.notification.count({
    where: { userId: session.user.id, isRead: false, isArchived: false },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await notificationService.markAsRead(notificationId, session.user.id);
  revalidatePath('/notifications');
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await notificationService.markAllAsRead(session.user.id);
  revalidatePath('/notifications');
}

export async function updatePreferences(data: NotificationPreferenceInput) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await db.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...data,
    },
    update: data,
  });

  revalidatePath('/settings/notifications');
}
```

---

## TeamLMTD Configuration

```typescript
// Default templates for TeamLMTD
const lmtdNotificationConfig = {
  // Channel mappings
  slack: {
    'brief.assigned': 'direct_message',  // DM to assignee
    'brief.deadline_overdue': '#briefs',  // Channel post
    'rfp.status_changed': '#rfp-private',
    'system.announcement': '#general',
  },

  // Default templates
  templates: {
    'brief.assigned': {
      email: {
        subject: 'New Brief: {{briefTitle}}',
        body: 'You have been assigned a new brief.\n\n{{briefTitle}}\nClient: {{clientName}}\nDeadline: {{deadline}}',
      },
      slack: {
        text: 'New brief assigned',
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: '📋 New Brief Assigned' } },
          { type: 'section', text: { type: 'mrkdwn', text: '*{{briefTitle}}*\nClient: {{clientName}}\nDeadline: {{deadline}}' } },
          { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Brief' }, url: '{{actionUrl}}' }] },
        ],
      },
    },
    // ... more templates
  },

  // Scheduled jobs
  scheduledNotifications: [
    { type: 'deadline-reminders', cron: '0 8 * * *', timezone: 'Asia/Dubai' },
    { type: 'overdue-check', cron: '0 9 * * *', timezone: 'Asia/Dubai' },
    { type: 'timesheet-reminders', cron: '0 16 * * 5', timezone: 'Asia/Dubai' },
  ],
};
```

---

## Implementation Checklist

### Phase 6.1: Core Infrastructure
- [ ] Create database schema (Notification, NotificationPreference, NotificationTemplate)
- [ ] Implement NotificationService class
- [ ] Create server actions for notifications
- [ ] Build NotificationBell component
- [ ] Build NotificationDropdown component

### Phase 6.2: Email Channel
- [ ] Set up email service (Resend, SendGrid, or similar)
- [ ] Create email templates (brief assigned, deadline, etc.)
- [ ] Implement email delivery in NotificationService
- [ ] Test email delivery

### Phase 6.3: In-App Notifications
- [ ] Add notifications page (/notifications)
- [ ] Implement read/unread tracking
- [ ] Add preference settings UI
- [ ] Test real-time updates

### Phase 6.4: Scheduled Notifications
- [ ] Set up cron jobs (Vercel Cron or Inngest)
- [ ] Implement deadline reminders
- [ ] Implement overdue notifications
- [ ] Implement timesheet reminders

### Phase 6.5: Integration
- [ ] Add notification triggers to brief actions
- [ ] Add notification triggers to submission actions
- [ ] Add notification triggers to time actions
- [ ] Test end-to-end flows

---

## AI Integration Points (Future)

| Capability | Description |
|------------|-------------|
| **Smart Batching** | AI groups related notifications to reduce noise |
| **Priority Detection** | AI escalates urgent notifications |
| **Content Personalization** | AI adjusts notification tone per user |
| **Timing Optimization** | AI learns best times to notify each user |
| **Anomaly Detection** | AI flags unusual patterns (e.g., spike in overdue briefs) |

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
