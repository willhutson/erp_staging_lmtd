/**
 * Pagination Utilities for API Routes
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse pagination params from URL search params
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination result
 */
export function buildPaginationResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

/**
 * Parse sort params from URL search params
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): { field: string; order: "asc" | "desc" } {
  const sortBy = searchParams.get("sortBy") || defaultField;
  const sortOrder = (searchParams.get("sortOrder") || defaultOrder) as "asc" | "desc";

  // Validate sort field
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = ["asc", "desc"].includes(sortOrder) ? sortOrder : defaultOrder;

  return { field, order };
}

/**
 * Parse filter params from URL search params
 */
export function parseFilters(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): Record<string, string> {
  const filters: Record<string, string> = {};

  for (const key of allowedFilters) {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
    }
  }

  return filters;
}
