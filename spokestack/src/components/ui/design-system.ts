/**
 * SpokeStack Design System Components
 *
 * Frontend-design skill implementation with:
 * - Workspace modes (Living / Control / Executive)
 * - Fuel gauges and capacity indicators
 * - AI greeting and interaction patterns
 * - Split-screen layouts
 * - Creativity/randomness controls
 *
 * Usage:
 * import { WorkspaceModeProvider, FuelGauge, AIGreeting } from '@/components/ui/design-system';
 */

// Workspace modes
export {
  WorkspaceModeProvider,
  WorkspaceModeSelector,
  useWorkspaceMode,
  type WorkspaceMode,
} from "./workspace-mode";

// Fuel gauges and capacity indicators
export {
  FuelGauge,
  CapacityIndicator,
  RetainerBurn,
} from "./fuel-gauge";

// AI greeting and interaction patterns
export {
  AIGreeting,
  AIFocusSummary,
  AIQuickStats,
} from "./ai-greeting";

// Split-screen layouts
export {
  SplitScreen,
  SplitScreenInput,
  SplitScreenOutput,
  AISplitScreen,
  CanvasSplitScreen,
} from "./split-screen";

// Creativity/randomness controls
export {
  RandomnessDial,
  CreativitySlider,
} from "./randomness-dial";

// Enhanced card variants
export {
  InteractiveCard,
  StatCard,
  ModuleCard,
  FocusItemCard,
  NotificationCard,
  EmptyStateCard,
  AIInsightCard,
} from "./enhanced-card";

// Chat components
export {
  Message,
  ThreadPanel,
  ItemLinkedThread,
  TypingIndicator,
  PresenceRow,
} from "./chat-components";

// Loading states
export {
  Skeleton,
  CardSkeleton,
  StatCardSkeleton,
  ModuleCardSkeleton,
  FocusItemSkeleton,
  MessageSkeleton,
  TableRowSkeleton,
  AIGreetingSkeleton,
  DashboardSkeleton,
  StudioGridSkeleton,
  ChatSkeleton,
  Spinner,
  LoadingOverlay,
} from "./loading-skeleton";
