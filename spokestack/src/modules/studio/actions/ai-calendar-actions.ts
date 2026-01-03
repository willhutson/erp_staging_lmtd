"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import OpenAI from "openai";
import type { SocialContentType, CalendarEntryStatus } from "@prisma/client";
import type { CreateCalendarEntryInput } from "../types";
import { createCalendarEntry } from "./calendar-actions";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

// ============================================
// TYPES
// ============================================

export interface AICalendarGeneratorInput {
  clientId: string;
  clientName: string;
  month: Date; // First day of target month
  moodTheme: string; // Text description of mood/aesthetic
  goals: string; // Corporate goals, talking points, key messages
  holidays: string[]; // Selected holidays/events to incorporate
  customEvents?: string; // Additional custom events
  cadence: PlatformCadence;
  isPitchMode: boolean; // Sample content for RFP demo
  referenceNotes?: string; // Notes about past successful posts
}

export interface PlatformCadence {
  instagram: { postsPerWeek: number; contentMix: ContentMixItem[] };
  facebook: { postsPerWeek: number; contentMix: ContentMixItem[] };
  linkedin: { postsPerWeek: number; contentMix: ContentMixItem[] };
  twitter: { postsPerWeek: number; contentMix: ContentMixItem[] };
  tiktok: { postsPerWeek: number; contentMix: ContentMixItem[] };
}

export interface ContentMixItem {
  type: SocialContentType;
  percentage: number;
}

export interface GeneratedCalendarEntry {
  title: string;
  description: string;
  contentType: SocialContentType;
  scheduledDate: string; // ISO date
  scheduledTime: string;
  platforms: string[];
  color: string;
  aiSuggestion: string; // Hook/caption idea
}

export interface AICalendarGeneratorResult {
  success: boolean;
  entries?: GeneratedCalendarEntry[];
  error?: string;
  tokensUsed?: number;
}

// ============================================
// UAE & INTERNATIONAL HOLIDAYS 2025
// ============================================

export const UAE_HOLIDAYS_2025 = [
  { date: "2025-01-01", name: "New Year's Day", type: "international" },
  { date: "2025-01-29", name: "Ramadan Start (approx)", type: "islamic" },
  { date: "2025-02-14", name: "Valentine's Day", type: "international" },
  { date: "2025-03-08", name: "International Women's Day", type: "international" },
  { date: "2025-03-21", name: "Mother's Day (UAE)", type: "uae" },
  { date: "2025-03-30", name: "Eid Al Fitr (approx)", type: "islamic" },
  { date: "2025-04-22", name: "Earth Day", type: "international" },
  { date: "2025-05-01", name: "Labour Day", type: "international" },
  { date: "2025-06-06", name: "Eid Al Adha (approx)", type: "islamic" },
  { date: "2025-06-15", name: "Father's Day", type: "international" },
  { date: "2025-06-27", name: "Islamic New Year (approx)", type: "islamic" },
  { date: "2025-07-30", name: "Commemoration Day", type: "uae" },
  { date: "2025-09-05", name: "Prophet's Birthday (approx)", type: "islamic" },
  { date: "2025-10-31", name: "Halloween", type: "international" },
  { date: "2025-11-28", name: "UAE Flag Day", type: "uae" },
  { date: "2025-12-02", name: "UAE National Day", type: "uae" },
  { date: "2025-12-25", name: "Christmas", type: "international" },
  { date: "2025-12-31", name: "New Year's Eve", type: "international" },
];

// Social media awareness days
export const SOCIAL_AWARENESS_DAYS = [
  { date: "2025-01-21", name: "National Hugging Day", type: "social" },
  { date: "2025-02-04", name: "World Cancer Day", type: "social" },
  { date: "2025-02-13", name: "World Radio Day", type: "social" },
  { date: "2025-03-20", name: "World Happiness Day", type: "social" },
  { date: "2025-04-07", name: "World Health Day", type: "social" },
  { date: "2025-05-04", name: "Star Wars Day", type: "social" },
  { date: "2025-05-17", name: "World Telecommunication Day", type: "social" },
  { date: "2025-06-05", name: "World Environment Day", type: "social" },
  { date: "2025-06-21", name: "International Yoga Day", type: "social" },
  { date: "2025-07-17", name: "World Emoji Day", type: "social" },
  { date: "2025-08-19", name: "World Photography Day", type: "social" },
  { date: "2025-09-21", name: "International Day of Peace", type: "social" },
  { date: "2025-10-10", name: "World Mental Health Day", type: "social" },
  { date: "2025-11-13", name: "World Kindness Day", type: "social" },
];

export async function getHolidaysForMonth(month: Date): Promise<Array<{ date: string; name: string; type: string }>> {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const allHolidays = [...UAE_HOLIDAYS_2025, ...SOCIAL_AWARENESS_DAYS];

  return allHolidays.filter(h => {
    const holidayDate = new Date(h.date);
    return holidayDate >= monthStart && holidayDate <= monthEnd;
  });
}

// ============================================
// OPENAI CLIENT
// ============================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// ============================================
// CONTENT TYPE COLORS
// ============================================

const CONTENT_TYPE_COLORS: Record<SocialContentType, string> = {
  POST: "#3B82F6",      // Blue
  CAROUSEL: "#8B5CF6",  // Purple
  REEL: "#EC4899",      // Pink
  STORY: "#F59E0B",     // Amber
  LIVE: "#EF4444",      // Red
  ARTICLE: "#10B981",   // Emerald
  THREAD: "#6366F1",    // Indigo
  AD: "#F97316",        // Orange
};

// ============================================
// OPTIMAL POSTING TIMES BY PLATFORM
// ============================================

