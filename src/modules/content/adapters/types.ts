/**
 * Platform Adapter Interface
 *
 * Defines the contract for social platform publishing adapters.
 * Each platform (Instagram, TikTok, etc.) implements this interface.
 *
 * @module content/adapters/types
 */

import type { SocialPlatform, ContentType } from "@prisma/client";

// ============================================
// CORE TYPES
// ============================================

export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  accountId?: string;
  pageId?: string;
  additionalData?: Record<string, unknown>;
}

export interface MediaAsset {
  id: string;
  type: "IMAGE" | "VIDEO" | "GIF";
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
}

export interface PublishRequest {
  postId: string;
  platform: SocialPlatform;
  contentType: ContentType;
  caption: string;
  hashtags: string[];
  mentions: string[];
  assets: MediaAsset[];
  linkUrl?: string;
  locationId?: string;
  scheduledFor?: Date;
  credentials: PlatformCredentials;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export interface PlatformCapabilities {
  platform: SocialPlatform;
  displayName: string;

  // Content support
  supportsImages: boolean;
  supportsVideos: boolean;
  supportsCarousels: boolean;
  supportsStories: boolean;
  supportsReels: boolean;
  supportsText: boolean;
  supportsLinks: boolean;
  supportsScheduling: boolean;

  // Limits
  maxCaptionLength: number;
  maxHashtags: number;
  maxMentions: number;
  maxImages: number;
  maxVideoLength: number; // seconds
  maxFileSize: number; // bytes

  // Aspect ratios
  supportedAspectRatios: string[];
  recommendedAspectRatio: string;

  // API info
  requiresOAuth: boolean;
  oauthScopes: string[];
}

// ============================================
// ADAPTER INTERFACE
// ============================================

export interface PlatformAdapter {
  /**
   * Platform identifier
   */
  platform: SocialPlatform;

  /**
   * Get platform capabilities and limits
   */
  getCapabilities(): PlatformCapabilities;

  /**
   * Validate content before publishing
   */
  validate(request: PublishRequest): Promise<ValidationResult>;

  /**
   * Publish content to the platform
   */
  publish(request: PublishRequest): Promise<PublishResult>;

  /**
   * Delete a published post
   */
  delete(platformPostId: string, credentials: PlatformCredentials): Promise<boolean>;

  /**
   * Get post metrics/insights
   */
  getMetrics(
    platformPostId: string,
    credentials: PlatformCredentials
  ): Promise<{
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
    impressions?: number;
  }>;

  /**
   * Refresh OAuth token if expired
   */
  refreshToken?(credentials: PlatformCredentials): Promise<PlatformCredentials>;

  /**
   * Test connection/credentials
   */
  testConnection(credentials: PlatformCredentials): Promise<boolean>;
}

// ============================================
// ADAPTER REGISTRY
// ============================================

const adapters = new Map<SocialPlatform, PlatformAdapter>();

export function registerAdapter(adapter: PlatformAdapter): void {
  adapters.set(adapter.platform, adapter);
}

export function getAdapter(platform: SocialPlatform): PlatformAdapter | undefined {
  return adapters.get(platform);
}

export function hasAdapter(platform: SocialPlatform): boolean {
  return adapters.has(platform);
}

export function listAdapters(): SocialPlatform[] {
  return Array.from(adapters.keys());
}
