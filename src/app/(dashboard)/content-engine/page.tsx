import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ContentCalendarClient } from "./ContentCalendarClient";
import { getCalendarPosts, getPostStats } from "@/modules/content/actions/content-actions";
import { getSocialAccounts } from "@/modules/content/actions/social-account-actions";

export default async function ContentEnginePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  // Get current month's date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Fetch data in parallel
  const [clients, calendarPosts, stats, socialAccounts] = await Promise.all([
    db.client.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    getCalendarPosts(organizationId, startOfMonth, endOfMonth),
    getPostStats(organizationId),
    getSocialAccounts(organizationId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Engine</h1>
          <p className="text-gray-500 mt-1">
            Plan, create, and schedule content across all platforms
          </p>
        </div>
      </div>

      <ContentCalendarClient
        clients={clients}
        initialPosts={calendarPosts}
        stats={stats}
        socialAccounts={socialAccounts}
      />
    </div>
  );
}
