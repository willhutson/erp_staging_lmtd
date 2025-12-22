"use server";

/**
 * Publisher Service
 *
 * Manages the publishing queue and executes publish jobs.
 * Handles scheduling, retries, and error recovery.
 *
 * @module content/services/publisher-service
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { SocialPlatform, PublishJobStatus } from "@prisma/client";
import { getAdapter } from "../adapters/types";
import type { PublishRequest, MediaAsset } from "../adapters/types";
import {
  emitPostPublished,
  emitPublishFailed,
} from "../webhooks/content-webhooks";

// ============================================
// TYPES
// ============================================

export interface CreateJobsInput {
  postId: string;
  organizationId: string;
  platforms?: SocialPlatform[];
  scheduledFor?: Date;
  socialAccountId?: string;
}

export interface ProcessJobResult {
  jobId: string;
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
}

// Retry configuration
const RETRY_DELAYS = [
  5 * 60 * 1000,    // 5 minutes
  30 * 60 * 1000,   // 30 minutes
  2 * 60 * 60 * 1000, // 2 hours
];

// ============================================
// JOB CREATION
// ============================================

/**
 * Creates publish jobs for a content post
 * Creates one job per target platform
 */
export async function createPublishJobs(input: CreateJobsInput): Promise<string[]> {
  const post = await db.contentPost.findUnique({
    where: { id: input.postId },
    select: {
      id: true,
      platforms: true,
      scheduledFor: true,
      timezone: true,
      socialAccountId: true,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const platforms = input.platforms || post.platforms;
  const scheduledFor = input.scheduledFor || post.scheduledFor || new Date();
  const jobIds: string[] = [];

  for (const platform of platforms) {
    const job = await db.publishJob.create({
      data: {
        organizationId: input.organizationId,
        postId: input.postId,
        platform,
        socialAccountId: input.socialAccountId || post.socialAccountId,
        scheduledFor,
        timezone: post.timezone,
        status: "PENDING",
      },
    });

    // Log job creation
    await db.publishLog.create({
      data: {
        jobId: job.id,
        event: "JOB_CREATED",
        message: `Job created for ${platform}`,
      },
    });

    jobIds.push(job.id);
  }

  revalidatePath("/content-engine");
  return jobIds;
}

/**
 * Queues a job for immediate processing
 */
export async function queueJob(jobId: string): Promise<void> {
  await db.publishJob.update({
    where: { id: jobId },
    data: { status: "QUEUED" },
  });

  await db.publishLog.create({
    data: {
      jobId,
      event: "JOB_QUEUED",
      message: "Job queued for processing",
    },
  });
}

/**
 * Cancels a pending or queued job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const job = await db.publishJob.findUnique({
    where: { id: jobId },
  });

  if (!job || !["PENDING", "QUEUED"].includes(job.status)) {
    throw new Error("Job cannot be cancelled");
  }

  await db.publishJob.update({
    where: { id: jobId },
    data: { status: "CANCELLED" },
  });

  await db.publishLog.create({
    data: {
      jobId,
      event: "JOB_CANCELLED",
      message: "Job cancelled by user",
    },
  });

  revalidatePath("/content-engine");
}

// ============================================
// JOB PROCESSING
// ============================================

/**
 * Processes a single publish job
 */
export async function processJob(jobId: string): Promise<ProcessJobResult> {
  const startTime = Date.now();

  const job = await db.publishJob.findUnique({
    where: { id: jobId },
    include: {
      post: {
        include: {
          client: { select: { id: true, name: true } },
          assets: { orderBy: { sortOrder: "asc" } },
        },
      },
      socialAccount: true,
    },
  });

  if (!job) {
    return { jobId, success: false, error: "Job not found" };
  }

  if (!["PENDING", "QUEUED"].includes(job.status)) {
    return { jobId, success: false, error: `Job status is ${job.status}` };
  }

  // Mark as processing
  await db.publishJob.update({
    where: { id: jobId },
    data: {
      status: "PROCESSING",
      attempts: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });

  await db.publishLog.create({
    data: {
      jobId,
      event: "PUBLISH_STARTED",
      message: `Attempt ${job.attempts + 1} of ${job.maxAttempts}`,
    },
  });

  try {
    // Get platform adapter
    const adapter = getAdapter(job.platform);
    if (!adapter) {
      throw new Error(`No adapter available for ${job.platform}`);
    }

    // Prepare publish request
    const request: PublishRequest = {
      postId: job.postId,
      platform: job.platform,
      contentType: job.post.contentType,
      caption: job.post.caption,
      hashtags: job.post.hashtags,
      mentions: job.post.mentions,
      assets: job.post.assets.map(
        (a): MediaAsset => ({
          id: a.id,
          type: a.type as "IMAGE" | "VIDEO" | "GIF",
          url: a.fileUrl,
          thumbnailUrl: a.thumbnailUrl || undefined,
          width: a.width || undefined,
          height: a.height || undefined,
          duration: a.duration || undefined,
          altText: a.altText || undefined,
        })
      ),
      linkUrl: job.post.linkUrl || undefined,
      credentials: {
        accessToken: job.socialAccount?.accessToken || "",
        refreshToken: job.socialAccount?.refreshToken || undefined,
        tokenExpiresAt: job.socialAccount?.tokenExpiresAt || undefined,
        accountId: job.socialAccount?.accountId || undefined,
      },
      scheduledFor: job.scheduledFor,
    };

    // Validate first
    const validation = await adapter.validate(request);
    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Publish
    const result = await adapter.publish(request);
    const duration = Date.now() - startTime;

    if (result.success) {
      // Success!
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          platformPostId: result.platformPostId,
          platformPostUrl: result.platformPostUrl,
          metadata: (result.metadata || {}) as Prisma.InputJsonValue,
        },
      });

      // Update the post as well
      await db.contentPost.update({
        where: { id: job.postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          platformPostId: result.platformPostId,
          platformPostUrl: result.platformPostUrl,
        },
      });

      await db.publishLog.create({
        data: {
          jobId,
          event: "PUBLISH_SUCCESS",
          message: `Published successfully`,
          responseData: result as unknown as Prisma.InputJsonValue,
          durationMs: duration,
        },
      });

      // Emit webhook
      await emitPostPublished({
        id: job.postId,
        organizationId: job.organizationId,
        clientId: job.post.clientId,
        platforms: [job.platform],
        platformPostId: result.platformPostId,
        platformPostUrl: result.platformPostUrl,
      });

      revalidatePath("/content-engine");

      return {
        jobId,
        success: true,
        platformPostId: result.platformPostId,
        platformPostUrl: result.platformPostUrl,
      };
    } else {
      throw new Error(result.error?.message || "Unknown publish error");
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Log the failure
    await db.publishLog.create({
      data: {
        jobId,
        event: "PUBLISH_FAILED",
        message: errorMessage,
        durationMs: duration,
      },
    });

    // Check if we should retry
    const newAttempts = job.attempts + 1;
    if (newAttempts < job.maxAttempts) {
      // Schedule retry
      const retryDelay = RETRY_DELAYS[Math.min(newAttempts - 1, RETRY_DELAYS.length - 1)];
      const nextRetryAt = new Date(Date.now() + retryDelay);

      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "PENDING",
          nextRetryAt,
          errorCode: "RETRY_SCHEDULED",
          errorMessage,
        },
      });

      await db.publishLog.create({
        data: {
          jobId,
          event: "RETRY_SCHEDULED",
          message: `Retry scheduled for ${nextRetryAt.toISOString()}`,
        },
      });
    } else {
      // All retries exhausted
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorCode: "MAX_RETRIES_EXCEEDED",
          errorMessage,
        },
      });

      // Update post status
      await db.contentPost.update({
        where: { id: job.postId },
        data: {
          status: "FAILED",
          publishError: errorMessage,
        },
      });

      // Emit failure webhook
      await emitPublishFailed(job.postId, job.organizationId, errorMessage, job.platform);
    }

    revalidatePath("/content-engine");

    return { jobId, success: false, error: errorMessage };
  }
}

