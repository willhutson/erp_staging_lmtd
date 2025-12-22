"use client";

/**
 * Chat Layout Component
 *
 * Provides the sidebar and main content area for chat.
 *
 * @module app/(dashboard)/chat/ChatLayout
 */

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChannelSidebar } from "@/modules/chat/components/ChannelSidebar";
import { createChannel } from "@/modules/chat/actions/channel-actions";
import type { ChannelType } from "@prisma/client";

interface Channel {
  id: string;
  name: string;
  slug: string;
  type: ChannelType;
  icon: string | null;
  isArchived: boolean;
  _count: {
    members: number;
  };
}

interface DirectMessage {
  id: string;
  name: string;
  slug: string;
  members?: Array<{
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }>;
}

interface ChatLayoutProps {
  children: ReactNode;
  channels: Channel[];
  directMessages: DirectMessage[];
  unreadCounts: Record<string, number>;
  currentUserId: string;
  organizationId: string;
}

export function ChatLayout({
  children,
  channels,
  directMessages,
  unreadCounts,
  currentUserId,
  organizationId,
}: ChatLayoutProps) {
  const router = useRouter();

  const handleCreateChannel = async (data: {
    name: string;
    description?: string;
    type: ChannelType;
  }) => {
    const channel = await createChannel({
      organizationId,
      name: data.name,
      description: data.description,
      type: data.type,
      createdById: currentUserId,
    });

    router.push(`/chat/${channel.slug}`);
    router.refresh();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6">
      <ChannelSidebar
        channels={channels}
        directMessages={directMessages}
        unreadCounts={unreadCounts}
        currentUserId={currentUserId}
        organizationId={organizationId}
        onCreateChannel={handleCreateChannel}
      />
      {children}
    </div>
  );
}
