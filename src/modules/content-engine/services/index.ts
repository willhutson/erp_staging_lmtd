/**
 * Content Engine Services
 *
 * Phase 12.2 - Agent Infrastructure
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
