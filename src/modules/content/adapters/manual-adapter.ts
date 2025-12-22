/**
 * Manual Publishing Adapter
 *
 * A placeholder adapter for platforms without API integration.
 * Marks posts as "ready for manual publish" and tracks when
 * the user confirms the manual publish was completed.
 *
 * @module content/adapters/manual-adapter
 */

import type { SocialPlatform } from "@prisma/client";
import type {
  PlatformAdapter,
  PlatformCapabilities,
  PublishRequest,
  PublishResult,
  ValidationResult,
} from "./types";
import { registerAdapter } from "./types";

// Platform configurations
const PLATFORM_CONFIGS: Record<string, Partial<PlatformCapabilities>> = {
  INSTAGRAM_FEED: {
    displayName: "Instagram Feed",
    supportsImages: true,
    supportsVideos: true,
    supportsCarousels: true,
    maxCaptionLength: 2200,
    maxHashtags: 30,
    maxImages: 10,
    maxVideoLength: 60,
    supportedAspectRatios: ["1:1", "4:5", "1.91:1"],
    recommendedAspectRatio: "1:1",
  },
  INSTAGRAM_STORY: {
    displayName: "Instagram Story",
    supportsImages: true,
    supportsVideos: true,
    supportsStories: true,
    maxCaptionLength: 0,
    maxVideoLength: 15,
    supportedAspectRatios: ["9:16"],
    recommendedAspectRatio: "9:16",
  },
  INSTAGRAM_REEL: {
    displayName: "Instagram Reel",
    supportsVideos: true,
    supportsReels: true,
    maxCaptionLength: 2200,
    maxHashtags: 30,
    maxVideoLength: 90,
    supportedAspectRatios: ["9:16"],
    recommendedAspectRatio: "9:16",
  },
  TIKTOK: {
    displayName: "TikTok",
    supportsVideos: true,
    supportsReels: true,
    maxCaptionLength: 2200,
    maxHashtags: 100,
    maxVideoLength: 600, // 10 minutes
    supportedAspectRatios: ["9:16"],
    recommendedAspectRatio: "9:16",
  },
  FACEBOOK_PAGE: {
    displayName: "Facebook Page",
    supportsImages: true,
    supportsVideos: true,
    supportsCarousels: true,
    supportsLinks: true,
    maxCaptionLength: 63206,
    maxImages: 10,
    maxVideoLength: 14400, // 4 hours
    supportedAspectRatios: ["1:1", "4:5", "16:9"],
    recommendedAspectRatio: "1:1",
  },
  LINKEDIN_PAGE: {
    displayName: "LinkedIn Page",
    supportsImages: true,
    supportsVideos: true,
    supportsCarousels: true,
    supportsLinks: true,
    supportsText: true,
    maxCaptionLength: 3000,
    maxHashtags: 30,
    maxImages: 20,
    maxVideoLength: 600,
    supportedAspectRatios: ["1:1", "4:5", "16:9", "1.91:1"],
    recommendedAspectRatio: "1.91:1",
  },
  X_TWEET: {
    displayName: "X (Tweet)",
    supportsImages: true,
    supportsVideos: true,
    supportsCarousels: true,
    supportsLinks: true,
    supportsText: true,
    maxCaptionLength: 280,
    maxHashtags: 10,
    maxImages: 4,
    maxVideoLength: 140,
    supportedAspectRatios: ["16:9", "1:1"],
    recommendedAspectRatio: "16:9",
  },
  YOUTUBE_VIDEO: {
    displayName: "YouTube Video",
    supportsVideos: true,
    supportsLinks: true,
    maxCaptionLength: 5000,
    maxHashtags: 15,
    maxVideoLength: 43200, // 12 hours
    supportedAspectRatios: ["16:9"],
    recommendedAspectRatio: "16:9",
  },
  YOUTUBE_SHORT: {
    displayName: "YouTube Short",
    supportsVideos: true,
    supportsReels: true,
    maxCaptionLength: 100,
    maxVideoLength: 60,
    supportedAspectRatios: ["9:16"],
    recommendedAspectRatio: "9:16",
  },
  THREADS: {
    displayName: "Threads",
    supportsImages: true,
    supportsVideos: true,
    supportsText: true,
    maxCaptionLength: 500,
    maxImages: 10,
    maxVideoLength: 300,
    supportedAspectRatios: ["1:1", "4:5"],
    recommendedAspectRatio: "1:1",
  },
};

