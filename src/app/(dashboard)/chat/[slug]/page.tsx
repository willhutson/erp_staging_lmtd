/**
 * Channel View Page
 *
 * Displays messages for a specific channel.
 *
 * @module app/(dashboard)/chat/[slug]
 */

import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getChannelBySlug,
  getChannels,
  getDirectMessages,
  getChannelMembers,
  isChannelMember,
  markChannelAsRead,
} from "@/modules/chat/actions/channel-actions";
import { getMessages, getAllUnreadCounts } from "@/modules/chat/actions/message-actions";
import { db } from "@/lib/db";
import { ChatLayout } from "../ChatLayout";
import { ChannelViewClient } from "./ChannelViewClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `#${slug} | SpokeChat`,
    description: `Chat channel: ${slug}`,
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get the channel
  const channel = await getChannelBySlug(session.user.organizationId, slug);

  if (!channel) {
    notFound();
  }

  // Check membership for private channels
  if (channel.type === "PRIVATE" || channel.type === "DM") {
    const isMember = await isChannelMember(channel.id, session.user.id);
    if (!isMember) {
      redirect("/chat");
    }
  }

  // Get data in parallel
  const [channels, directMessages, unreadCounts, messagesResult, members, users] =
    await Promise.all([
      getChannels(session.user.organizationId, session.user.id),
      getDirectMessages(session.user.organizationId, session.user.id),
      getAllUnreadCounts(session.user.organizationId, session.user.id),
      getMessages(channel.id, { limit: 50 }),
      getChannelMembers(channel.id),
      // Get all users for mentions
      db.user.findMany({
        where: { organizationId: session.user.organizationId, isActive: true },
        select: { id: true, name: true, avatarUrl: true },
      }),
    ]);

  // Mark channel as read
  await markChannelAsRead(channel.id, session.user.id);

  return (
    <ChatLayout
      channels={channels}
      directMessages={directMessages}
      unreadCounts={unreadCounts}
      currentUserId={session.user.id}
      organizationId={session.user.organizationId}
    >
      <ChannelViewClient
        channel={channel}
        initialMessages={messagesResult.messages}
        hasMore={messagesResult.hasMore}
        members={members}
        users={users}
        currentUserId={session.user.id}
        organizationId={session.user.organizationId}
      />
    </ChatLayout>
  );
}
