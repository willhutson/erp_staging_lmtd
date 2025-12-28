/**
 * Request Validation Utilities
 */

import { z } from "zod";
import { ApiError } from "./errors";

/**
 * Validate request body against Zod schema
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw ApiError.badRequest("Invalid JSON body");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    throw ApiError.validation("Validation failed", { errors });
  }

  return result.data;
}

/**
 * Validate URL params
 */
export function validateParams<T extends z.ZodSchema>(
  params: Record<string, string>,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    throw ApiError.validation("Invalid parameters", { errors });
  }

  return result.data;
}

/**
 * Validate query string params
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    throw ApiError.validation("Invalid query parameters", { errors });
  }

  return result.data;
}

// Common validation schemas
export const schemas = {
  // ID validation
  id: z.string().cuid(),

  // Email validation
  email: z.string().email(),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  // Common string fields
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),

  // Date fields
  date: z.coerce.date(),
  dateOptional: z.coerce.date().optional(),
};

/**
 * Create a partial schema for PATCH requests
 */
export function createPatchSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).partial();
}