const OPTIMAL_TIMES: Record<string, string[]> = {
  instagram: ["09:00", "12:00", "17:00", "20:00"],
  facebook: ["09:00", "13:00", "16:00", "19:00"],
  linkedin: ["07:30", "10:00", "12:00", "17:30"],
  twitter: ["08:00", "12:00", "17:00", "21:00"],
  tiktok: ["07:00", "10:00", "19:00", "22:00"],
};

// ============================================
// AI GENERATION
// ============================================

export async function generateAICalendar(
  input: AICalendarGeneratorInput
): Promise<AICalendarGeneratorResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: "OpenAI API key not configured" };
  }

  try {
    const monthStart = startOfMonth(input.month);
    const monthEnd = endOfMonth(input.month);
    const monthName = format(monthStart, "MMMM yyyy");

    // Build platform requirements
    const platformReqs = Object.entries(input.cadence)
      .filter(([_, config]) => config.postsPerWeek > 0)
      .map(([platform, config]) => {
        const mixDesc = config.contentMix
          .filter((m: ContentMixItem) => m.percentage > 0)
          .map((m: ContentMixItem) => `${m.percentage}% ${m.type}`)
          .join(", ");
        return `- ${platform}: ${config.postsPerWeek} posts/week (${mixDesc || "any format"})`;
      })
      .join("\n");

    // Build holidays context
    const holidaysContext = input.holidays.length > 0
      ? `\nKey dates to incorporate:\n${input.holidays.map(h => `- ${h}`).join("\n")}`
      : "";

    const customEventsContext = input.customEvents
      ? `\nCustom events/campaigns:\n${input.customEvents}`
      : "";

    // Pitch mode adjustments
    const pitchModeContext = input.isPitchMode
      ? `\nIMPORTANT: This is a SAMPLE CALENDAR FOR A PITCH/RFP.
      - Create compelling, showcase-quality content ideas
      - Demonstrate strategic thinking and creativity
      - Show variety and platform expertise
      - Include trendy formats and engagement tactics
      - Make it impressive enough to win the business`
      : "";

    const prompt = `You are a social media strategist for a Dubai-based creative agency (TeamLMTD).
Generate a content calendar for ${monthName} for client: ${input.clientName}

BRAND MOOD/THEME:
${input.moodTheme}

GOALS & KEY MESSAGES:
${input.goals}
${holidaysContext}
${customEventsContext}

PLATFORM REQUIREMENTS:
${platformReqs}

REFERENCE (what worked before):
${input.referenceNotes || "No specific references provided"}
${pitchModeContext}

Generate calendar entries as a JSON array. Each entry should have:
- title: Short, catchy title (max 60 chars)
- description: Brief content description (2-3 sentences about the post concept)
- contentType: One of POST, CAROUSEL, REEL, STORY, LIVE, ARTICLE, THREAD, AD
- scheduledDate: ISO date string within ${monthName}
- scheduledTime: Optimal posting time (HH:MM format)
- platforms: Array of platforms for this post
- aiSuggestion: Creative hook or caption starter idea

Guidelines:
- Spread posts evenly across the month (avoid clustering)
- Match content types to platforms (Reels for Instagram/TikTok, Articles for LinkedIn, etc.)
- Time posts optimally for UAE audience (GST timezone)
- Weekend posts can be more casual/lifestyle focused
- Create a good mix of promotional, educational, and engagement content
- For holidays, plan content 1-2 days before for anticipation posts

Return ONLY the JSON array, no additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert social media strategist. Return only valid JSON arrays.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const resultText = response.choices[0]?.message?.content?.trim();

    if (!resultText) {
      return { success: false, error: "No response from AI" };
    }

    // Parse the response
    let parsedResult: { entries?: GeneratedCalendarEntry[] };
    try {
      parsedResult = JSON.parse(resultText);
    } catch {
      // Try to extract array from response
      const arrayMatch = resultText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        parsedResult = { entries: JSON.parse(arrayMatch[0]) };
      } else {
        return { success: false, error: "Failed to parse AI response" };
      }
    }

    const entries = parsedResult.entries || (Array.isArray(parsedResult) ? parsedResult : []);

    // Validate and enrich entries
    const validEntries: GeneratedCalendarEntry[] = entries
      .filter((entry: GeneratedCalendarEntry) => {
        const entryDate = new Date(entry.scheduledDate);
        return entryDate >= monthStart && entryDate <= monthEnd;
      })
      .map((entry: GeneratedCalendarEntry) => ({
        ...entry,
        color: CONTENT_TYPE_COLORS[entry.contentType] || "#52EDC7",
        scheduledTime: entry.scheduledTime || "10:00",
      }));

    return {
      success: true,
      entries: validEntries,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error) {
    console.error("AI Calendar generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate calendar",
    };
  }
}

// ============================================
// SAVE GENERATED ENTRIES
// ============================================

export async function saveGeneratedCalendarEntries(
  entries: GeneratedCalendarEntry[],
  clientId: string
): Promise<{ success: boolean; savedCount: number; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, savedCount: 0, error: "Unauthorized" };
  }

  try {
    let savedCount = 0;

    for (const entry of entries) {
      const input: CreateCalendarEntryInput = {
        title: entry.title,
        description: `${entry.description}\n\n---\nAI Suggestion: ${entry.aiSuggestion}`,
        contentType: entry.contentType,
        scheduledDate: new Date(entry.scheduledDate),
        scheduledTime: entry.scheduledTime,
        platforms: entry.platforms,
        clientId,
        color: entry.color,
      };

      await createCalendarEntry(input);
      savedCount++;
    }

    return { success: true, savedCount };
  } catch (error) {
    console.error("Error saving calendar entries:", error);
    return {
      success: false,
      savedCount: 0,
      error: error instanceof Error ? error.message : "Failed to save entries",
    };
  }
}
