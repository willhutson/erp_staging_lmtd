/**
 * AI Server Actions
 *
 * Server-side actions for AI operations.
 * These are called from client components via the editor.
 *
 * @module modules/ai/actions
 */

"use server";

import { auth } from "@/lib/auth";
import {
  executeAIAction,
  generateCaption,
  translateBatch,
  type AIAction,
  type CaptionGeneratorOptions,
} from "@/lib/ai";
import { db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

export interface AIActionRequest {
  action: AIAction;
  text: string;
  context?: string;
  platform?: "instagram" | "twitter" | "linkedin" | "tiktok" | "facebook";
}

export interface AIActionResponse {
  success: boolean;
  result?: string;
  error?: string;
}

// ============================================
// ACTIONS
// ============================================

/**
 * Execute an AI action on text content
 */
export async function performAIAction(request: AIActionRequest): Promise<AIActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Log AI usage for analytics
  try {
    await db.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "AI_ACTION",
        entityType: "AI",
        entityId: request.action,
        metadata: {
          action: request.action,
          textLength: request.text.length,
          platform: request.platform,
        },
      },
    });
  } catch {
    // Don't fail if audit logging fails
  }

  const result = await executeAIAction({
    action: request.action,
    text: request.text,
    context: request.context,
    platform: request.platform,
  });

  return {
    success: result.success,
    result: result.result,
    error: result.error,
  };
}

/**
 * Translate text to Arabic
 */
export async function translateToArabic(text: string): Promise<AIActionResponse> {
  return performAIAction({
    action: "translate_ar",
    text,
  });
}

/**
 * Translate text to English
 */
export async function translateToEnglish(text: string): Promise<AIActionResponse> {
  return performAIAction({
    action: "translate_en",
    text,
  });
}

/**
 * Polish and fix grammar
 */
export async function polishText(text: string): Promise<AIActionResponse> {
  return performAIAction({
    action: "polish",
    text,
  });
}

/**
 * Generate a social media caption
 */
export async function generateSocialCaption(
  options: Omit<CaptionGeneratorOptions, "language">
): Promise<AIActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await generateCaption({
    ...options,
    language: "en",
  });

  return {
    success: result.success,
    result: result.result,
    error: result.error,
  };
}

/**
 * Generate bilingual caption (English + Arabic)
 */
export async function generateBilingualCaption(
  options: Omit<CaptionGeneratorOptions, "language">
): Promise<{
  success: boolean;
  english?: string;
  arabic?: string;
  error?: string;
}> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Generate English first
  const englishResult = await generateCaption({
    ...options,
    language: "en",
  });

  if (!englishResult.success || !englishResult.result) {
    return { success: false, error: englishResult.error };
  }

  // Translate to Arabic
  const arabicResult = await executeAIAction({
    action: "translate_ar",
    text: englishResult.result,
    platform: options.platform,
  });

  return {
    success: true,
    english: englishResult.result,
    arabic: arabicResult.result,
  };
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
  texts: string[],
  targetLanguage: "ar" | "en"
): Promise<{
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
}> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const translationMap = await translateBatch(texts, targetLanguage);
    const translations: Record<string, string> = {};
    translationMap.forEach((value, key) => {
      translations[key] = value;
    });

    return { success: true, translations };
  } catch (error) {
    console.error("Batch translation error:", error);
    return { success: false, error: "Translation failed" };
  }
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<{
  language: "ar" | "en" | "mixed" | "unknown";
}> {
  // Simple Arabic detection based on character ranges
  const arabicPattern = /[\u0600-\u06FF]/;
  const latinPattern = /[a-zA-Z]/;

  const hasArabic = arabicPattern.test(text);
  const hasLatin = latinPattern.test(text);

  if (hasArabic && hasLatin) {
    return { language: "mixed" };
  }
  if (hasArabic) {
    return { language: "ar" };
  }
  if (hasLatin) {
    return { language: "en" };
  }
  return { language: "unknown" };
}
