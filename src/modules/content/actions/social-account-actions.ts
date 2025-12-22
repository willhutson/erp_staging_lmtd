"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { SocialPlatform, AccountManagementType, Prisma } from "@prisma/client";
import {
  getPlatformFamily,
  getPlatformDisplayName,
} from "@/modules/content/utils/platform-utils";

// ============================================
// TYPES
// ============================================

export interface CreateSocialAccountInput {
  organizationId: string;
  clientId: string;
  platform: SocialPlatform;
  accountName: string;
  accountId?: string;
  accountUrl?: string;
  avatarUrl?: string;
  managementType?: AccountManagementType;
  settings?: Record<string, unknown>;
}

export interface UpdateSocialAccountInput {
  accountName?: string;
  accountUrl?: string;
  avatarUrl?: string;
  managementType?: AccountManagementType;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

// ============================================
// SOCIAL ACCOUNT CRUD
// ============================================

export async function createSocialAccount(input: CreateSocialAccountInput) {
  const account = await db.socialAccount.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId,
      platform: input.platform,
      accountName: input.accountName,
      accountId: input.accountId,
      accountUrl: input.accountUrl,
      avatarUrl: input.avatarUrl,
      managementType: input.managementType || "AGENCY_MANAGED",
      settings: (input.settings || {}) as Prisma.InputJsonValue,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });

  revalidatePath("/content-engine");
  revalidatePath(`/clients/${input.clientId}`);
  return account;
}

export async function getSocialAccount(accountId: string) {
  return db.socialAccount.findUnique({
    where: { id: accountId },
    include: {
      client: { select: { id: true, name: true, code: true } },
      contentPosts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
        },
      },
    },
  });
}

export async function getSocialAccounts(
  organizationId: string,
  clientId?: string
) {
  const where: { organizationId: string; clientId?: string } = {
    organizationId,
  };

  if (clientId) {
    where.clientId = clientId;
  }

  return db.socialAccount.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
      _count: {
        select: { contentPosts: true },
      },
    },
    orderBy: [{ client: { name: "asc" } }, { platform: "asc" }],
  });
}

export async function getClientSocialAccounts(clientId: string) {
  return db.socialAccount.findMany({
    where: { clientId, isActive: true },
    orderBy: { platform: "asc" },
  });
}

export async function updateSocialAccount(
  accountId: string,
  input: UpdateSocialAccountInput
) {
  const account = await db.socialAccount.update({
    where: { id: accountId },
    data: {
      ...input,
      settings: input.settings as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath("/content-engine");
  return account;
}

export async function deleteSocialAccount(accountId: string) {
  // Check for linked posts first
  const postCount = await db.contentPost.count({
    where: { socialAccountId: accountId },
  });

  if (postCount > 0) {
    throw new Error(
      `Cannot delete account with ${postCount} linked posts. Remove or reassign posts first.`
    );
  }

  await db.socialAccount.delete({
    where: { id: accountId },
  });

  revalidatePath("/content-engine");
}

// ============================================
// ACCOUNT STATUS
// ============================================

export async function activateAccount(accountId: string) {
  return db.socialAccount.update({
    where: { id: accountId },
    data: { isActive: true },
  });
}

export async function deactivateAccount(accountId: string) {
  return db.socialAccount.update({
    where: { id: accountId },
    data: { isActive: false },
  });
}

export async function updateLastSync(
  accountId: string,
  error?: string
) {
  return db.socialAccount.update({
    where: { id: accountId },
    data: {
      lastSyncAt: new Date(),
      lastError: error || null,
    },
  });
}

// ============================================
// STATS
// ============================================

export async function getAccountStats(organizationId: string) {
  const accounts = await db.socialAccount.groupBy({
    by: ["platform"],
    where: { organizationId, isActive: true },
    _count: { id: true },
  });

  const byFamily: Record<string, number> = {};

  for (const account of accounts) {
    const family = getPlatformFamily(account.platform);
    byFamily[family] = (byFamily[family] || 0) + account._count.id;
  }

  return {
    byPlatform: accounts.map((a) => ({
      platform: a.platform,
      displayName: getPlatformDisplayName(a.platform),
      count: a._count.id,
    })),
    byFamily: Object.entries(byFamily).map(([family, count]) => ({
      family,
      count,
    })),
    total: accounts.reduce((sum, a) => sum + a._count.id, 0),
  };
}
