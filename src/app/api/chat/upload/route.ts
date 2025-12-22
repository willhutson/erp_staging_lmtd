/**
 * Chat File Upload API Route
 *
 * Handles file uploads for chat attachments.
 *
 * @module api/chat/upload
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUploadRequest } from "@/modules/chat/actions/upload-actions";

export async function POST(request: NextRequest) {
  // Verify authentication
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handleUploadRequest(request);
}

// Configure max file size for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