/**
 * Processes all due jobs
 * Call this from a cron job or scheduled task
 */
export async function processDueJobs(): Promise<ProcessJobResult[]> {
  const now = new Date();

  const dueJobs = await db.publishJob.findMany({
    where: {
      status: { in: ["PENDING", "QUEUED"] },
      scheduledFor: { lte: now },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
    },
    orderBy: [{ priority: "desc" }, { scheduledFor: "asc" }],
    take: 10, // Process in batches
  });

  const results: ProcessJobResult[] = [];

  for (const job of dueJobs) {
    const result = await processJob(job.id);
    results.push(result);
  }

  return results;
}

// ============================================
// MANUAL PUBLISHING
// ============================================

/**
 * Marks a job as manually published
 * Used when the user publishes outside the system
 */
export async function markAsManuallyPublished(
  jobId: string,
  platformPostUrl?: string
): Promise<void> {
  const job = await db.publishJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  await db.publishJob.update({
    where: { id: jobId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      platformPostUrl,
      platformPostId: `manual_${Date.now()}`,
      metadata: { manuallyPublished: true },
    },
  });

  // Update post as well
  await db.contentPost.update({
    where: { id: job.postId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      platformPostUrl,
    },
  });

  await db.publishLog.create({
    data: {
      jobId,
      event: "PUBLISH_SUCCESS",
      message: "Manually marked as published",
    },
  });

  revalidatePath("/content-engine");
}

