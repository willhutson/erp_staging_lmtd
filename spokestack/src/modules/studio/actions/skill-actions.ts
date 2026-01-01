"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface StudioSkill {
  id: string;
  name: string;
  description: string;
  category: "copy" | "video" | "presentation" | "visual";
  systemPrompt: string;
  enabled: boolean;
  parameters?: {
    name: string;
    type: "text" | "select" | "number";
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }[];
}

// Available studio skills (internal, not exported directly)
const studioSkills: StudioSkill[] = [
  {
    id: "social-copy-writer",
    name: "Social Copy Writer",
    description: "Platform-specific social media copy with hashtags and CTAs",
    category: "copy",
    systemPrompt: `You are an expert social media copywriter. Create engaging, platform-optimized copy that:
- Uses appropriate hashtags (max 5-10 for Instagram, 1-2 for LinkedIn)
- Includes clear CTAs when appropriate
- Matches the brand voice and client context provided
- Stays within platform character limits
- Incorporates trending formats when relevant`,
    enabled: true,
    parameters: [
      { name: "platform", type: "select", required: true, options: ["Instagram", "LinkedIn", "TikTok", "Twitter/X", "Facebook"] },
      { name: "tone", type: "select", options: ["Professional", "Casual", "Playful", "Urgent", "Inspirational"] },
      { name: "includeEmojis", type: "select", options: ["Yes", "Minimal", "No"] },
    ],
  },
  {
    id: "ad-copy-writer",
    name: "Ad Copy Writer",
    description: "Advertising copy optimized for paid campaigns",
    category: "copy",
    systemPrompt: `You are an advertising copywriter specializing in paid campaigns. Create copy that:
- Has strong hooks that stop the scroll
- Clearly communicates value propositions
- Uses persuasive techniques (urgency, social proof, etc.)
- Includes multiple variations for A/B testing
- Follows platform ad copy best practices`,
    enabled: true,
    parameters: [
      { name: "format", type: "select", required: true, options: ["Headline", "Body Copy", "CTA", "Full Ad Set"] },
      { name: "objective", type: "select", options: ["Awareness", "Consideration", "Conversion"] },
      { name: "variations", type: "number", placeholder: "Number of variations (1-5)" },
    ],
  },
  {
    id: "arabic-localizer",
    name: "Arabic Localizer",
    description: "English to Arabic localization with cultural context",
    category: "copy",
    systemPrompt: `You are an expert Arabic localizer. Translate and adapt content that:
- Uses Modern Standard Arabic or specified dialect
- Adapts idioms and cultural references for Arabic audiences
- Maintains brand voice while being culturally appropriate
- Handles RTL formatting considerations
- Adjusts content length for Arabic expansion`,
    enabled: false,
    parameters: [
      { name: "dialect", type: "select", options: ["Modern Standard Arabic", "Gulf Arabic", "Egyptian Arabic", "Levantine Arabic"] },
      { name: "formality", type: "select", options: ["Formal", "Semi-formal", "Informal"] },
    ],
  },
  {
    id: "script-writer",
    name: "Script Writer",
    description: "Video scripts with timing and dialogue formatting",
    category: "video",
    systemPrompt: `You are a professional video script writer. Create scripts that:
- Include timing estimates for each section
- Clearly separate dialogue, action, and direction
- Match the specified video format and platform
- Include speaker notes and emphasis markers
- Consider pacing and viewer engagement`,
    enabled: true,
    parameters: [
      { name: "format", type: "select", required: true, options: ["Talking Head", "Voiceover", "Interview", "Narrative", "Tutorial"] },
      { name: "duration", type: "select", options: ["15 seconds", "30 seconds", "60 seconds", "2-3 minutes", "5+ minutes"] },
      { name: "platform", type: "select", options: ["Instagram Reels", "TikTok", "YouTube Shorts", "YouTube Long-form", "LinkedIn"] },
    ],
  },
  {
    id: "storyboard-describer",
    name: "Storyboard Describer",
    description: "Scene descriptions for storyboard frames",
    category: "video",
    systemPrompt: `You are a storyboard artist's assistant. Create frame descriptions that:
- Clearly describe visual composition
- Specify camera angles and movements
- Note lighting and mood
- Include action and character positioning
- Suggest transitions between frames`,
    enabled: true,
    parameters: [
      { name: "style", type: "select", options: ["Cinematic", "Documentary", "Commercial", "Social Media", "Animation"] },
      { name: "detailLevel", type: "select", options: ["High (full description)", "Medium (key elements)", "Low (overview)"] },
    ],
  },
  {
    id: "deck-outliner",
    name: "Deck Outliner",
    description: "Presentation structure and slide outlines",
    category: "presentation",
    systemPrompt: `You are a presentation strategist. Create deck outlines that:
- Follow effective storytelling structure
- Include suggested slide types for each section
- Provide key talking points per slide
- Consider audience and presentation context
- Suggest data visualization opportunities`,
    enabled: true,
    parameters: [
      { name: "purpose", type: "select", required: true, options: ["Pitch", "Proposal", "Case Study", "Internal Update", "Workshop"] },
      { name: "slideCount", type: "select", options: ["5-8 slides", "10-15 slides", "20+ slides"] },
      { name: "audienceType", type: "select", options: ["C-Suite", "Marketing Team", "Technical", "General"] },
    ],
  },
  {
    id: "slide-content-writer",
    name: "Slide Content Writer",
    description: "Individual slide content with bullet points and headlines",
    category: "presentation",
    systemPrompt: `You are a presentation content writer. Create slide content that:
- Uses concise, impactful headlines
- Keeps bullet points brief (7 words or less)
- Follows the 6x6 rule (max 6 bullets, 6 words each)
- Suggests speaker notes for context
- Includes potential visual elements`,
    enabled: true,
    parameters: [
      { name: "slideType", type: "select", required: true, options: ["Title", "Agenda", "Key Point", "Data/Stats", "Quote", "Team", "Timeline", "Comparison", "CTA"] },
      { name: "tone", type: "select", options: ["Professional", "Creative", "Technical", "Inspirational"] },
    ],
  },
  {
    id: "image-prompt-generator",
    name: "Image Prompt Generator",
    description: "AI image generation prompts from concepts",
    category: "visual",
    systemPrompt: `You are an AI image prompt engineer. Create prompts that:
- Use descriptive, specific language
- Include style, lighting, and composition details
- Specify aspect ratio and technical parameters
- Reference artistic styles when appropriate
- Avoid common prompt pitfalls`,
    enabled: false,
    parameters: [
      { name: "model", type: "select", required: true, options: ["Midjourney", "DALL-E", "Stable Diffusion", "Ideogram"] },
      { name: "style", type: "select", options: ["Photorealistic", "Illustration", "3D Render", "Abstract", "Minimalist"] },
      { name: "aspectRatio", type: "select", options: ["1:1", "16:9", "9:16", "4:3", "3:2"] },
    ],
  },
  {
    id: "moodboard-curator",
    name: "Moodboard Curator",
    description: "Visual direction suggestions from references",
    category: "visual",
    systemPrompt: `You are a creative director specializing in visual strategy. Analyze references and:
- Identify common themes and patterns
- Extract color palettes and suggest hex codes
- Note typography styles and recommendations
- Describe overall mood and aesthetic direction
- Suggest how to apply these learnings to new creative`,
    enabled: true,
    parameters: [
      { name: "outputType", type: "select", required: true, options: ["Color Palette", "Typography Guide", "Art Direction Brief", "Full Visual Strategy"] },
    ],
  },
];

