import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";

export default async function NotificationSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const preferences = await db.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <NotificationPreferencesForm
      initialPreferences={
        preferences
          ? {
              emailEnabled: preferences.emailEnabled,
              slackEnabled: preferences.slackEnabled,
              inAppEnabled: preferences.inAppEnabled,
              emailDigest: preferences.emailDigest,
              digestTime: preferences.digestTime,
              quietHoursEnabled: preferences.quietHoursEnabled,
              quietHoursStart: preferences.quietHoursStart,
              quietHoursEnd: preferences.quietHoursEnd,
              timezone: preferences.timezone,
            }
          : null
      }
    />
  );
}
