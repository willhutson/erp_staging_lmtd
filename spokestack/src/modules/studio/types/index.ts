// SpokeStudio Types
// Re-exports enum types and defines module-specific types

// Import enum types from local file (since Prisma client may not be fully generated)
import type {
  StudioDocType,
  StudioDocStatus,
  SyncStatus,
  SocialContentType,
  CalendarEntryStatus,
  VideoProjectType,
  VideoProjectStatus,
  ScriptStatus,
  ShotStatus,
  DeckType,
  DeckStatus,
  SlideLayoutType,
  MoodboardType,
  MoodboardStatus,
  MoodboardItemType,
  MoodboardOutputType,
  ProcessingStatus,
  IndexStatus,
} from "@/lib/prisma-enums";

// Define model types locally (since Prisma client may not be fully generated)
export interface StudioDocument {
  id: string;
  organizationId: string;
  title: string;
  type: StudioDocType;
  status: StudioDocStatus;
  content?: unknown | null;
  contentHtml?: string | null;
  wordCount?: number | null;
  googleDocId?: string | null;
  googleDriveId?: string | null;
  lastSyncedAt?: Date | null;
  syncStatus: SyncStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  lastEditedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudioDocVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content?: unknown | null;
  contentHtml?: string | null;
  wordCount?: number | null;
  createdById: string;
  createdAt: Date;
}

