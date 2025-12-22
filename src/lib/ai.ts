/**
 * AI Service
 *
 * Unified AI integration for the platform using OpenAI.
 * Handles translation, content generation, and text enhancement.
 *
 * @module lib/ai
 */

import OpenAI from "openai";

// ============================================
// CLIENT CONFIGURATION
// ============================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Default model - GPT-4 Turbo for best quality
const DEFAULT_MODEL = "gpt-4-turbo-preview";
const FAST_MODEL = "gpt-3.5-turbo"; // For quick operations

// ============================================
// TYPES
// ============================================

export type AIAction =
  | "translate_ar"
  | "translate_en"
  | "polish"
  | "expand"
  | "summarize"
  | "simplify"
  | "formal"
  | "casual"
  | "generate_caption";

export interface AIOptions {
  action: AIAction;
  text: string;
  context?: string; // Additional context like brand voice, client info
  platform?: "instagram" | "twitter" | "linkedin" | "tiktok" | "facebook";
  maxLength?: number;
}

export interface AIResult {
  success: boolean;
  result?: string;
  error?: string;
  tokensUsed?: number;
}

// ============================================
// PROMPTS
// ============================================

const SYSTEM_PROMPTS: Record<AIAction, string> = {
  translate_ar: `You are a professional Arabic translator specializing in social media and marketing content.
Translate the following text to Arabic (Modern Standard Arabic with Gulf dialect influences appropriate for UAE audience).
Maintain the tone, style, and any hashtags/mentions. Format should be suitable for social media.
Do not add any explanations - return only the translated text.`,

  translate_en: `You are a professional English translator.
Translate the following text to English.
Maintain the tone, style, and any hashtags/mentions.
Do not add any explanations - return only the translated text.`,

  polish: `You are an expert editor and proofreader.
Fix any grammar, spelling, or punctuation errors.
Improve clarity and flow while maintaining the original meaning and tone.
Do not add any explanations - return only the polished text.`,

  expand: `You are a content writer.
Expand the following text with more detail, examples, or elaboration.
Maintain the original tone and style.
Keep the expanded version 2-3x longer than the original.
Do not add any explanations - return only the expanded text.`,

  summarize: `You are a concise writer.
Summarize the following text to its key points.
Maintain the most important information.
Keep the summary to about 1/3 of the original length.
Do not add any explanations - return only the summary.`,

  simplify: `You are a clear communicator.
Rewrite the following text using simpler language.
Avoid jargon and complex sentences.
Maintain the original meaning.
Do not add any explanations - return only the simplified text.`,

  formal: `You are a professional business writer.
Rewrite the following text in a more formal, professional tone.
Maintain the original meaning while elevating the language.
Do not add any explanations - return only the formal version.`,

  casual: `You are a conversational copywriter.
Rewrite the following text in a more casual, friendly tone.
Make it feel approachable and relatable.
Do not add any explanations - return only the casual version.`,

  generate_caption: `You are a social media expert for a Dubai-based creative agency.
Generate an engaging caption for the given topic/brief.
Include relevant hashtags (5-10 popular + niche tags).
Consider the platform's best practices.
Make it engaging with a hook, value, and call-to-action.
Do not add any explanations - return only the caption with hashtags.`,
};

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: "Keep it visual-focused, use line breaks, emojis allowed, hashtags at end.",
  twitter: "Be concise (280 chars), punchy, conversation-starting. Fewer hashtags (1-3).",
  linkedin: "Professional tone, thought leadership angle, minimal emojis, 1-3 hashtags.",
  tiktok: "Trendy, youthful, use trending sounds/challenges references if relevant.",
  facebook: "Conversational, shareable, can be longer form, questions work well.",
};

// ============================================
// MAIN FUNCTION
// ============================================