/**
 * Execute a studio skill with the given prompt and context
 */
export async function executeSkill(input: {
  skillId: string;
  prompt: string;
  parameters?: Record<string, string>;
  moodboardId?: string;
  clientId?: string;
  briefId?: string;
}): Promise<{ result: string; usage?: { promptTokens: number; completionTokens: number } }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const skill = studioSkills.find((s) => s.id === input.skillId);
  if (!skill) throw new Error("Skill not found");
  if (!skill.enabled) throw new Error("Skill is disabled");

  // Build context from linked entities
  let context = "";

  if (input.clientId) {
    const client = await db.client.findUnique({
      where: { id: input.clientId },
      select: { name: true, notes: true, industry: true },
    });
    if (client) {
      context += `\nClient: ${client.name}\nIndustry: ${client.industry || "Not specified"}\n`;
      if (client.notes) context += `About: ${client.notes}\n`;
    }
  }

  if (input.briefId) {
    const brief = await db.brief.findUnique({
      where: { id: input.briefId },
      select: { title: true, type: true, formData: true },
    });
    if (brief) {
      context += `\nBrief: ${brief.title}\nType: ${brief.type}\n`;
    }
  }

  if (input.moodboardId) {
    const moodboard = await db.moodboard.findUnique({
      where: { id: input.moodboardId },
      select: { title: true, description: true, contextSummary: true },
    });
    if (moodboard) {
      context += `\nMoodboard: ${moodboard.title}\n`;
      if (moodboard.description) context += `Description: ${moodboard.description}\n`;
      if (moodboard.contextSummary) context += `Visual Context: ${moodboard.contextSummary}\n`;
    }
  }

  // Build parameters string
  const paramsString = input.parameters
    ? Object.entries(input.parameters)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  // Construct the full prompt
  const fullPrompt = `${skill.systemPrompt}

${context ? `## Context\n${context}` : ""}

${paramsString ? `## Parameters\n${paramsString}` : ""}

## User Request
${input.prompt}`;

  // TODO: Call AI API here
  // For now, return a placeholder response
  const result = `[AI Response Placeholder]

Based on your request: "${input.prompt}"

Using skill: ${skill.name}
${paramsString ? `With parameters:\n${paramsString}` : ""}

This is where the AI-generated content would appear. In production, this would call the OpenAI or Anthropic API with the constructed prompt.

Full prompt context includes:
- Skill system prompt
- Client/Brief/Moodboard context
- User parameters
- User request`;

  return {
    result,
    usage: {
      promptTokens: fullPrompt.split(/\s+/).length,
      completionTokens: result.split(/\s+/).length,
    },
  };
}

/**
 * Get available skills for the organization
 */
export async function getAvailableSkills(): Promise<StudioSkill[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // In the future, this could filter based on organization settings
  return studioSkills;
}

/**
 * Toggle skill enabled state (admin only)
 */
export async function toggleSkillEnabled(skillId: string): Promise<{ enabled: boolean }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // TODO: Check admin permission
  // TODO: Persist to database

  const skill = studioSkills.find((s) => s.id === skillId);
  if (!skill) throw new Error("Skill not found");

  // Toggle in-memory (would persist to DB in production)
  skill.enabled = !skill.enabled;

  return { enabled: skill.enabled };
}
