/**
 * Typing Indicator API Route
 *
 * Receives typing notifications and broadcasts via Pusher.
 *
 * @module api/chat/typing
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendTypingIndicator } from "@/modules/chat/actions/message-actions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId, user } = await request.json();

    if (!channelId || !user) {
      return NextResponse.json(
        { error: "Missing channelId or user" },
        { status: 400 }
      );
    }

    await sendTypingIndicator(channelId, {
      id: session.user.id,
      name: session.user.name || "Unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Typing indicator error:", error);
    return NextResponse.json(
      { error: "Failed to send typing indicator" },
      { status: 500 }
    );
  }
}
