import { NextRequest } from 'next/server';
import { validateApiKey, type ApiScope } from './keys';
import { db } from '@/lib/db';

export interface ApiContext {
  organizationId: string;
  apiKeyId: string;
  scopes: string[];
}

/**
 * Wrap an API handler with authentication and authorization
 */
export async function withApiAuth(
  request: NextRequest,
  requiredScopes: ApiScope[],
  handler: (ctx: ApiContext) => Promise<Response>
): Promise<Response> {
  const startTime = Date.now();

  // Extract API key from header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return apiError('Missing or invalid Authorization header', 401);
  }

  const key = authHeader.substring(7);
  const auth = await validateApiKey(key);

  if (!auth) {
    return apiError('Invalid API key', 401);
  }

  // Check scopes
  const hasScopes = requiredScopes.every((s) => auth.scopes.includes(s));
  if (!hasScopes) {
    return apiError(`Missing required scopes: ${requiredScopes.join(', ')}`, 403);
  }

  // Rate limiting check
  const isRateLimited = await checkRateLimit(auth.apiKey.id, auth.apiKey.rateLimit);
  if (isRateLimited) {
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const response = await handler({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKey.id,
      scopes: auth.scopes,
    });

    // Log request (fire and forget)
    logApiRequest({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKey.id,
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    }).catch(() => {});

    return response;
  } catch (error) {
    console.error('API Error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * Return a successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

/**
 * Return an error JSON response
 */
export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: { message } }, { status });
}

/**
 * Return a paginated JSON response
 */
export function apiPaginated<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): Response {
  return Response.json({
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
    },
  });
}

/**
 * Check if an API key has exceeded its rate limit
 * Uses a simple sliding window approach
 */
async function checkRateLimit(apiKeyId: string, rateLimit: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const requestCount = await db.apiRequestLog.count({
    where: {
      apiKeyId,
      createdAt: { gte: oneHourAgo },
    },
  });

  return requestCount >= rateLimit;
}

/**
 * Log an API request for debugging and rate limiting
 */
async function logApiRequest(data: {
  organizationId: string;
  apiKeyId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string | null;
  userAgent: string | null;
}): Promise<void> {
  await db.apiRequestLog.create({
    data: {
      organizationId: data.organizationId,
      apiKeyId: data.apiKeyId,
      method: data.method,
      path: data.path,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

/**
 * Parse pagination parameters from query string
 */
export function parsePagination(searchParams: URLSearchParams): {
  limit: number;
  offset: number;
} {
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
    100
  );
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
  return { limit, offset };
}
