/**
 * Voice Note Transcription Service
 *
 * Supports multiple transcription providers:
 * - OpenAI Whisper (default)
 * - Google Cloud Speech-to-Text
 * - Azure Speech Services
 *
 * Key features:
 * - Arabic and English support
 * - Automatic language detection
 * - Cost tracking
 */

import { db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

export type TranscriptionProvider = "openai_whisper" | "google_stt" | "azure_stt";

export interface TranscriptionResult {
  transcription: string;
  language: string | null;
  confidence: number | null;
  durationMs: number;
  cost: number | null;
}

export interface TranscriptionConfig {
  provider: TranscriptionProvider;
  apiKey?: string;
  endpoint?: string;
  defaultLanguage?: string;
}

// ============================================
// PROVIDER IMPLEMENTATIONS
// ============================================

/**
 * Transcribe using OpenAI Whisper API
 */
async function transcribeWithWhisper(
  audioUrl: string,
  config: TranscriptionConfig
): Promise<TranscriptionResult> {
  const startTime = Date.now();

  // Download the audio file
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
  }

  const audioBlob = await audioResponse.blob();

  // Prepare form data for Whisper API
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.ogg");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");

  // If language hint provided, use it
  if (config.defaultLanguage) {
    formData.append("language", config.defaultLanguage);
  }

  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const result = await response.json();
  const durationMs = Date.now() - startTime;

  // Whisper pricing: $0.006 per minute
  const audioDurationMinutes = (result.duration ?? 0) / 60;
  const cost = audioDurationMinutes * 0.006;

  return {
    transcription: result.text,
    language: result.language ?? null,
    confidence: null, // Whisper doesn't provide confidence scores
    durationMs,
    cost,
  };
}

/**
 * Transcribe using Google Cloud Speech-to-Text
 * Placeholder - would use @google-cloud/speech
 */
async function transcribeWithGoogle(
  _audioUrl: string,
  _config: TranscriptionConfig
): Promise<TranscriptionResult> {
  // This would use the Google Cloud Speech-to-Text API
  // For now, return a placeholder
  throw new Error("Google Speech-to-Text not yet implemented");
}

/**
 * Transcribe using Azure Speech Services
 * Placeholder - would use @azure/cognitiveservices-speech-sdk
 */
async function transcribeWithAzure(
  _audioUrl: string,
  _config: TranscriptionConfig
): Promise<TranscriptionResult> {
  // This would use the Azure Speech Services SDK
  // For now, return a placeholder
  throw new Error("Azure Speech Services not yet implemented");
}

// ============================================
// MAIN SERVICE
// ============================================

const defaultConfig: TranscriptionConfig = {
  provider: "openai_whisper",
};

/**
 * Transcribe a voice note
 */
export async function transcribeVoiceNote(
  messageId: string,
  config: TranscriptionConfig = defaultConfig
): Promise<TranscriptionResult> {
  // Get the message
  const message = await db.whatsAppMessage.findUnique({
    where: { id: messageId },
    include: { transcription: true },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.messageType !== "VOICE_NOTE") {
    throw new Error("Message is not a voice note");
  }

  if (!message.mediaUrl) {
    throw new Error("Voice note has no media URL");
  }

  // Check if already transcribed
  if (message.transcription) {
    return {
      transcription: message.transcription.transcription,
      language: message.transcription.language,
      confidence: message.transcription.confidence ? Number(message.transcription.confidence) : null,
      durationMs: message.transcription.durationMs ?? 0,
      cost: message.transcription.cost ? Number(message.transcription.cost) : null,
    };
  }

  // Transcribe based on provider
  let result: TranscriptionResult;

  switch (config.provider) {
    case "openai_whisper":
      result = await transcribeWithWhisper(message.mediaUrl, config);
      break;
    case "google_stt":
      result = await transcribeWithGoogle(message.mediaUrl, config);
      break;
    case "azure_stt":
      result = await transcribeWithAzure(message.mediaUrl, config);
      break;
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  // Save transcription to database
  await db.voiceNoteTranscription.create({
    data: {
      messageId,
      transcription: result.transcription,
      language: result.language,
      confidence: result.confidence,
      provider: config.provider,
      durationMs: result.durationMs,
      cost: result.cost,
    },
  });

  return result;
}

/**
 * Batch transcribe all pending voice notes
 */
export async function transcribePendingVoiceNotes(
  organizationId: string,
  config: TranscriptionConfig = defaultConfig,
  limit: number = 10
): Promise<{ processed: number; errors: string[] }> {
  // Find voice notes without transcriptions
  const pendingMessages = await db.whatsAppMessage.findMany({
    where: {
      organizationId,
      messageType: "VOICE_NOTE",
      mediaUrl: { not: null },
      transcription: null,
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const errors: string[] = [];
  let processed = 0;

  for (const message of pendingMessages) {
    try {
      await transcribeVoiceNote(message.id, config);
      processed++;
    } catch (error) {
      errors.push(`Message ${message.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { processed, errors };
}

/**
 * Correct a transcription manually
 */
export async function correctTranscription(
  transcriptionId: string,
  correctedText: string,
  userId: string
): Promise<void> {
  await db.voiceNoteTranscription.update({
    where: { id: transcriptionId },
    data: {
      correctedText,
      correctedById: userId,
      correctedAt: new Date(),
    },
  });
}

/**
 * Get transcription statistics
 */
export async function getTranscriptionStats(organizationId: string) {
  const [total, byLanguage, totalCost] = await Promise.all([
    db.voiceNoteTranscription.count({
      where: {
        message: { organizationId },
      },
    }),
    db.voiceNoteTranscription.groupBy({
      by: ["language"],
      where: {
        message: { organizationId },
      },
      _count: true,
    }),
    db.voiceNoteTranscription.aggregate({
      where: {
        message: { organizationId },
      },
      _sum: { cost: true },
    }),
  ]);

  return {
    totalTranscriptions: total,
    byLanguage: Object.fromEntries(
      byLanguage.map((l: { language: string | null; _count: number }) => [l.language ?? "unknown", l._count])
    ),
    totalCost: Number(totalCost._sum.cost ?? 0),
  };
}