/**
 * Creates a manual adapter for a given platform
 */
function createManualAdapter(platform: SocialPlatform): PlatformAdapter {
  const config = PLATFORM_CONFIGS[platform] || {};

  const capabilities: PlatformCapabilities = {
    platform,
    displayName: config.displayName || platform,
    supportsImages: config.supportsImages ?? true,
    supportsVideos: config.supportsVideos ?? true,
    supportsCarousels: config.supportsCarousels ?? false,
    supportsStories: config.supportsStories ?? false,
    supportsReels: config.supportsReels ?? false,
    supportsText: config.supportsText ?? false,
    supportsLinks: config.supportsLinks ?? false,
    supportsScheduling: false, // Manual = no scheduling
    maxCaptionLength: config.maxCaptionLength ?? 2000,
    maxHashtags: config.maxHashtags ?? 30,
    maxMentions: 50,
    maxImages: config.maxImages ?? 10,
    maxVideoLength: config.maxVideoLength ?? 300,
    maxFileSize: 100 * 1024 * 1024, // 100MB default
    supportedAspectRatios: config.supportedAspectRatios ?? ["1:1"],
    recommendedAspectRatio: config.recommendedAspectRatio ?? "1:1",
    requiresOAuth: false,
    oauthScopes: [],
  };

  return {
    platform,

    getCapabilities() {
      return capabilities;
    },

    async validate(request: PublishRequest): Promise<ValidationResult> {
      const errors: ValidationResult["errors"] = [];
      const warnings: ValidationResult["warnings"] = [];

      // Caption length
      if (request.caption.length > capabilities.maxCaptionLength) {
        errors.push({
          field: "caption",
          message: `Caption exceeds ${capabilities.maxCaptionLength} characters (${request.caption.length})`,
          code: "CAPTION_TOO_LONG",
        });
      }

      // Hashtag count
      if (request.hashtags.length > capabilities.maxHashtags) {
        warnings.push({
          field: "hashtags",
          message: `${request.hashtags.length} hashtags may be too many (max recommended: ${capabilities.maxHashtags})`,
        });
      }

      // Media presence
      if (!capabilities.supportsText && request.assets.length === 0) {
        errors.push({
          field: "assets",
          message: "This platform requires at least one image or video",
          code: "MEDIA_REQUIRED",
        });
      }

      // Carousel support
      if (request.assets.length > 1 && !capabilities.supportsCarousels) {
        errors.push({
          field: "assets",
          message: "This platform does not support multiple images/videos",
          code: "CAROUSEL_NOT_SUPPORTED",
        });
      }

      // Image count
      if (request.assets.length > capabilities.maxImages) {
        errors.push({
          field: "assets",
          message: `Too many media items (max: ${capabilities.maxImages})`,
          code: "TOO_MANY_ASSETS",
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    },

    async publish(_request: PublishRequest): Promise<PublishResult> {
      // Manual adapter doesn't actually publish
      // It returns a "pending manual" status
      return {
        success: true,
        platformPostId: `manual_${Date.now()}`,
        metadata: {
          manualPublishRequired: true,
          publishInstructions: `Please manually publish this content to ${capabilities.displayName}`,
        },
      };
    },

    async delete(): Promise<boolean> {
      // Manual deletion - just return true
      return true;
    },

    async getMetrics() {
      // No automatic metrics for manual adapter
      return {};
    },

    async testConnection(): Promise<boolean> {
      // Manual adapter always "connected"
      return true;
    },
  };
}

// Register manual adapters for all platforms
const PLATFORMS: SocialPlatform[] = [
  "INSTAGRAM_FEED",
  "INSTAGRAM_STORY",
  "INSTAGRAM_REEL",
  "FACEBOOK_PAGE",
  "FACEBOOK_STORY",
  "THREADS",
  "TIKTOK",
  "YOUTUBE_VIDEO",
  "YOUTUBE_SHORT",
  "LINKEDIN_PAGE",
  "LINKEDIN_PERSONAL",
  "LINKEDIN_ARTICLE",
  "X_TWEET",
  "X_THREAD",
  "WORDPRESS",
  "CUSTOM_CMS",
  "PINTEREST",
  "SNAPCHAT",
];

// Register all manual adapters
PLATFORMS.forEach((platform) => {
  registerAdapter(createManualAdapter(platform));
});

export { createManualAdapter };
