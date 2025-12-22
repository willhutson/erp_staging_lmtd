import type { SocialPlatform } from "@prisma/client";

// ============================================
// PLATFORM GROUPINGS
// ============================================

export function getPlatformFamily(platform: SocialPlatform): string {
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

export function getPlatformDisplayName(platform: SocialPlatform): string {
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

export function getPlatformIcon(platform: SocialPlatform): string {
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

export function getPlatformColor(platform: SocialPlatform): string {
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
