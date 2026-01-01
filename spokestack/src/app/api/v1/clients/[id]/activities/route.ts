/**
 * GET /api/v1/clients/:id/activities - List client activities
 * POST /api/v1/clients/:id/activities - Log a client activity
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  parsePagination,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateActivitySchema = z.object({
  type: z.enum(["NOTE", "EMAIL", "CALL", "MEETING", "TASK", "STATUS_CHANGE"]),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  meetingDate: z.coerce.date().optional().nullable(),
  meetingDuration: z.number().min(0).optional().nullable(),
  attendees: z.array(z.string()).optional(),
  emailSubject: z.string().max(255).optional().nullable(),
  callDuration: z.number().min(0).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: clientId } = await params;
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    const { page, limit, skip } = parsePagination(searchParams);
    const filters = parseFilters(searchParams, ["type"]);

    const where: Record<string, unknown> = { clientId };

    if (filters.type) {
      where.type = filters.type;
    }

    const [activities, total] = await Promise.all([
      prisma.clientActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          meetingDate: true,
          meetingDuration: true,
          attendees: true,
          emailSubject: true,
          callDuration: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.clientActivity.count({ where }),
    ]);

    return paginated(activities, { page, limit, total });
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: clientId } = await params;
    const context = await getAuthContext();

    const data = await validateBody(request, CreateActivitySchema);

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    const activity = await prisma.clientActivity.create({
      data: {
        ...data,
        clientId,
        organizationId: context.organizationId,
        userId: context.user.id,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        meetingDate: true,
        meetingDuration: true,
        attendees: true,
        emailSubject: true,
        callDuration: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return created(activity);
  });
}
