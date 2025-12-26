import { NextRequest } from "next/server";
import { getOrgContext, type OrgContext } from "@/lib/auth";
import { hasMinLevel } from "@/lib/permissions";
import type { PermissionLevel } from "@prisma/client";

/**
 * Extended API context for session-based auth
 */
export interface SessionApiContext extends OrgContext {
  // Additional context can be added here
}

/**
 * Wrap an API handler with session-based authentication
 * Used by the admin panel (Refine) and internal APIs
 */
export async function withSessionAuth(
  request: NextRequest,
  options: {
    minLevel?: PermissionLevel;
  },
  handler: (ctx: SessionApiContext) => Promise<Response>
): Promise<Response> {
  try {
    const ctx = await getOrgContext();

    // Check minimum permission level
    if (options.minLevel && !hasMinLevel(ctx, options.minLevel)) {
      return apiError(
        `Insufficient permissions. Required: ${options.minLevel}`,
        403
      );
    }

    return await handler(ctx);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return apiError("Unauthorized", 401);
      }
    }
    console.error("Session API Error:", error);
    return apiError("Internal server error", 500);
  }
}

/**
 * Return a successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

/**
 * Return an error JSON response
 */
export function apiError(message: string, status = 400): Response {
  return Response.json({ error: { message, status } }, { status });
}

/**
 * Return a paginated response compatible with Refine's data provider
 * Refine expects: { data: T[], total: number }
 */
export function apiPaginated<T>(
  data: T[],
  total: number,
  options?: { limit?: number; offset?: number }
): Response {
  return Response.json({
    data,
    total,
    ...(options && {
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: (options.offset || 0) + data.length < total,
      },
    }),
  });
}

/**
 * Parse Refine pagination/sorting/filtering from query params
 */
export function parseRefineParams(searchParams: URLSearchParams): {
  pagination: { limit: number; offset: number };
  sort: { field: string; order: "asc" | "desc" }[];
  filters: Record<string, string>;
} {
  // Pagination (_start, _end or limit, offset)
  const start = parseInt(searchParams.get("_start") || "0", 10);
  const end = parseInt(searchParams.get("_end") || "10", 10);
  const limit = end - start || 10;
  const offset = start;

  // Sorting (_sort, _order)
  const sortField = searchParams.get("_sort") || "createdAt";
  const sortOrder = (searchParams.get("_order") || "desc").toLowerCase() as
    | "asc"
    | "desc";
  const sort = [{ field: sortField, order: sortOrder }];

  // Filters (all other params except pagination/sort)
  const filters: Record<string, string> = {};
  const excludeParams = ["_start", "_end", "_sort", "_order"];
  searchParams.forEach((value, key) => {
    if (!excludeParams.includes(key) && value) {
      filters[key] = value;
    }
  });

  return {
    pagination: { limit: Math.min(limit, 100), offset: Math.max(offset, 0) },
    sort,
    filters,
  };
}

/**
 * Build Prisma orderBy from sort params
 */
export function buildOrderBy(
  sort: { field: string; order: "asc" | "desc" }[]
): Record<string, "asc" | "desc"> {
  if (sort.length === 0) {
    return { createdAt: "desc" };
  }
  return { [sort[0].field]: sort[0].order };
}
