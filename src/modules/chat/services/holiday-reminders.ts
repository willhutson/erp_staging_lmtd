/**
 * Holiday Reminder Service
 *
 * Sends automated reminders to SpokeChat for:
 * 1. Content planning - Prepare holiday content for clients
 * 2. Leave planning - Submit leave requests before holidays
 *
 * Run this service daily via cron job or scheduled task.
 *
 * @module chat/services/holiday-reminders
 */

import { db } from "@/lib/db";
import {
  getUpcomingHolidays,
  CONTENT_PLANNING_REMINDERS,
  LEAVE_PLANNING_REMINDERS,
  type Holiday,
} from "@config/holidays/uae.holidays";
import { sendCelebration, batchNotify } from "./chat-notifications";

// ============================================
// TYPES
// ============================================

interface ReminderContext {
  organizationId: string;
  channelId?: string; // Specific channel, or use defaults
}

interface HolidayReminder {
  holiday: Holiday;
  daysUntil: number;
  reminderType: "content" | "leave";
  urgency: "first" | "second" | "final";
}

// ============================================
// HELPER: Calculate days until holiday
// ============================================

function getDaysUntil(holidayDate: string, fromDate: Date = new Date()): number {
  const holiday = new Date(holidayDate);
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const holidayDay = new Date(holiday.getFullYear(), holiday.getMonth(), holiday.getDate());
  const diffTime = holidayDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// HELPER: Get reminders due today
// ============================================

function getRemindersForToday(fromDate: Date = new Date()): HolidayReminder[] {
  const reminders: HolidayReminder[] = [];
  const holidays = getUpcomingHolidays(fromDate, 45); // Look ahead 45 days

  for (const holiday of holidays) {
    const daysUntil = getDaysUntil(holiday.date, fromDate);

    // Content planning reminders
    if (daysUntil === CONTENT_PLANNING_REMINDERS.FIRST_REMINDER) {
      reminders.push({
        holiday,
        daysUntil,
        reminderType: "content",
        urgency: "first",
      });
    } else if (daysUntil === CONTENT_PLANNING_REMINDERS.SECOND_REMINDER) {
      reminders.push({
        holiday,
        daysUntil,
        reminderType: "content",
        urgency: "second",
      });
    } else if (daysUntil === CONTENT_PLANNING_REMINDERS.FINAL_REMINDER) {
      reminders.push({
        holiday,
        daysUntil,
        reminderType: "content",
        urgency: "final",
      });
    }

    // Leave planning reminders
    if (daysUntil === LEAVE_PLANNING_REMINDERS.FIRST_REMINDER) {
      reminders.push({
        holiday,
        daysUntil,
        reminderType: "leave",
        urgency: "first",
      });
    } else if (daysUntil === LEAVE_PLANNING_REMINDERS.FINAL_REMINDER) {
      reminders.push({
        holiday,
        daysUntil,
        reminderType: "leave",
        urgency: "final",
      });
    }
  }

  return reminders;
}

// ============================================
// CONTENT PLANNING REMINDERS
// ============================================

function formatContentReminder(reminder: HolidayReminder): string {
  const { holiday, daysUntil, urgency } = reminder;
  const dateStr = new Date(holiday.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const themes = holiday.contentThemes?.slice(0, 3).join(", ") || "holiday themes";
  const hashtags = holiday.hashtags?.slice(0, 3).join(" ") || "";

  let emoji = "📅";
  let urgencyText = "";

  switch (urgency) {
    case "first":
      emoji = "💡";
      urgencyText = "Time to start brainstorming!";
      break;
    case "second":
      emoji = "📝";
      urgencyText = "Finalize your content concepts.";
      break;
    case "final":
      emoji = "⚡";
      urgencyText = "Content should be ready for review!";
      break;
  }

  return `<p><strong>${emoji} ${holiday.name} Content Reminder</strong></p>
<p><strong>${holiday.nameAr}</strong> is in <strong>${daysUntil} days</strong> (${dateStr})</p>
<p>${urgencyText}</p>
<p><em>Content themes:</em> ${themes}</p>
<p><em>Trending hashtags:</em> <code>${hashtags}</code></p>`;
}

/**
 * Send content planning reminder to the content team
 */
async function sendContentReminder(
  context: ReminderContext,
  reminder: HolidayReminder
): Promise<void> {
  try {
    // Find content team channel or default channel
    let channelId = context.channelId;

    if (!channelId) {
      const contentChannel = await db.channel.findFirst({
        where: {
          organizationId: context.organizationId,
          OR: [
            { name: { contains: "content", mode: "insensitive" } },
            { name: { contains: "social", mode: "insensitive" } },
            { isDefault: true },
          ],
          isArchived: false,
        },
        select: { id: true },
        orderBy: { isDefault: "asc" }, // Prefer specific channels over default
      });
      channelId = contentChannel?.id;
    }

    if (!channelId) return;

    const content = formatContentReminder(reminder);
    await batchNotify(context.organizationId, [channelId], content);
  } catch (error) {
    console.error("Failed to send content reminder:", error);
  }
}

// ============================================
// LEAVE PLANNING REMINDERS
// ============================================

function formatLeaveReminder(reminder: HolidayReminder): string {
  const { holiday, daysUntil, urgency } = reminder;
  const dateStr = new Date(holiday.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const durationText =
    holiday.duration > 1
      ? `${holiday.duration} days off`
      : "1 day off";

  let emoji = "🏖️";
  let urgencyText = "";

  switch (urgency) {
    case "first":
      emoji = "📆";
      urgencyText = "Plan your time off around the holiday.";
      break;
    case "final":
      emoji = "⏰";
      urgencyText = "Last call! Submit your leave request today.";
      break;
  }

  return `<p><strong>${emoji} ${holiday.name} Leave Reminder</strong></p>
<p><strong>${holiday.nameAr}</strong> is in <strong>${daysUntil} days</strong> (${dateStr})</p>
<p>Official holiday: ${durationText}</p>
<p>${urgencyText}</p>
<p><em>Don't forget to submit your leave request if you're taking extra days!</em></p>`;
}

/**
 * Send leave planning reminder to the team
 */
async function sendLeaveReminder(
  context: ReminderContext,
  reminder: HolidayReminder
): Promise<void> {
  try {
    // Use default channel for leave reminders (affects everyone)
    const defaultChannel = await db.channel.findFirst({
      where: {
        organizationId: context.organizationId,
        isDefault: true,
        isArchived: false,
      },
      select: { id: true },
    });

    if (!defaultChannel) return;

    const content = formatLeaveReminder(reminder);
    await batchNotify(context.organizationId, [defaultChannel.id], content);
  } catch (error) {
    console.error("Failed to send leave reminder:", error);
  }
}

// ============================================
// MAIN: Process Daily Reminders
// ============================================

/**
 * Process all holiday reminders for today
 *
 * Call this function daily (e.g., via cron at 9 AM UAE time)
 */
export async function processHolidayReminders(
  organizationId: string,
  fromDate: Date = new Date()
): Promise<{ sent: number; reminders: string[] }> {
  const reminders = getRemindersForToday(fromDate);
  const sentReminders: string[] = [];

  for (const reminder of reminders) {
    const context = { organizationId };

    if (reminder.reminderType === "content") {
      await sendContentReminder(context, reminder);
      sentReminders.push(`Content: ${reminder.holiday.name} (${reminder.urgency})`);
    } else if (reminder.reminderType === "leave") {
      await sendLeaveReminder(context, reminder);
      sentReminders.push(`Leave: ${reminder.holiday.name} (${reminder.urgency})`);
    }
  }

  return {
    sent: sentReminders.length,
    reminders: sentReminders,
  };
}

/**
 * Process reminders for all organizations
 */
export async function processAllOrganizationReminders(
  fromDate: Date = new Date()
): Promise<Map<string, { sent: number; reminders: string[] }>> {
  const organizations = await db.organization.findMany({
    select: { id: true },
  });

  const results = new Map<string, { sent: number; reminders: string[] }>();

  for (const org of organizations) {
    const result = await processHolidayReminders(org.id, fromDate);
    results.set(org.id, result);
  }

  return results;
}

// ============================================
// HOLIDAY CELEBRATION
// ============================================

/**
 * Send a holiday celebration message on the day
 */
export async function celebrateHoliday(
  organizationId: string,
  holiday: Holiday
): Promise<void> {
  try {
    await sendCelebration(
      { organizationId },
      {
        title: `Happy ${holiday.name}! ${holiday.nameAr}`,
        description: holiday.duration > 1
          ? `Wishing everyone a wonderful ${holiday.duration}-day holiday!`
          : "Wishing everyone a wonderful holiday!",
        celebrationType: "custom",
      }
    );
  } catch (error) {
    console.error("Failed to send holiday celebration:", error);
  }
}

// ============================================
// MANUAL TRIGGERS
// ============================================

/**
 * Preview upcoming reminders (for testing/debugging)
 */
export function previewUpcomingReminders(
  daysAhead: number = 45,
  fromDate: Date = new Date()
): Array<{
  holiday: string;
  date: string;
  daysUntil: number;
  contentReminders: string[];
  leaveReminders: string[];
}> {
  const holidays = getUpcomingHolidays(fromDate, daysAhead);

  return holidays.map((holiday) => {
    const daysUntil = getDaysUntil(holiday.date, fromDate);
    const contentReminders: string[] = [];
    const leaveReminders: string[] = [];

    // Check content reminders
    if (daysUntil <= CONTENT_PLANNING_REMINDERS.FIRST_REMINDER) {
      if (daysUntil > CONTENT_PLANNING_REMINDERS.SECOND_REMINDER) {
        contentReminders.push(`In ${CONTENT_PLANNING_REMINDERS.FIRST_REMINDER - daysUntil} days: First reminder`);
      } else if (daysUntil > CONTENT_PLANNING_REMINDERS.FINAL_REMINDER) {
        contentReminders.push(`In ${CONTENT_PLANNING_REMINDERS.SECOND_REMINDER - daysUntil} days: Second reminder`);
      } else if (daysUntil > 0) {
        contentReminders.push(`In ${CONTENT_PLANNING_REMINDERS.FINAL_REMINDER - daysUntil} days: Final reminder`);
      }
    } else {
      contentReminders.push(
        `In ${daysUntil - CONTENT_PLANNING_REMINDERS.FIRST_REMINDER} days: First reminder`
      );
    }

    // Check leave reminders
    if (daysUntil <= LEAVE_PLANNING_REMINDERS.FIRST_REMINDER) {
      if (daysUntil > LEAVE_PLANNING_REMINDERS.FINAL_REMINDER) {
        leaveReminders.push("Reminder sent");
      } else if (daysUntil > 0) {
        leaveReminders.push("Final reminder");
      }
    } else {
      leaveReminders.push(
        `In ${daysUntil - LEAVE_PLANNING_REMINDERS.FIRST_REMINDER} days`
      );
    }

    return {
      holiday: holiday.name,
      date: holiday.date,
      daysUntil,
      contentReminders,
      leaveReminders,
    };
  });
}

/**
 * Manually send a holiday content reminder (for testing)
 */
export async function sendManualContentReminder(
  organizationId: string,
  holidayName: string
): Promise<boolean> {
  const holidays = getUpcomingHolidays(new Date(), 365);
  const holiday = holidays.find(
    (h) => h.name.toLowerCase() === holidayName.toLowerCase()
  );

  if (!holiday) return false;

  const daysUntil = getDaysUntil(holiday.date);
  const reminder: HolidayReminder = {
    holiday,
    daysUntil,
    reminderType: "content",
    urgency: daysUntil <= 7 ? "final" : daysUntil <= 14 ? "second" : "first",
  };

  await sendContentReminder({ organizationId }, reminder);
  return true;
}
