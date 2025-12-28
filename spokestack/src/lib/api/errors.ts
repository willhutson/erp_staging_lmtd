/**
 * API Error Types and Handling
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST"
  | "SERVICE_UNAVAILABLE";

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Access denied"): ApiError {
    return new ApiError("FORBIDDEN", message, 403);
  }

  static notFound(resource = "Resource"): ApiError {
    return new ApiError("NOT_FOUND", `${resource} not found`, 404);
  }

  static validation(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError("VALIDATION_ERROR", message, 400, details);
  }

  static conflict(message: string): ApiError {
    return new ApiError("CONFLICT", message, 409);
  }

  static rateLimited(message = "Too many requests"): ApiError {
    return new ApiError("RATE_LIMITED", message, 429);
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError("INTERNAL_ERROR", message, 500);
  }

  static badRequest(message: string): ApiError {
    return new ApiError("BAD_REQUEST", message, 400);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Convert unknown errors to ApiError
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle Prisma errors
    if (error.message.includes("Unique constraint")) {
      return ApiError.conflict("A record with this value already exists");
    }
    if (error.message.includes("Foreign key constraint")) {
      return ApiError.badRequest("Referenced record does not exist");
    }
    if (error.message.includes("Record to update not found")) {
      return ApiError.notFound();
    }

    console.error("Unhandled error:", error);
    return ApiError.internal();
  }

  console.error("Unknown error type:", error);
  return ApiError.internal();
}
