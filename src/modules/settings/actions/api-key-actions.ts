'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  createApiKey,
  revokeApiKey,
  listApiKeys,
  API_SCOPES,
  type ApiScope,
  validateScopes,
} from '@/lib/api/keys';
import { revalidatePath } from 'next/cache';

/**
 * Create a new API key
 */
export async function createApiKeyAction(data: {
  name: string;
  scopes: string[];
  expiresInDays?: number;
}): Promise<{ success: boolean; key?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Only admins can create API keys
  if (session.user.permissionLevel !== 'ADMIN') {
    return { success: false, error: 'Only admins can create API keys' };
  }

  // Validate scopes
  if (!validateScopes(data.scopes)) {
    return { success: false, error: 'Invalid scopes provided' };
  }

  try {
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const result = await createApiKey({
      organizationId: session.user.organizationId,
      name: data.name,
      scopes: data.scopes as ApiScope[],
      createdById: session.user.id,
      expiresAt,
    });

    revalidatePath('/settings/api');

    // Return the raw key - this is the only time it's available
    return { success: true, key: result.key };
  } catch (error) {
    console.error('Failed to create API key:', error);
    return { success: false, error: 'Failed to create API key' };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKeyAction(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Only admins can revoke API keys
  if (session.user.permissionLevel !== 'ADMIN') {
    return { success: false, error: 'Only admins can revoke API keys' };
  }

  try {
    // Verify key belongs to org
    const key = await db.apiKey.findFirst({
      where: { id: keyId, organizationId: session.user.organizationId },
    });

    if (!key) {
      return { success: false, error: 'API key not found' };
    }

    await revokeApiKey(keyId, session.user.id);

    revalidatePath('/settings/api');

    return { success: true };
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return { success: false, error: 'Failed to revoke API key' };
  }
}

/**
 * List API keys for the current organization
 */
export async function listApiKeysAction(): Promise<{
  success: boolean;
  keys?: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    scopes: string[];
    isActive: boolean;
    lastUsedAt: Date | null;
    usageCount: number;
    expiresAt: Date | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Only admins and leadership can view API keys
  if (!['ADMIN', 'LEADERSHIP'].includes(session.user.permissionLevel)) {
    return { success: false, error: 'Insufficient permissions' };
  }

  try {
    const keys = await listApiKeys(session.user.organizationId);

    return {
      success: true,
      keys: keys.map((key) => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        scopes: key.scopes,
        isActive: key.isActive,
        lastUsedAt: key.lastUsedAt,
        usageCount: key.usageCount,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
    };
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return { success: false, error: 'Failed to list API keys' };
  }
}

/**
 * Get available API scopes
 */
export async function getApiScopesAction(): Promise<{
  success: boolean;
  scopes?: typeof API_SCOPES;
}> {
  const session = await auth();
  if (!session?.user) {
    return { success: false };
  }

  return { success: true, scopes: API_SCOPES };
}