/**
 * Retries a failed job
 */
export async function retryJob(jobId: string): Promise<void> {
  const job = await db.publishJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== "FAILED") {
    throw new Error("Job cannot be retried");
  }

  await db.publishJob.update({
    where: { id: jobId },
    data: {
      status: "PENDING",
      attempts: 0,
      errorCode: null,
      errorMessage: null,
      nextRetryAt: null,
    },
  });

  await db.publishLog.create({
    data: {
      jobId,
      event: "JOB_QUEUED",
      message: "Job reset for retry",
    },
  });

  revalidatePath("/content-engine");
}

// ============================================
// QUERIES
// ============================================

/**
 * Gets jobs for a post
 */
export async function getJobsForPost(postId: string) {
  return db.publishJob.findMany({
    where: { postId },
    include: {
      logs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      socialAccount: {
        select: { id: true, platform: true, accountName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Gets the publishing queue
 */
export async function getPublishQueue(
  organizationId: string,
  filters?: {
    status?: PublishJobStatus[];
    platform?: SocialPlatform;
    fromDate?: Date;
    toDate?: Date;
  }
) {
  const where: Prisma.PublishJobWhereInput = {
    organizationId,
  };

  if (filters?.status) {
    where.status = { in: filters.status };
  }

  if (filters?.platform) {
    where.platform = filters.platform;
  }

  if (filters?.fromDate || filters?.toDate) {
    where.scheduledFor = {};
    if (filters.fromDate) where.scheduledFor.gte = filters.fromDate;
    if (filters.toDate) where.scheduledFor.lte = filters.toDate;
  }

  return db.publishJob.findMany({
    where,
    include: {
      post: {
        select: {
          id: true,
          title: true,
          client: { select: { id: true, name: true, code: true } },
          assets: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      socialAccount: {
        select: { id: true, accountName: true, avatarUrl: true },
      },
    },
    orderBy: [{ status: "asc" }, { scheduledFor: "asc" }],
  });
}

/**
 * Gets queue statistics
 */
export async function getQueueStats(organizationId: string) {
  const [pending, processing, published, failed, scheduled] = await Promise.all([
    db.publishJob.count({ where: { organizationId, status: "PENDING" } }),
    db.publishJob.count({ where: { organizationId, status: "PROCESSING" } }),
    db.publishJob.count({
      where: {
        organizationId,
        status: "PUBLISHED",
        publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    db.publishJob.count({
      where: {
        organizationId,
        status: "FAILED",
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.publishJob.count({
      where: {
        organizationId,
        status: "PENDING",
        scheduledFor: { gt: new Date() },
      },
    }),
  ]);

  return { pending, processing, published, failed, scheduled };
}
