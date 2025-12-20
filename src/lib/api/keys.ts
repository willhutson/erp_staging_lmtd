import { db } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';
import type { ApiKey } from '@prisma/client';

const KEY_PREFIX = 'sk_live_';

/**
 * Available API scopes
 */
export const API_SCOPES = {
  'briefs:read': 'Read briefs',
  'briefs:write': 'Create and update briefs',
  'briefs:delete': 'Delete briefs',
  'clients:read': 'Read clients',
  'clients:write': 'Create and update clients',
  'users:read': 'Read users',
  'time:read': 'Read time entries',
  'time:write': 'Create time entries',
  'submissions:read': 'Read form submissions',
  'submissions:write': 'Create submissions',
  'submissions:approve': 'Approve/reject submissions',
  'files:read': 'Read and download files',
  'files:write': 'Upload files',
  'webhooks:manage': 'Manage webhook subscriptions',
} as const;

export type ApiScope = keyof typeof API_SCOPES;

/**
 * Create a new API key
 * Returns the raw key only once - it cannot be retrieved later
 */
export async function createApiKey(options: {
  organizationId: string;
  name: string;
  scopes: ApiScope[];
  createdById: string;
  expiresAt?: Date;
  rateLimit?: number;
}): Promise<{ key: string; apiKey: ApiKey }> {
  // Generate key
  const rawKey = randomBytes(32).toString('base64url');
  const fullKey = `${KEY_PREFIX}${rawKey}`;
  const keyHash = hashKey(fullKey);
  const keyPrefix = fullKey.substring(0, 16);

  const apiKey = await db.apiKey.create({
    data: {
      organizationId: options.organizationId,
      name: options.name,
      keyHash,
      keyPrefix,
      scopes: options.scopes,
      createdById: options.createdById,
      expiresAt: options.expiresAt,
      rateLimit: options.rateLimit ?? 1000,
    },
  });

  // Return raw key only once - it cannot be retrieved later
  return { key: fullKey, apiKey };
}

/**
 * Validate an API key and return its metadata
 */
export async function validateApiKey(key: string): Promise<{
  apiKey: ApiKey;
  organizationId: string;
  scopes: string[];
} | null> {
  if (!key.startsWith(KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashKey(key);

  const apiKey = await db.apiKey.findFirst({
    where: {
      keyHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  if (!apiKey) {
    return null;
  }

  // Update usage stats (fire and forget)
  db.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  }).catch(() => {
    // Ignore errors updating usage stats
  });

  return {
    apiKey,
    organizationId: apiKey.organizationId,
    scopes: apiKey.scopes,
  };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  keyId: string,
  revokedById: string
): Promise<void> {
  await db.apiKey.update({
    where: { id: keyId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedById,
    },
  });
}

/**
 * List API keys for an organization
 */
export async function listApiKeys(organizationId: string): Promise<ApiKey[]> {
  return db.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single API key by ID
 */
export async function getApiKey(
  keyId: string,
  organizationId: string
): Promise<ApiKey | null> {
  return db.apiKey.findFirst({
    where: { id: keyId, organizationId },
  });
}

/**
 * Hash an API key using SHA-256
 */
function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Check if scopes are valid
 */
export function validateScopes(scopes: string[]): scopes is ApiScope[] {
  return scopes.every((scope) => scope in API_SCOPES);
}
