import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { Notification, NotificationPreference, User } from '@prisma/client';
import { sendSlackNotification } from '@/lib/slack/notification-service';

/**
 * Notification types with default channels
 */
export const NOTIFICATION_TYPES = {
  // Brief events
  'brief.assigned': { channels: ['in_app', 'email', 'slack'], title: 'Brief assigned to you' },
  'brief.status_changed': { channels: ['in_app'], title: 'Brief status updated' },
  'brief.deadline_24h': { channels: ['in_app', 'email', 'slack'], title: 'Brief due tomorrow' },
  'brief.deadline_overdue': { channels: ['in_app', 'email', 'slack'], title: 'Brief is overdue' },
  'brief.comment': { channels: ['in_app', 'slack'], title: 'New comment on brief' },
  'brief.feedback': { channels: ['in_app', 'email', 'slack'], title: 'Client feedback received' },

  // Submission events
  'submission.received': { channels: ['in_app', 'email'], title: 'New submission to review' },
  'submission.approved': { channels: ['in_app', 'email'], title: 'Your submission was approved' },
  'submission.rejected': { channels: ['in_app', 'email'], title: 'Your submission needs changes' },

  // Time events
  'time.weekly_reminder': { channels: ['in_app', 'email', 'slack'], title: 'Please submit your timesheet' },
  'time.approved': { channels: ['in_app'], title: 'Timesheet approved' },
  'time.rejected': { channels: ['in_app', 'email'], title: 'Timesheet needs revision' },

  // RFP events
  'rfp.deadline_7d': { channels: ['in_app', 'slack'], title: 'RFP due in 7 days' },
  'rfp.status_changed': { channels: ['in_app'], title: 'RFP status updated' },
  'rfp.won': { channels: ['in_app', 'email', 'slack'], title: 'RFP Won!' },
  'rfp.lost': { channels: ['in_app', 'email'], title: 'RFP outcome received' },

  // System events
  'system.announcement': { channels: ['in_app', 'email', 'slack'], title: 'Announcement' },
  'system.mention': { channels: ['in_app', 'email', 'slack'], title: 'You were mentioned' },
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

interface SendOptions {
  type: NotificationType;
  recipientId: string;
  title?: string;
  body?: string;
  actionUrl?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  channels?: ('in_app' | 'email' | 'slack')[];
  priority?: 'low' | 'normal' | 'high';
}

interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
  types?: NotificationType[];
}

class NotificationService {
  /**
   * Send a notification to a user
   */
  async send(options: SendOptions): Promise<Notification> {
    // Get user and their preferences
    const user = await db.user.findUnique({
      where: { id: options.recipientId },
      include: { notificationPreference: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Determine channels based on preferences and type
    const channels = this.resolveChannels(
      options.type,
      options.channels,
      user.notificationPreference
    );

    // Check quiet hours for non-high priority
    if (options.priority !== 'high' && this.isQuietHours(user.notificationPreference)) {
      // Still create in-app notification but skip external channels
      const quietChannels = channels.filter(c => c === 'in_app');
      if (quietChannels.length === 0) {
        // Queue for later - for now just skip
        return this.createNotificationRecord(user, options, ['in_app']);
      }
    }

    // Get default title if not provided
    const title = options.title || NOTIFICATION_TYPES[options.type]?.title || options.type;

    // Create notification record
    const notification = await db.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: options.recipientId,
        type: options.type,
        title,
        body: options.body,
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: (options.metadata ?? {}) as Prisma.InputJsonValue,
        channels,
        deliveryStatus: { in_app: 'delivered' } as Prisma.InputJsonValue,
      },
    });

    // Queue external channel delivery (email, slack)
    if (channels.includes('email')) {
      this.deliverEmail(notification, user).catch((error) => {
        console.error('Failed to deliver email notification:', error);
        this.updateDeliveryStatus(notification.id, 'email', 'failed', error.message);
      });
    }

    if (channels.includes('slack')) {
      this.deliverSlack(notification, user).catch((error) => {
        console.error('Failed to deliver Slack notification:', error);
        this.updateDeliveryStatus(notification.id, 'slack', 'failed', error.message);
      });
    }

    return notification;
  }

  /**
   * Send to multiple recipients
   */
  async sendBatch(
    recipientIds: string[],
    options: Omit<SendOptions, 'recipientId'>
  ): Promise<void> {
    await Promise.allSettled(
      recipientIds.map((id) => this.send({ ...options, recipientId: id }))
    );
  }

  /**
   * Get notifications for a user
   */
  async getForUser(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const where = {
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
      db.notification.count({
        where: { userId, isRead: false, isArchived: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: { userId, isRead: false, isArchived: false },
    });
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
   * Mark all as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Archive a notification
   */
  async archive(notificationId: string, userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  }

  // Private methods

  private async createNotificationRecord(
    user: User,
    options: SendOptions,
    channels: string[]
  ): Promise<Notification> {
    const title = options.title || NOTIFICATION_TYPES[options.type]?.title || options.type;

    return db.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: options.recipientId,
        type: options.type,
        title,
        body: options.body,
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: (options.metadata ?? {}) as Prisma.InputJsonValue,
        channels,
        deliveryStatus: { in_app: 'delivered' } as Prisma.InputJsonValue,
      },
    });
  }

  private resolveChannels(
    type: NotificationType,
    override: string[] | undefined,
    prefs: NotificationPreference | null
  ): string[] {
    if (override) return override;

    const defaults = NOTIFICATION_TYPES[type]?.channels || ['in_app'];
    if (!prefs) return [...defaults];

    // Check type-specific preferences
    const typePrefs = (prefs.typePreferences as Record<string, Record<string, boolean>>)?.[type];
    if (typePrefs) {
      return Object.entries(typePrefs)
        .filter(([, enabled]) => enabled)
        .map(([channel]) => channel);
    }

    // Apply global preferences
    return defaults.filter((channel) => {
      switch (channel) {
        case 'email':
          return prefs.emailEnabled;
        case 'slack':
          return prefs.slackEnabled;
        case 'in_app':
          return prefs.inAppEnabled;
        default:
          return true;
      }
    });
  }

  private isQuietHours(prefs: NotificationPreference | null): boolean {
    if (!prefs?.quietHoursEnabled) return false;

    const now = new Date();
    const userTime = new Date(
      now.toLocaleString('en-US', { timeZone: prefs.timezone || 'Asia/Dubai' })
    );
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
    // Placeholder for email delivery
    // Will be implemented with Resend or similar service
    console.log(`[Email] Would send to ${user.email}: ${notification.title}`);
    await this.updateDeliveryStatus(notification.id, 'email', 'sent');
  }

  private async deliverSlack(notification: Notification, user: User): Promise<void> {
    const result = await sendSlackNotification(user.organizationId, {
      type: notification.type,
      title: notification.title,
      body: notification.body || undefined,
      actionUrl: notification.actionUrl || undefined,
      entityType: notification.entityType || undefined,
      entityId: notification.entityId || undefined,
      metadata: (notification.metadata as Record<string, unknown>) || undefined,
    });

    if (result.success) {
      await this.updateDeliveryStatus(notification.id, 'slack', 'sent');
    } else {
      throw new Error(result.error || 'Slack delivery failed');
    }
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

    if (!notification) return;

    const deliveryStatus = (notification.deliveryStatus as Record<string, unknown>) || {};
    deliveryStatus[channel] = { status, error, timestamp: new Date().toISOString() };

    await db.notification.update({
      where: { id: notificationId },
      data: { deliveryStatus },
    });
  }
}

export const notificationService = new NotificationService();
