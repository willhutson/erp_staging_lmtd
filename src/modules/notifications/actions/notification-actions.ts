'use server';

import { auth } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Get notifications for the current user
 */
export async function getNotifications(options: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const session = await auth();
  if (!session?.user) {
    return { notifications: [], unreadCount: 0 };
  }

  return notificationService.getForUser(session.user.id, options);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user) return 0;

  return notificationService.getUnreadCount(session.user.id);
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await notificationService.markAsRead(notificationId, session.user.id);
  revalidatePath('/notifications');
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await notificationService.markAllAsRead(session.user.id);
  revalidatePath('/notifications');
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await notificationService.archive(notificationId, session.user.id);
  revalidatePath('/notifications');
}

/**
 * Get notification preferences
 */
export async function getPreferences() {
  const session = await auth();
  if (!session?.user) return null;

  return db.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });
}

/**
 * Update notification preferences
 */
export async function updatePreferences(data: {
  emailEnabled?: boolean;
  slackEnabled?: boolean;
  inAppEnabled?: boolean;
  emailDigest?: string;
  digestTime?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
  typePreferences?: Record<string, Record<string, boolean>>;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db.notificationPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: data,
    });

    revalidatePath('/settings/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}