export interface VideoProject {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: VideoProjectType;
  status: VideoProjectStatus;
  duration?: number | null;
  aspectRatio?: string | null;
  platform?: string | null;
  shootDate?: Date | null;
  dueDate?: Date | null;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  directorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoScript {
  id: string;
  videoProjectId: string;
  content?: unknown | null;
  contentText?: string | null;
  status: ScriptStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Storyboard {
  id: string;
  videoProjectId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryboardFrame {
  id: string;
  storyboardId: string;
  frameNumber: number;
  imageUrl?: string | null;
  description?: string | null;
  dialogue?: string | null;
  action?: string | null;
  shotType?: string | null;
  cameraMovement?: string | null;
  duration?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShotListItem {
  id: string;
  videoProjectId: string;
  shotNumber: string;
  description?: string | null;
  shotType?: string | null;
  location?: string | null;
  talent?: string | null;
  equipment?: string | null;
  notes?: string | null;
  status: ShotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchDeck {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: DeckType;
  status: DeckStatus;
  templateId?: string | null;
  googleSlidesId?: string | null;
  googleDriveId?: string | null;
  lastSyncedAt?: Date | null;
  clientId?: string | null;
  dealId?: string | null;
  projectId?: string | null;
  presentationDate?: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckSlide {
  id: string;
  deckId: string;
  slideNumber: number;
  layoutType: SlideLayoutType;
  title?: string | null;
  subtitle?: string | null;
  content?: unknown | null;
  speakerNotes?: string | null;
  backgroundUrl?: string | null;
  backgroundColor?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  type: DeckType;
  slideTemplates?: unknown | null;
  colorScheme?: unknown | null;
  fonts?: unknown | null;
  logoUrl?: string | null;
  googleTemplateId?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Moodboard {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: MoodboardType;
  status: MoodboardStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  indexStatus: IndexStatus;
  indexedAt?: Date | null;
  isPublic: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodboardItem {
  id: string;
  moodboardId: string;
  type: MoodboardItemType;
  fileUrl?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
  description?: string | null;
  color?: string | null;
  text?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  width?: number | null;
  height?: number | null;
  rotation?: number | null;
  zIndex?: number | null;
  processingStatus: ProcessingStatus;
  indexStatus: IndexStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodboardConversation {
  id: string;
  moodboardId: string;
  title: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodboardOutput {
  id: string;
  moodboardId: string;
  conversationId?: string | null;
  type: MoodboardOutputType;
  title: string;
  content?: unknown | null;
  contentText?: string | null;
  prompt?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudioCalendarEntry {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  contentType: SocialContentType;
  scheduledDate: Date;
  scheduledTime?: string | null;
  timezone: string;
  platforms: string[];
  status: CalendarEntryStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  documentId?: string | null;
  color?: string | null;
  createdById: string;
  assigneeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export all enum types
export type {
  StudioDocType,
  StudioDocStatus,
  SyncStatus,
  SocialContentType,
  CalendarEntryStatus,
  VideoProjectType,
  VideoProjectStatus,
  ScriptStatus,
  ShotStatus,
  DeckType,
  DeckStatus,
  SlideLayoutType,
  MoodboardType,
  MoodboardStatus,
  MoodboardItemType,
  MoodboardOutputType,
  ProcessingStatus,
  IndexStatus,
};

// ============================================
// Document Types
// ============================================

export interface CreateDocumentInput {
  title: string;
  type: StudioDocType;
  clientId?: string;
  briefId?: string;
  projectId?: string;
  createInGoogle?: boolean;
  templateId?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  type?: StudioDocType;
  status?: StudioDocStatus;
  content?: unknown;
  contentHtml?: string;
}

export interface DocumentWithRelations {
  id: string;
  organizationId: string;
  title: string;
  type: StudioDocType;
  status: StudioDocStatus;
  content?: unknown | null;
  contentHtml?: string | null;
  wordCount?: number | null;
  googleDocId?: string | null;
  googleDriveId?: string | null;
  lastSyncedAt?: Date | null;
  syncStatus: SyncStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  lastEditedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  lastEditedBy?: { id: string; name: string; avatarUrl?: string | null } | null;
  client?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  brief?: { id: string; title: string } | null;
  versions?: StudioDocVersion[];
}

// ============================================
// Calendar Types
// ============================================

export interface CreateCalendarEntryInput {
  title: string;
  description?: string;
  contentType: SocialContentType;
  scheduledDate: Date;
  scheduledTime?: string;
  platforms: string[];
  clientId?: string;
  projectId?: string;
  briefId?: string;
  documentId?: string;
  color?: string;
  assigneeId?: string;
}

export interface CalendarEntryWithRelations {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  contentType: SocialContentType;
  scheduledDate: Date;
  scheduledTime?: string | null;
  timezone: string;
  platforms: string[];
  status: CalendarEntryStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  documentId?: string | null;
  color?: string | null;
  createdById: string;
  assigneeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  client?: { id: string; name: string } | null;
  document?: { id: string; title: string } | null;
}

// ============================================
// Video Project Types
// ============================================

export interface CreateVideoProjectInput {
  title: string;
  description?: string;
  type: VideoProjectType;
  clientId?: string;
  projectId?: string;
  briefId?: string;
  directorId?: string;
  duration?: number;
  aspectRatio?: string;
  platform?: string;
  shootDate?: Date;
  dueDate?: Date;
}

export interface VideoProjectWithRelations {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: VideoProjectType;
  status: VideoProjectStatus;
  duration?: number | null;
  aspectRatio?: string | null;
  platform?: string | null;
  shootDate?: Date | null;
  dueDate?: Date | null;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  directorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  director?: { id: string; name: string; avatarUrl?: string | null } | null;
  client?: { id: string; name: string } | null;
  script?: VideoScript | null;
  storyboard?: (Storyboard & { frames: StoryboardFrame[] }) | null;
  shotList?: ShotListItem[];
}

// ============================================
// Pitch Deck Types
// ============================================

export interface CreateDeckInput {
  title: string;
  description?: string;
  type: DeckType;
  clientId?: string;
  dealId?: string;
  projectId?: string;
  templateId?: string;
  presentationDate?: Date;
}

export interface DeckWithRelations {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: DeckType;
  status: DeckStatus;
  templateId?: string | null;
  googleSlidesId?: string | null;
  googleDriveId?: string | null;
  lastSyncedAt?: Date | null;
  clientId?: string | null;
  dealId?: string | null;
  projectId?: string | null;
  presentationDate?: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  client?: { id: string; name: string } | null;
  template?: DeckTemplate | null;
  slides?: DeckSlide[];
}

// ============================================
// Moodboard Types
// ============================================

export interface CreateMoodboardInput {
  title: string;
  description?: string;
  type: MoodboardType;
  clientId?: string;
  projectId?: string;
  briefId?: string;
}

export interface MoodboardWithRelations {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  type: MoodboardType;
  status: MoodboardStatus;
  clientId?: string | null;
  projectId?: string | null;
  briefId?: string | null;
  createdById: string;
  indexStatus: IndexStatus;
  indexedAt?: Date | null;
  isPublic: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  client?: { id: string; name: string } | null;
  items?: MoodboardItem[];
  _count?: {
    items: number;
    conversations: number;
    outputs: number;
  };
}

export interface AddMoodboardItemInput {
  moodboardId: string;
  type: MoodboardItemType;
  fileUrl?: string;
  sourceUrl?: string;
  title?: string;
  description?: string;
  color?: string;
  text?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

// ============================================
// AI Generation Types
// ============================================

export interface GenerateContentInput {
  skillId: string;
  moodboardId?: string;
  briefId?: string;
  clientId?: string;
  prompt: string;
  options?: Record<string, unknown>;
}

export interface GenerateContentOutput {
  type: MoodboardOutputType;
  title: string;
  content: unknown;
  contentText?: string;
}

// ============================================
// Filter Types
// ============================================

export interface StudioDocumentFilters {
  clientId?: string;
  projectId?: string;
  briefId?: string;
  type?: StudioDocType;
  status?: StudioDocStatus;
  search?: string;
}

export interface VideoProjectFilters {
  clientId?: string;
  type?: VideoProjectType;
  status?: VideoProjectStatus;
  search?: string;
}

export interface MoodboardFilters {
  clientId?: string;
  projectId?: string;
  type?: MoodboardType;
  status?: MoodboardStatus;
  search?: string;
}

export interface CalendarFilters {
  clientId?: string;
  platforms?: string[];
  status?: CalendarEntryStatus;
  startDate?: Date;
  endDate?: Date;
}
