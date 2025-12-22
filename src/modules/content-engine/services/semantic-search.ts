"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateEmbedding, estimateTokens } from "./embedding-service";

// ============================================
// TYPES
// ============================================

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  pathPrefix?: string;
  documentTypes?: string[];
  includeContent?: boolean;
}

export interface SearchResult {
  documentId: string;
  chunkIndex: number;
  score: number;
  content: string;
  document: {
    id: string;
    title: string;
    path: string;
    documentType: string;
  };
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchTime: number;
  metadata: {
    embeddingModel: string;
    tokensUsed: number;
  };
}

// ============================================
// SIMILARITY SEARCH
// ============================================

/**
 * Perform semantic search across knowledge documents
 */
export async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const {
    limit = 10,
    minScore = 0.5,
    pathPrefix,
    documentTypes,
    includeContent = true,
  } = options;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  const tokensUsed = estimateTokens(query);

  // Build the where clause for filtering
  const whereClause: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  // Get all embeddings (in production, use pgvector or similar for efficient similarity search)
  const embeddings = await db.documentEmbedding.findMany({
    where: whereClause,
    include: {
      document: {
        select: {
          id: true,
          title: true,
          path: true,
          documentType: true,
          status: true,
        },
      },
    },
  });

  // Filter by document criteria
  const filtered = embeddings.filter((e) => {
    if (e.document.status !== "PUBLISHED") return false;
    if (pathPrefix && !e.document.path.startsWith(pathPrefix)) return false;
    if (documentTypes && !documentTypes.includes(e.document.documentType)) return false;
    return true;
  });

  // Calculate similarity scores
  const scored = filtered.map((embedding) => ({
    ...embedding,
    score: cosineSimilarity(queryEmbedding, embedding.embedding as number[]),
  }));

  // Filter by minimum score and sort by score
  const results = scored
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Format results
  const formattedResults: SearchResult[] = results.map((r) => ({
    documentId: r.documentId,
    chunkIndex: r.chunkIndex,
    score: r.score,
    content: includeContent ? r.chunkContent : "",
    document: {
      id: r.document.id,
      title: r.document.title,
      path: r.document.path,
      documentType: r.document.documentType,
    },
    highlight: generateHighlight(r.chunkContent, query),
  }));

  const searchTime = Date.now() - startTime;

  return {
    results: formattedResults,
    query,
    totalResults: results.length,
    searchTime,
    metadata: {
      embeddingModel: "text-embedding-3-small",
      tokensUsed,
    },
  };
}

/**
 * Find similar documents to a given document
 */
