import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiPaginated,
  parseRefineParams,
  buildOrderBy,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/admin/audit-logs - List audit logs
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.action && { action: filters.action as Prisma.EnumAuditActionFilter }),
      ...(filters.resource && { resource: filters.resource }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.q && {
        OR: [
          { resource: { contains: filters.q, mode: "insensitive" } },
          { resourceId: { contains: filters.q, mode: "insensitive" } },
          { resourceName: { contains: filters.q, mode: "insensitive" } },
          { userName: { contains: filters.q, mode: "insensitive" } },
          { changesSummary: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
      // Date range filters
      ...(filters.startDate && {
        createdAt: { gte: new Date(filters.startDate) },
      }),
      ...(filters.endDate && {
        createdAt: { lte: new Date(filters.endDate) },
      }),
    };

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        select: {
          id: true,
          userId: true,
          userName: true,
          userEmail: true,
          action: true,
          resource: true,
          resourceId: true,
          resourceName: true,
          changesSummary: true,
          ipAddress: true,
          createdAt: true,
        },
        orderBy: sort.length > 0 ? buildOrderBy(sort) : { createdAt: "desc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.auditLog.count({ where }),
    ]);

    // Transform to include user relation-like structure for Refine
    const transformedLogs = logs.map((log) => ({
      ...log,
      user: log.userId
        ? { id: log.userId, name: log.userName, email: log.userEmail }
        : null,
    }));

    return apiPaginated(transformedLogs, total, pagination);
  });
}
