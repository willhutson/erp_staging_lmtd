"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ============================================
// TYPES
// ============================================

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  provider: "openai" | "cohere" | "local";
}

export interface EmbeddingResult {
  id: string;
  embedding: number[];
  metadata: {
    model: string;
    dimensions: number;
    tokensUsed: number;
    createdAt: Date;
  };
}

export interface ChunkConfig {
  maxTokens: number;
  overlap: number;
  strategy: "paragraph" | "sentence" | "fixed";
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  tokens: number;
  metadata: Record<string, unknown>;
}

// Default configuration
const DEFAULT_CONFIG: EmbeddingConfig = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  provider: "openai",
};

const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  maxTokens: 512,
  overlap: 50,
  strategy: "paragraph",
};

// ============================================
// EMBEDDING GENERATION
// ============================================

/**
 * Generate embeddings for text content
 *
 * NOTE: This is a placeholder implementation.
 * In production, this would call OpenAI, Cohere, or another embedding API.
 */
export async function generateEmbedding(
  text: string,
  config: Partial<EmbeddingConfig> = {}
): Promise<number[]> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Placeholder: Return a deterministic mock embedding based on text hash
  // In production, this would call the actual embedding API
  const embedding = generateMockEmbedding(text, fullConfig.dimensions);

  return embedding;
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(
  texts: string[],
  config: Partial<EmbeddingConfig> = {}
): Promise<number[][]> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Process in parallel (up to a limit)
  const batchSize = 100;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await Promise.all(
      batch.map((text) => generateEmbedding(text, fullConfig))
    );
    results.push(...embeddings);
  }

  return results;
}

/**
 * Generate a deterministic mock embedding for testing
 */
function generateMockEmbedding(text: string, dimensions: number): number[] {
  // Create a deterministic seed from the text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
  }

  // Generate pseudo-random but deterministic values
  const embedding: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    // Normalize to [-1, 1] range like real embeddings
    embedding.push((seed / 0x7fffffff) * 2 - 1);
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
}

// ============================================
// TEXT CHUNKING
// ============================================

/**
 * Split document content into chunks for embedding
 */
export async function chunkDocument(
  content: string,
  config: Partial<ChunkConfig> = {}
): Promise<DocumentChunk[]> {
  const fullConfig = { ...DEFAULT_CHUNK_CONFIG, ...config };

  switch (fullConfig.strategy) {
    case "paragraph":
      return chunkByParagraph(content, fullConfig);
    case "sentence":
      return chunkBySentence(content, fullConfig);
    case "fixed":
    default:
      return chunkByFixedSize(content, fullConfig);
  }
}

function chunkByParagraph(content: string, config: ChunkConfig): DocumentChunk[] {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
  const chunks: DocumentChunk[] = [];
  let currentChunk = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // If single paragraph exceeds max, split it further
    if (paragraphTokens > config.maxTokens) {
      if (currentChunk) {
        chunks.push(createChunk(currentChunk, chunks.length, currentTokens));
        currentChunk = "";
        currentTokens = 0;
      }
      // Split large paragraph into sentences
      const subChunks = chunkBySentence(paragraph, config);
      chunks.push(...subChunks.map((c, i) => ({ ...c, index: chunks.length + i })));
      continue;
    }

    // If adding would exceed max, start new chunk
    if (currentTokens + paragraphTokens > config.maxTokens && currentChunk) {
      chunks.push(createChunk(currentChunk, chunks.length, currentTokens));
      // Include overlap from previous chunk
      const overlapText = getOverlapText(currentChunk, config.overlap);
      currentChunk = overlapText ? overlapText + "\n\n" + paragraph : paragraph;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + paragraph : paragraph;
      currentTokens += paragraphTokens;
    }
  }

  // Add remaining chunk
  if (currentChunk) {
    chunks.push(createChunk(currentChunk, chunks.length, currentTokens));
  }

  return chunks;
}

function chunkBySentence(content: string, config: ChunkConfig): DocumentChunk[] {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const chunks: DocumentChunk[] = [];
  let currentChunk = "";
  let currentTokens = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    const sentenceTokens = estimateTokens(trimmedSentence);

    if (currentTokens + sentenceTokens > config.maxTokens && currentChunk) {
      chunks.push(createChunk(currentChunk, chunks.length, currentTokens));
      const overlapText = getOverlapText(currentChunk, config.overlap);
      currentChunk = overlapText ? overlapText + " " + trimmedSentence : trimmedSentence;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk = currentChunk ? currentChunk + " " + trimmedSentence : trimmedSentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk) {
    chunks.push(createChunk(currentChunk, chunks.length, currentTokens));
  }

  return chunks;
}

function chunkByFixedSize(content: string, config: ChunkConfig): DocumentChunk[] {
  const words = content.split(/\s+/);
  const chunks: DocumentChunk[] = [];
  const wordsPerChunk = Math.floor(config.maxTokens * 0.75); // Approximate words from tokens

  for (let i = 0; i < words.length; i += wordsPerChunk - Math.floor(config.overlap * 0.75)) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const chunkContent = chunkWords.join(" ");
    const tokens = estimateTokens(chunkContent);
    chunks.push(createChunk(chunkContent, chunks.length, tokens));
  }

  return chunks;
}

