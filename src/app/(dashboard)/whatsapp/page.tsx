import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConversations, getConversationStats } from "@/modules/whatsapp/actions/whatsapp-actions";
import { WhatsAppDashboardClient } from "./WhatsAppDashboardClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission - Leadership and above
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const [conversations, stats] = await Promise.all([
    getConversations({ limit: 30 }),
    getConversationStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
        <p className="text-gray-500 mt-1">
          Client conversations and voice note transcriptions
        </p>
      </div>

      <WhatsAppDashboardClient
        conversations={conversations}
        stats={stats}
      />
    </div>
  );
}
