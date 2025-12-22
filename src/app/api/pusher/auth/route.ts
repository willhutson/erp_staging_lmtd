/**
 * Pusher Auth Endpoint
 *
 * Authenticates users for private and presence channels.
 *
 * @module api/pusher/auth
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing socket_id or channel_name" },
      { status: 400 }
    );
  }

  // Check if this is a presence channel
  if (channelName.startsWith("presence-")) {
    // For presence channels, include user info
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.avatarUrl,
      },
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      presenceData
    );

    return NextResponse.json(authResponse);
  }

  // For private channels, just authorize
  if (channelName.startsWith("private-")) {
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  // For user-specific channels, verify ownership
  if (channelName.startsWith("user-")) {
    const userId = channelName.replace("user-", "");
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot subscribe to other user channels" },
        { status: 403 }
      );
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  // Default authorization for other channel types
  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