function createChunk(content: string, index: number, tokens: number): DocumentChunk {
  return {
    id: `chunk-${index}`,
    documentId: "",
    content,
    index,
    tokens,
    metadata: {},
  };
}

function getOverlapText(text: string, overlapTokens: number): string {
  const words = text.split(/\s+/);
  const overlapWords = Math.floor(overlapTokens * 0.75);
  return words.slice(-overlapWords).join(" ");
}

/**
 * Estimate token count for text (rough approximation)
 * ~4 characters per token for English text
 */
export async function estimateTokens(text: string): Promise<number> {
  return Math.ceil(text.length / 4);
}

// ============================================
// DOCUMENT EMBEDDING
// ============================================

/**
 * Create embeddings for a knowledge document
 */
export async function embedDocument(
  documentId: string,
  options?: {
    chunkConfig?: Partial<ChunkConfig>;
    embeddingConfig?: Partial<EmbeddingConfig>;
  }
): Promise<{ chunks: number; tokensUsed: number }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Load the document
  const document = await db.knowledgeDocument.findUnique({
    where: { id: documentId },
  });

  if (!document || document.organizationId !== session.user.organizationId) {
    throw new Error("Document not found");
  }

  // Chunk the content
  const chunks = chunkDocument(document.content, options?.chunkConfig);

  // Generate embeddings
  const embeddings = await generateEmbeddings(
    chunks.map((c) => c.content),
    options?.embeddingConfig
  );

  // Store embeddings
  const config = { ...DEFAULT_CONFIG, ...options?.embeddingConfig };

  // Delete existing embeddings for this document
  await db.documentEmbedding.deleteMany({
    where: { documentId },
  });

  // Store new embeddings
  await db.documentEmbedding.createMany({
    data: chunks.map((chunk, i) => ({
      organizationId: session.user.organizationId,
      documentId,
      chunkIndex: chunk.index,
      chunkContent: chunk.content,
      embedding: embeddings[i],
      tokens: chunk.tokens,
      model: config.model,
      dimensions: config.dimensions,
    })),
  });

  // Update document metadata
  await db.knowledgeDocument.update({
    where: { id: documentId },
    data: {
      metadata: {
        ...(document.metadata as object || {}),
        embedding: {
          model: config.model,
          dimensions: config.dimensions,
          chunks: chunks.length,
          totalTokens: chunks.reduce((sum, c) => sum + c.tokens, 0),
          embeddedAt: new Date().toISOString(),
        },
      },
    },
  });

  return {
    chunks: chunks.length,
    tokensUsed: chunks.reduce((sum, c) => sum + c.tokens, 0),
  };
}

/**
 * Embed all documents in a path prefix
 */
export async function embedDocumentsByPath(
  pathPrefix: string,
  options?: {
    chunkConfig?: Partial<ChunkConfig>;
    embeddingConfig?: Partial<EmbeddingConfig>;
    limit?: number;
  }
): Promise<{ documentsProcessed: number; totalChunks: number; totalTokens: number }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const documents = await db.knowledgeDocument.findMany({
    where: {
      organizationId: session.user.organizationId,
      path: { startsWith: pathPrefix },
      status: "PUBLISHED",
    },
    take: options?.limit ?? 100,
  });

  let totalChunks = 0;
  let totalTokens = 0;

  for (const doc of documents) {
    try {
      const result = await embedDocument(doc.id, options);
      totalChunks += result.chunks;
      totalTokens += result.tokensUsed;
    } catch (error) {
      console.error(`Failed to embed document ${doc.id}:`, error);
    }
  }

  return {
    documentsProcessed: documents.length,
    totalChunks,
    totalTokens,
  };
}

// ============================================
// EMBEDDING QUERIES
// ============================================

/**
 * Get embedding status for a document
 */
export async function getEmbeddingStatus(documentId: string): Promise<{
  hasEmbeddings: boolean;
  chunks: number;
  model: string | null;
  embeddedAt: Date | null;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const embeddings = await db.documentEmbedding.findMany({
    where: { documentId },
    select: { model: true, createdAt: true },
  });

  if (embeddings.length === 0) {
    return {
      hasEmbeddings: false,
      chunks: 0,
      model: null,
      embeddedAt: null,
    };
  }

  return {
    hasEmbeddings: true,
    chunks: embeddings.length,
    model: embeddings[0].model,
    embeddedAt: embeddings[0].createdAt,
  };
}

/**
 * Get embedding statistics for organization
 */
export async function getEmbeddingStats(): Promise<{
  totalDocuments: number;
  embeddedDocuments: number;
  totalChunks: number;
  models: string[];
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const organizationId = session.user.organizationId;

  const [totalDocs, embeddingStats] = await Promise.all([
    db.knowledgeDocument.count({
      where: { organizationId, status: "PUBLISHED" },
    }),
    db.documentEmbedding.groupBy({
      by: ["documentId", "model"],
      where: { organizationId },
      _count: true,
    }),
  ]);

  const uniqueDocs = new Set(embeddingStats.map((e) => e.documentId));
  const models = [...new Set(embeddingStats.map((e) => e.model))];

  return {
    totalDocuments: totalDocs,
    embeddedDocuments: uniqueDocs.size,
    totalChunks: embeddingStats.reduce((sum, e) => sum + e._count, 0),
    models,
  };
}
