import { NextRequest } from 'next/server';
import { withApiAuth, apiSuccess, apiPaginated, apiError, parsePagination } from '@/lib/api/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';
import { BriefType, BriefStatus, Priority } from '@prisma/client';

// GET /api/v1/briefs - List briefs
export async function GET(request: NextRequest) {
  return withApiAuth(request, ['briefs:read'], async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);

    // Build filters
    const status = searchParams.get('status') as BriefStatus | null;
    const type = searchParams.get('type') as BriefType | null;
    const clientId = searchParams.get('client_id');
    const assigneeId = searchParams.get('assignee_id');
    const search = searchParams.get('search');

    const where = {
      organizationId: ctx.organizationId,
      ...(status && { status }),
      ...(type && { type }),
      ...(clientId && { clientId }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { briefNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [briefs, total] = await Promise.all([
      db.brief.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, code: true } },
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.brief.count({ where }),
    ]);

    return apiPaginated(briefs, total, limit, offset);
  });
}

// POST /api/v1/briefs - Create brief
const createBriefSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.nativeEnum(BriefType),
  clientId: z.string(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  formData: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  return withApiAuth(request, ['briefs:write'], async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const parsed = createBriefSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(`Validation error: ${parsed.error.errors.map(e => e.message).join(', ')}`, 400);
    }

    const data = parsed.data;

    // Verify client belongs to org
    const client = await db.client.findFirst({
      where: { id: data.clientId, organizationId: ctx.organizationId },
    });

    if (!client) {
      return apiError('Client not found', 404);
    }

    // Verify assignee belongs to org (if provided)
    if (data.assigneeId) {
      const assignee = await db.user.findFirst({
        where: { id: data.assigneeId, organizationId: ctx.organizationId },
      });
      if (!assignee) {
        return apiError('Assignee not found', 404);
      }
    }

    // Generate brief number
    const briefNumber = await generateBriefNumber(ctx.organizationId, data.type);

    const brief = await db.brief.create({
      data: {
        organizationId: ctx.organizationId,
        briefNumber,
        title: data.title,
        type: data.type,
        clientId: data.clientId,
        projectId: data.projectId,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        assigneeId: data.assigneeId,
        priority: data.priority || Priority.MEDIUM,
        status: BriefStatus.DRAFT,
        formData: data.formData || {},
        createdById: data.assigneeId || ctx.apiKeyId, // Use assignee or API key as creator
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // TODO: Emit webhook event for brief.created

    return apiSuccess(brief, 201);
  });
}

/**
 * Generate a unique brief number
 */
async function generateBriefNumber(organizationId: string, type: BriefType): Promise<string> {
  const prefix = getBriefPrefix(type);
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // Count existing briefs of this type this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await db.brief.count({
    where: {
      organizationId,
      type,
      createdAt: { gte: startOfMonth },
    },
  });

  const sequence = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${year}${month}-${sequence}`;
}

function getBriefPrefix(type: BriefType): string {
  const prefixes: Record<BriefType, string> = {
    VIDEO_SHOOT: 'SHT',
    VIDEO_EDIT: 'EDT',
    DESIGN: 'DSG',
    COPYWRITING_EN: 'CPY',
    COPYWRITING_AR: 'CPA',
    PAID_MEDIA: 'PMD',
    REPORT: 'RPT',
  };
  return prefixes[type] || 'BRF';
}
