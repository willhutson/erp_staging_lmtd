"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { SocialPlatform, AccountManagementType, Prisma } from "@prisma/client";

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
      settings: (input.settings || {}) as Prisma.JsonObject,
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
  const { settings, ...rest } = input;
  const account = await db.socialAccount.update({
    where: { id: accountId },
    data: {
      ...rest,
      ...(settings !== undefined && { settings: settings as Prisma.JsonObject }),
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
// PLATFORM GROUPINGS
// ============================================

export async function getPlatformFamily(platform: SocialPlatform): Promise<string> {
  const families: Record<SocialPlatform, string> = {
    INSTAGRAM_FEED: "Meta",
    INSTAGRAM_STORY: "Meta",
    INSTAGRAM_REEL: "Meta",
    FACEBOOK_PAGE: "Meta",
    FACEBOOK_STORY: "Meta",
    THREADS: "Meta",
    TIKTOK: "TikTok",
    YOUTUBE_VIDEO: "Google",
    YOUTUBE_SHORT: "Google",
    LINKEDIN_PAGE: "LinkedIn",
    LINKEDIN_PERSONAL: "LinkedIn",
    LINKEDIN_ARTICLE: "LinkedIn",
    X_TWEET: "X",
    X_THREAD: "X",
    WORDPRESS: "CMS",
    CUSTOM_CMS: "CMS",
    PINTEREST: "Pinterest",
    SNAPCHAT: "Snapchat",
  };

  return families[platform] || "Other";
}

export async function getPlatformDisplayName(platform: SocialPlatform): Promise<string> {
  const names: Record<SocialPlatform, string> = {
    INSTAGRAM_FEED: "Instagram Feed",
    INSTAGRAM_STORY: "Instagram Story",
    INSTAGRAM_REEL: "Instagram Reel",
    FACEBOOK_PAGE: "Facebook Page",
    FACEBOOK_STORY: "Facebook Story",
    THREADS: "Threads",
    TIKTOK: "TikTok",
    YOUTUBE_VIDEO: "YouTube Video",
    YOUTUBE_SHORT: "YouTube Short",
    LINKEDIN_PAGE: "LinkedIn Company",
    LINKEDIN_PERSONAL: "LinkedIn Personal",
    LINKEDIN_ARTICLE: "LinkedIn Article",
    X_TWEET: "X (Tweet)",
    X_THREAD: "X (Thread)",
    WORDPRESS: "WordPress",
    CUSTOM_CMS: "Custom CMS",
    PINTEREST: "Pinterest",
    SNAPCHAT: "Snapchat",
  };

  return names[platform] || platform;
}

export async function getPlatformIcon(platform: SocialPlatform): Promise<string> {
  const icons: Record<SocialPlatform, string> = {
    INSTAGRAM_FEED: "Instagram",
    INSTAGRAM_STORY: "Instagram",
    INSTAGRAM_REEL: "Instagram",
    FACEBOOK_PAGE: "Facebook",
    FACEBOOK_STORY: "Facebook",
    THREADS: "AtSign",
    TIKTOK: "Music2",
    YOUTUBE_VIDEO: "Youtube",
    YOUTUBE_SHORT: "Youtube",
    LINKEDIN_PAGE: "Linkedin",
    LINKEDIN_PERSONAL: "Linkedin",
    LINKEDIN_ARTICLE: "Linkedin",
    X_TWEET: "Twitter",
    X_THREAD: "Twitter",
    WORDPRESS: "Globe",
    CUSTOM_CMS: "Globe",
    PINTEREST: "Pin",
    SNAPCHAT: "Ghost",
  };

  return icons[platform] || "Globe";
}

export async function getPlatformColor(platform: SocialPlatform): Promise<string> {
  const colors: Record<SocialPlatform, string> = {
    INSTAGRAM_FEED: "#E4405F",
    INSTAGRAM_STORY: "#E4405F",
    INSTAGRAM_REEL: "#E4405F",
    FACEBOOK_PAGE: "#1877F2",
    FACEBOOK_STORY: "#1877F2",
    THREADS: "#000000",
    TIKTOK: "#000000",
    YOUTUBE_VIDEO: "#FF0000",
    YOUTUBE_SHORT: "#FF0000",
    LINKEDIN_PAGE: "#0A66C2",
    LINKEDIN_PERSONAL: "#0A66C2",
    LINKEDIN_ARTICLE: "#0A66C2",
    X_TWEET: "#000000",
    X_THREAD: "#000000",
    WORDPRESS: "#21759B",
    CUSTOM_CMS: "#6B7280",
    PINTEREST: "#E60023",
    SNAPCHAT: "#FFFC00",
  };

  return colors[platform] || "#6B7280";
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
    const family = await getPlatformFamily(account.platform);
    byFamily[family] = (byFamily[family] || 0) + account._count.id;
  }

  const byPlatform = await Promise.all(
    accounts.map(async (a) => ({
      platform: a.platform,
      displayName: await getPlatformDisplayName(a.platform),
      count: a._count.id,
    }))
  );

  return {
    byPlatform,
    byFamily: Object.entries(byFamily).map(([family, count]) => ({
      family,
      count,
    })),
    total: accounts.reduce((sum, a) => sum + a._count.id, 0),
  };
}
