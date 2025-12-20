import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SettingsNav } from "@/components/settings/SettingsNav";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Control how and when you receive notifications
              </p>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
