/**
 * Content Engine Services
 *
 * Phase 12.2 - Agent Infrastructure
 * Phase 12.4 - Event System
 * Phase 12.5 - Semantic Search
 */

// Skill Registry - Load and manage skills
export {
  getActiveSkills,
  getSkillBySlug,
  getSkillsByCategory,
  getSkillsByTrigger,
  getDependentSkills,
  validateSkill,
  checkDependencies,
  discoverSkillsForScenario,
} from "./skill-registry";

export type { SkillValidationResult } from "./skill-registry";

// Skill Invocation - Execute skills
export {
  invokeSkill,
  invokeSkillChain,
} from "./skill-invocation";

export type {
  InvocationInput,
  InvocationResult,
  SkillContext as InvocationContext,
} from "./skill-invocation";

// Context Injection - Build rich context for skills
export {
  buildContext,
  serializeContextForPrompt,
} from "./context-injection";

export type {
  ContextDocument,
  EntityContext,
  SkillContext,
} from "./context-injection";

// Invocation Metrics - Track and analyze skill usage
export {
  getDashboardMetrics,
  getSkillMetrics,
  getInvocationDetails,
  getEntityInvocations,
} from "./invocation-metrics";

export type {
  InvocationMetrics,
  SkillMetrics,
  TimeSeriesDataPoint,
  DashboardMetrics,
  RecentInvocation,
} from "./invocation-metrics";

// Event Bus - Publish and subscribe to entity events
export {
  publishEvent,
  createEvent,
  getEntityEvents,
  getActivityFeed,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  listSubscriptions,
} from "./event-bus";

export type {
  EntityType,
  EventAction,
  EntityEvent,
  EventSubscription,
} from "./event-bus";

// Event Handlers - Built-in handlers for common events
export {
  getHandler,
  listHandlers,
  executeHandlerByName,
  emitStatusChange,
  emitEntityCreated,
  emitEntityUpdated,
} from "./event-handlers";

// Embedding Service - Generate and manage document embeddings
export {
  generateEmbedding,
  generateEmbeddings,
  chunkDocument,
  estimateTokens,
  embedDocument,
  embedDocumentsByPath,
  getEmbeddingStatus,
  getEmbeddingStats,
} from "./embedding-service";

export type {
  EmbeddingConfig,
  EmbeddingResult,
  ChunkConfig,
  DocumentChunk,
} from "./embedding-service";

// Semantic Search - AI-powered search across knowledge
export {
  semanticSearch,
  findSimilarDocuments,
  getRelevantContext,
  hybridSearch,
  getSearchSuggestions,
} from "./semantic-search";

export type {
  SearchOptions,
  SearchResult,
  SearchResponse,
} from "./semantic-search";
