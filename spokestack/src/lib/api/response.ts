/**
 * Standardized API Response Helpers
 */

import { NextResponse } from "next/server";
import { ApiError, normalizeError } from "./errors";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Success response helper
 */
export function success<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response, { status });
}

/**
 * Created response (201)
 */
export function created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return success(data, undefined, 201);
}

/**
 * No content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response helper
 */
export function error(err: ApiError | unknown): NextResponse<ApiErrorResponse> {
  const apiError = err instanceof ApiError ? err : normalizeError(err);
  return NextResponse.json(apiError.toJSON() as ApiErrorResponse, { status: apiError.status });
}

/**
 * Paginated response helper
 */
export function paginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  return success(data, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit),
  });
}

/**
 * Handle async route with error catching
 */
export async function handleRoute<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    return await handler();
  } catch (err) {
    return error(err);
  }
}
