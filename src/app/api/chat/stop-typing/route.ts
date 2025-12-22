/**
 * Stop Typing Indicator API Route
 *
 * Broadcasts that user stopped typing via Pusher.
 *
 * @module api/chat/stop-typing
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendStopTypingIndicator } from "@/modules/chat/actions/message-actions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId, userId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: "Missing channelId" },
        { status: 400 }
      );
    }

    await sendStopTypingIndicator(channelId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stop typing indicator error:", error);
    return NextResponse.json(
      { error: "Failed to send stop typing indicator" },
      { status: 500 }
    );
  }
}