export async function findSimilarDocuments(
  documentId: string,
  options: Omit<SearchOptions, "pathPrefix"> = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { limit = 5, minScore = 0.7 } = options;

  // Get embeddings for the source document
  const sourceEmbeddings = await db.documentEmbedding.findMany({
    where: { documentId },
    orderBy: { chunkIndex: "asc" },
    take: 1, // Use first chunk as representative
  });

  if (sourceEmbeddings.length === 0) {
    throw new Error("Document has no embeddings");
  }

  const sourceEmbedding = sourceEmbeddings[0].embedding as number[];

  // Get all other embeddings
  const embeddings = await db.documentEmbedding.findMany({
    where: {
      organizationId: session.user.organizationId,
      documentId: { not: documentId },
      chunkIndex: 0, // Only compare first chunks
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          path: true,
          documentType: true,
          status: true,
        },
      },
    },
  });

  // Filter and score
  const scored = embeddings
    .filter((e) => e.document.status === "PUBLISHED")
    .map((embedding) => ({
      ...embedding,
      score: cosineSimilarity(sourceEmbedding, embedding.embedding as number[]),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const results: SearchResult[] = scored.map((r) => ({
    documentId: r.documentId,
    chunkIndex: r.chunkIndex,
    score: r.score,
    content: r.chunkContent,
    document: {
      id: r.document.id,
      title: r.document.title,
      path: r.document.path,
      documentType: r.document.documentType,
    },
  }));

  return {
    results,
    query: `Similar to document: ${documentId}`,
    totalResults: results.length,
    searchTime: Date.now() - startTime,
    metadata: {
      embeddingModel: "text-embedding-3-small",
      tokensUsed: 0,
    },
  };
}

/**
 * Get relevant context for a skill invocation
 */
export async function getRelevantContext(
  query: string,
  options: {
    skillSlug?: string;
    entityType?: string;
    maxTokens?: number;
    maxResults?: number;
  } = {}
): Promise<{
  documents: Array<{
    title: string;
    content: string;
    path: string;
    relevance: number;
  }>;
  totalTokens: number;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { maxTokens = 4000, maxResults = 5 } = options;

  // Search for relevant chunks
  const searchResults = await semanticSearch(query, {
    limit: maxResults * 2, // Get extra to account for deduplication
    minScore: 0.4,
  });

  // Deduplicate by document and select best chunks
  const documentChunks = new Map<
    string,
    { document: SearchResult["document"]; chunks: SearchResult[] }
  >();

  for (const result of searchResults.results) {
    const existing = documentChunks.get(result.documentId);
    if (existing) {
      existing.chunks.push(result);
    } else {
      documentChunks.set(result.documentId, {
        document: result.document,
        chunks: [result],
      });
    }
  }

  // Build context within token limit
  const documents: Array<{
    title: string;
    content: string;
    path: string;
    relevance: number;
  }> = [];
  let totalTokens = 0;

  for (const [, { document, chunks }] of documentChunks) {
    if (documents.length >= maxResults) break;

    // Sort chunks by score and combine
    const sortedChunks = chunks.sort((a, b) => b.score - a.score);
    const bestChunk = sortedChunks[0];

    // Combine top chunks from this document
    let combinedContent = "";
    let docTokens = 0;

    for (const chunk of sortedChunks.slice(0, 2)) {
      const chunkTokens = estimateTokens(chunk.content);
      if (totalTokens + docTokens + chunkTokens > maxTokens) break;
      combinedContent += (combinedContent ? "\n\n" : "") + chunk.content;
      docTokens += chunkTokens;
    }

    if (combinedContent) {
      documents.push({
        title: document.title,
        content: combinedContent,
        path: document.path,
        relevance: bestChunk.score,
      });
      totalTokens += docTokens;
    }
  }

  return { documents, totalTokens };
}

// ============================================
// HYBRID SEARCH (Keyword + Semantic)
// ============================================

/**
 * Hybrid search combining keyword and semantic search
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions & { keywordWeight?: number } = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const {
    limit = 10,
    minScore = 0.3,
    pathPrefix,
    documentTypes,
    keywordWeight = 0.3,
  } = options;

  const semanticWeight = 1 - keywordWeight;

  // Perform semantic search
  const semanticResults = await semanticSearch(query, {
    limit: limit * 2,
    minScore: 0,
    pathPrefix,
    documentTypes,
  });

  // Perform keyword search
  const keywordResults = await keywordSearch(query, {
    limit: limit * 2,
    pathPrefix,
    documentTypes,
  });

  // Combine and re-rank results
  const combinedScores = new Map<string, { result: SearchResult; score: number }>();

  // Add semantic results
  for (const result of semanticResults.results) {
    const key = `${result.documentId}-${result.chunkIndex}`;
    combinedScores.set(key, {
      result,
      score: result.score * semanticWeight,
    });
  }

  // Add/merge keyword results
  for (const result of keywordResults) {
    const key = `${result.documentId}-${result.chunkIndex}`;
    const existing = combinedScores.get(key);
    if (existing) {
      existing.score += result.score * keywordWeight;
    } else {
      combinedScores.set(key, {
        result,
        score: result.score * keywordWeight,
      });
    }
  }

  // Sort and filter
  const results = [...combinedScores.values()]
    .sort((a, b) => b.score - a.score)
    .filter((r) => r.score >= minScore)
    .slice(0, limit)
    .map((r) => ({ ...r.result, score: r.score }));

  return {
    results,
    query,
    totalResults: results.length,
    searchTime: Date.now() - startTime,
    metadata: {
      embeddingModel: "text-embedding-3-small (hybrid)",
      tokensUsed: semanticResults.metadata.tokensUsed,
    },
  };
}

/**
 * Simple keyword search using database full-text search
 */
async function keywordSearch(
  query: string,
  options: { limit?: number; pathPrefix?: string; documentTypes?: string[] }
): Promise<SearchResult[]> {
  const session = await auth();
  if (!session?.user) return [];

  const { limit = 10, pathPrefix, documentTypes } = options;
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  if (keywords.length === 0) return [];

  // Search in document embeddings (chunk content)
  const embeddings = await db.documentEmbedding.findMany({
    where: {
      organizationId: session.user.organizationId,
      chunkContent: {
        contains: keywords[0], // Simple contains for now
        mode: "insensitive",
      },
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          path: true,
          documentType: true,
          status: true,
        },
      },
    },
    take: limit * 3,
  });

  // Filter and score
  const results = embeddings
    .filter((e) => {
      if (e.document.status !== "PUBLISHED") return false;
      if (pathPrefix && !e.document.path.startsWith(pathPrefix)) return false;
      if (documentTypes && !documentTypes.includes(e.document.documentType)) return false;
      return true;
    })
    .map((e) => {
      // Calculate keyword match score
      const content = e.chunkContent.toLowerCase();
      const matchedKeywords = keywords.filter((k) => content.includes(k));
      const score = matchedKeywords.length / keywords.length;

      return {
        documentId: e.documentId,
        chunkIndex: e.chunkIndex,
        score,
        content: e.chunkContent,
        document: {
          id: e.document.id,
          title: e.document.title,
          path: e.document.path,
          documentType: e.document.documentType,
        },
        highlight: generateHighlight(e.chunkContent, query),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Generate a highlighted snippet showing query matches
 */
function generateHighlight(content: string, query: string): string {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return content.slice(0, 200);

  // Find the first occurrence of any query word
  const lowerContent = content.toLowerCase();
  let bestPosition = -1;

  for (const word of words) {
    const pos = lowerContent.indexOf(word);
    if (pos !== -1 && (bestPosition === -1 || pos < bestPosition)) {
      bestPosition = pos;
    }
  }

  if (bestPosition === -1) return content.slice(0, 200);

  // Extract a snippet around the match
  const snippetStart = Math.max(0, bestPosition - 50);
  const snippetEnd = Math.min(content.length, bestPosition + 150);
  let snippet = content.slice(snippetStart, snippetEnd);

  // Add ellipsis
  if (snippetStart > 0) snippet = "..." + snippet;
  if (snippetEnd < content.length) snippet = snippet + "...";

  return snippet;
}

// ============================================
// SEARCH SUGGESTIONS
// ============================================

/**
 * Get search suggestions based on document titles and common queries
 */
export async function getSearchSuggestions(
  prefix: string,
  limit: number = 5
): Promise<string[]> {
  const session = await auth();
  if (!session?.user) return [];

  if (prefix.length < 2) return [];

  // Search document titles
  const documents = await db.knowledgeDocument.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "PUBLISHED",
      title: {
        contains: prefix,
        mode: "insensitive",
      },
    },
    select: { title: true },
    take: limit,
  });

  return documents.map((d) => d.title);
}
