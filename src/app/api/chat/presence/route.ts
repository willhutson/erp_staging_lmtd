/**
 * Presence API Route
 *
 * Handles presence updates via sendBeacon on page unload.
 *
 * @module api/chat/presence
 */

import { NextRequest, NextResponse } from "next/server";
import { updatePresence } from "@/modules/chat/actions/presence-actions";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, status } = data;

    if (!userId || !status) {
      return NextResponse.json(
        { error: "Missing userId or status" },
        { status: 400 }
      );
    }

    await updatePresence({
      userId,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Presence update error:", error);
    return NextResponse.json(
      { error: "Failed to update presence" },
      { status: 500 }
    );
  }
}
