/**
 * Content API - Approval Endpoints
 *
 * Base URL: /api/content/[postId]/approvals
 *
 * Endpoints:
 * - GET /api/content/[postId]/approvals - List approvals for a post
 * - POST /api/content/[postId]/approvals - Create approval request
 * - PATCH /api/content/[postId]/approvals - Respond to approval
 *
 * @module api/content/[postId]/approvals
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  createApprovalRequest,
  processApprovalResponse,
} from "@/modules/content/services/approval-workflow";
import { validateApiKey } from "@/lib/api/keys";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createApprovalSchema = z.object({
  approvalType: z.enum(["INTERNAL", "CLIENT", "LEGAL", "FINAL"]),
  assignedToId: z.string().optional(),
  clientContactId: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  notifyViaWhatsApp: z.boolean().default(false),
});

const respondApprovalSchema = z.object({
  approvalId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "REVISION_REQUESTED"]),
  responseNotes: z.string().optional(),
  notifyViaWhatsApp: z.boolean().default(false),
});

// ============================================
// AUTH HELPER
// ============================================

async function authenticateRequest(
  req: NextRequest
): Promise<{ organizationId: string; userId: string } | null> {
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey) {
    const result = await validateApiKey(apiKey);
    if (result) {
      return {
        organizationId: result.organizationId,
        userId: result.apiKey.createdById
      };
    }
  }

  const session = await auth();
  if (session?.user) {
    return {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };
  }

  return null;
}

function errorResponse(
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json({ success: false, error: { message, ...details } }, { status });
}

// ============================================
// GET /api/content/[postId]/approvals
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;

    // Verify post belongs to org
    const post = await db.contentPost.findFirst({
      where: { id: postId, organizationId: auth.organizationId },
      select: { id: true },
    });

    if (!post) return errorResponse("Post not found", 404);

    const approvals = await db.contentApproval.findMany({
      where: { postId },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        clientContact: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: approvals });
  } catch (error) {
    console.error("GET /api/content/[postId]/approvals error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ============================================
// POST /api/content/[postId]/approvals
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;
    const body = await req.json();
    const parsed = createApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request body", 400, {
        validation: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify post belongs to org
    const post = await db.contentPost.findFirst({
      where: { id: postId, organizationId: auth.organizationId },
    });

    if (!post) return errorResponse("Post not found", 404);

    const result = await createApprovalRequest({
      postId,
      approvalType: parsed.data.approvalType,
      requestedById: auth.userId,
      assignedToId: parsed.data.assignedToId,
      clientContactId: parsed.data.clientContactId,
      notes: parsed.data.notes,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      notifyViaWhatsApp: parsed.data.notifyViaWhatsApp,
    });

    if (!result.success) {
      return errorResponse(result.error || "Failed to create approval", 400);
    }

    const approval = await db.contentApproval.findUnique({
      where: { id: result.approvalId },
      include: {
        requestedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        clientContact: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    console.error("POST /api/content/[postId]/approvals error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ============================================
// PATCH /api/content/[postId]/approvals
// ============================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;
    const body = await req.json();
    const parsed = respondApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request body", 400, {
        validation: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify approval belongs to this post and org
    const approval = await db.contentApproval.findFirst({
      where: {
        id: parsed.data.approvalId,
        postId,
        post: { organizationId: auth.organizationId },
      },
    });

    if (!approval) return errorResponse("Approval not found", 404);

    const result = await processApprovalResponse({
      approvalId: parsed.data.approvalId,
      status: parsed.data.status,
      respondedById: auth.userId,
      responseNotes: parsed.data.responseNotes,
      notifyViaWhatsApp: parsed.data.notifyViaWhatsApp,
    });

    if (!result.success) {
      return errorResponse(result.error || "Failed to process approval", 400);
    }

    const updated = await db.contentApproval.findUnique({
      where: { id: parsed.data.approvalId },
      include: {
        requestedBy: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, status: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/content/[postId]/approvals error:", error);
    return errorResponse("Internal server error", 500);
  }
}