export async function executeAIAction(options: AIOptions): Promise<AIResult> {
  const { action, text, context, platform, maxLength } = options;

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: "No text provided",
    };
  }

  try {
    let systemPrompt = SYSTEM_PROMPTS[action];

    // Add platform-specific guidelines for caption generation
    if (action === "generate_caption" && platform) {
      systemPrompt += `\n\nPlatform: ${platform}\n${PLATFORM_GUIDELINES[platform]}`;
    }

    // Add character limit if specified
    if (maxLength) {
      systemPrompt += `\n\nMaximum length: ${maxLength} characters.`;
    }

    // Add context if provided
    if (context) {
      systemPrompt += `\n\nAdditional context: ${context}`;
    }

    // Use faster model for simple operations
    const useFastModel = ["polish", "translate_ar", "translate_en"].includes(action);

    const response = await openai.chat.completions.create({
      model: useFastModel ? FAST_MODEL : DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      max_tokens: maxLength ? Math.min(maxLength * 2, 4000) : 2000,
      temperature: action === "generate_caption" ? 0.8 : 0.3,
    });

    const result = response.choices[0]?.message?.content?.trim();

    if (!result) {
      return {
        success: false,
        error: "No response from AI",
      };
    }

    return {
      success: true,
      result,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error) {
    console.error("AI action error:", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return { success: false, error: "Invalid API key" };
      }
      if (error.status === 429) {
        return { success: false, error: "Rate limit exceeded. Please try again." };
      }
      if (error.status === 500) {
        return { success: false, error: "OpenAI service error. Please try again." };
      }
    }

    return {
      success: false,
      error: "Failed to process AI request",
    };
  }
}

// ============================================
// STREAMING VERSION (for longer content)
// ============================================

export async function* streamAIAction(options: AIOptions): AsyncGenerator<string, void, unknown> {
  const { action, text, context, platform, maxLength } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  let systemPrompt = SYSTEM_PROMPTS[action];

  if (action === "generate_caption" && platform) {
    systemPrompt += `\n\nPlatform: ${platform}\n${PLATFORM_GUIDELINES[platform]}`;
  }

  if (maxLength) {
    systemPrompt += `\n\nMaximum length: ${maxLength} characters.`;
  }

  if (context) {
    systemPrompt += `\n\nAdditional context: ${context}`;
  }

  const stream = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    max_tokens: maxLength ? Math.min(maxLength * 2, 4000) : 2000,
    temperature: action === "generate_caption" ? 0.8 : 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// ============================================
// BATCH TRANSLATION (for content engine)
// ============================================

export async function translateBatch(
  texts: string[],
  targetLanguage: "ar" | "en"
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const action: AIAction = targetLanguage === "ar" ? "translate_ar" : "translate_en";

  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map(async (text) => {
      const result = await executeAIAction({ action, text });
      if (result.success && result.result) {
        results.set(text, result.result);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// ============================================
// CAPTION GENERATOR (for content engine)
// ============================================

export interface CaptionGeneratorOptions {
  topic: string;
  client?: string;
  platform: "instagram" | "twitter" | "linkedin" | "tiktok" | "facebook";
  tone?: "professional" | "casual" | "playful" | "inspiring";
  includeEmojis?: boolean;
  includeCTA?: boolean;
  language?: "en" | "ar" | "both";
}

export async function generateCaption(options: CaptionGeneratorOptions): Promise<AIResult> {
  const {
    topic,
    client,
    platform,
    tone = "casual",
    includeEmojis = true,
    includeCTA = true,
    language = "en",
  } = options;

  let prompt = `Generate a ${platform} caption for: "${topic}"`;

  if (client) {
    prompt += `\nBrand/Client: ${client}`;
  }

  prompt += `\nTone: ${tone}`;
  prompt += `\nInclude emojis: ${includeEmojis ? "yes" : "no"}`;
  prompt += `\nInclude call-to-action: ${includeCTA ? "yes" : "no"}`;

  if (language === "both") {
    prompt += "\nProvide both English and Arabic versions, separated by ---";
  } else if (language === "ar") {
    prompt += "\nWrite in Arabic (Gulf dialect appropriate for UAE)";
  }

  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    linkedin: 3000,
    tiktok: 2200,
    facebook: 63206,
  };

  return executeAIAction({
    action: "generate_caption",
    text: prompt,
    platform,
    maxLength: platformLimits[platform],
  });
}
