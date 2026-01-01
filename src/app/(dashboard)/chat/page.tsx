/**
 * Chat Index Page
 *
 * Main chat hub - shows channel sidebar and prompts to select a channel.
 *
 * @module app/(dashboard)/chat
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChannels, getDirectMessages } from "@/modules/chat/actions/channel-actions";
import { getAllUnreadCounts } from "@/modules/chat/actions/message-actions";
import { ChatLayout } from "./ChatLayout";

export const metadata = {
  title: "Chat | SpokeStack",
  description: "Team communication hub",
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [channels, directMessages, unreadCounts] = await Promise.all([
    getChannels(session.user.organizationId, session.user.id),
    getDirectMessages(session.user.organizationId, session.user.id),
    getAllUnreadCounts(session.user.organizationId, session.user.id),
  ]);

  return (
    <ChatLayout
      channels={channels}
      directMessages={directMessages}
      unreadCounts={unreadCounts}
      currentUserId={session.user.id}
      organizationId={session.user.organizationId}
    >
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to SpokeChat
          </h2>
          <p className="text-gray-500 max-w-sm">
            Select a channel or start a conversation to begin messaging your team.
          </p>
        </div>
      </div>
    </ChatLayout>
  );
}
