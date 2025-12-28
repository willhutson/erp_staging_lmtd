/**
 * GET /api/v1/rfp/:id/subitems - Get RFP sub-items
 * POST /api/v1/rfp/:id/subitems - Create sub-item
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireLeadership,
  success,
  created,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const CreateSubitemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: rfpId } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    // Verify RFP belongs to org
    const rfp = await prisma.rFP.findFirst({
      where: {
        id: rfpId,
        organizationId: context.organizationId,
      },
      select: { id: true, name: true, status: true },
    });

    if (!rfp) {
      throw ApiError.notFound("RFP");
    }

    const subitems = await prisma.rFPSubitem.findMany({
      where: { rfpId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        assigneeId: true,
        dueDate: true,
        sortOrder: true,
        completedAt: true,
      },
    });

    type Subitem = (typeof subitems)[number];

    // Calculate summary
    const summary = {
      total: subitems.length,
      byStatus: subitems.reduce((acc: Record<string, number>, s: Subitem) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {}),
    };

    return success({
      rfp: { id: rfp.id, name: rfp.name, status: rfp.status },
      subitems,
      summary,
    });
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: rfpId } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, CreateSubitemSchema);

    // Verify RFP belongs to org
    const rfp = await prisma.rFP.findFirst({
      where: {
        id: rfpId,
        organizationId: context.organizationId,
      },
    });

    if (!rfp) {
      throw ApiError.notFound("RFP");
    }

    // If assigneeId provided, verify user exists in org
    if (data.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assigneeId,
          organizationId: context.organizationId,
        },
      });
      if (!assignee) {
        throw ApiError.notFound("Assignee");
      }
    }

    // Get next sort order if not provided
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const lastSubitem = await prisma.rFPSubitem.findFirst({
        where: { rfpId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (lastSubitem?.sortOrder ?? -1) + 1;
    }

    const subitem = await prisma.rFPSubitem.create({
      data: {
        ...data,
        sortOrder,
        rfpId,
        status: "PENDING",
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        assigneeId: true,
        dueDate: true,
        sortOrder: true,
      },
    });

    return created(subitem);
  });
}
