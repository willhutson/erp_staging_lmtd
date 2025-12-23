import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only admins and leadership can access settings
  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
