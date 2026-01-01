/**
 * API utilities for handling REST API routes
 */

import { NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// ============================================
// Types
// ============================================

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    permissionLevel: string;
  };
  organizationId: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

// ============================================
// Error Handling
// ============================================

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new ApiError(message, "BAD_REQUEST", 400, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, "UNAUTHORIZED", 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, "FORBIDDEN", 403);
  }

  static notFound(resource = "Resource") {
    return new ApiError(`${resource} not found`, "NOT_FOUND", 404);
  }

  static conflict(message: string) {
    return new ApiError(message, "CONFLICT", 409);
  }

  static validation(details: Record<string, unknown>) {
    return new ApiError("Validation failed", "VALIDATION_ERROR", 422, details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(message, "INTERNAL_ERROR", 500);
  }
}

// ============================================
// Response Helpers
// ============================================

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  });
}

export function errorResponse(error: ApiError | Error) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}

// ============================================
// Route Handler Wrapper
// ============================================

export async function handleRoute<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============================================
// Auth Context
// ============================================

export async function getAuthContext(): Promise<AuthContext> {
  const session = await getSession();
  if (!session) {
    throw ApiError.unauthorized();
  }

  const supabaseUser = await getUser();
  if (!supabaseUser) {
    throw ApiError.unauthorized();
  }

  // Find user in database
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: supabaseUser.email ?? undefined },
      ],
    },
  });

  if (!user) {
    throw ApiError.unauthorized("User not found in organization");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      permissionLevel: user.permissionLevel,
    },
    organizationId: user.organizationId,
  };
}

export function requirePermission(
  context: AuthContext,
  requiredLevel: string | string[]
) {
  const levels = Array.isArray(requiredLevel) ? requiredLevel : [requiredLevel];
  const hierarchy = ["FREELANCER", "STAFF", "TEAM_LEAD", "LEADERSHIP", "ADMIN"];

  const userLevelIndex = hierarchy.indexOf(context.user.permissionLevel);
  const hasPermission = levels.some((level) => {
    if (level.endsWith("+")) {
      const baseLevelIndex = hierarchy.indexOf(level.slice(0, -1));
      return userLevelIndex >= baseLevelIndex;
    }
    return context.user.permissionLevel === level;
  });

  if (!hasPermission) {
    throw ApiError.forbidden("Insufficient permissions");
  }
}

// Convenience permission helpers
export function requireAdmin(context: AuthContext) {
  requirePermission(context, "ADMIN");
}

export function requireLeadership(context: AuthContext) {
  requirePermission(context, "LEADERSHIP+");
}

export function requireTeamLead(context: AuthContext) {
  requirePermission(context, "TEAM_LEAD+");
}

// ============================================
// Request Parsing
// ============================================

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw ApiError.badRequest("Invalid JSON body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw ApiError.validation({
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  return result.data;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): SortParams {
  const sortParam = searchParams.get("sort") || "";
  const isDescending = sortParam.startsWith("-");
  const field = isDescending ? sortParam.slice(1) : sortParam || defaultField;
  const order: "asc" | "desc" = sortParam
    ? isDescending
      ? "desc"
      : "asc"
    : defaultOrder;

  if (!allowedFields.includes(field)) {
    return { field: defaultField, order: defaultOrder };
  }

  return { field, order };
}

export function parseFilters(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  for (const filter of allowedFilters) {
    const value = searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  }

  return filters;
}
