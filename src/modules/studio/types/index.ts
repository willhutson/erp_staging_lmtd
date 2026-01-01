// SpokeStudio Types
// Re-exports Prisma types and defines module-specific types

import type {
  StudioDocument,
  StudioDocVersion,
  StudioCalendarEntry,
  VideoProject,
  VideoScript,
  Storyboard,
  StoryboardFrame,
  ShotListItem,
  PitchDeck,
  DeckSlide,
  DeckTemplate,
  Moodboard,
  MoodboardItem,
  MoodboardConversation,
  MoodboardOutput,
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
} from "@prisma/client";

// Re-export all Prisma types
export type {
  StudioDocument,
  StudioDocVersion,
  StudioCalendarEntry,
  VideoProject,
  VideoScript,
  Storyboard,
  StoryboardFrame,
  ShotListItem,
  PitchDeck,
  DeckSlide,
  DeckTemplate,
  Moodboard,
  MoodboardItem,
  MoodboardConversation,
  MoodboardOutput,
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

export interface DocumentWithRelations extends StudioDocument {
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

export interface CalendarEntryWithRelations extends StudioCalendarEntry {
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

export interface VideoProjectWithRelations extends VideoProject {
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  director?: { id: string; name: string; avatarUrl?: string | null } | null;
  client?: { id: string; name: string } | null;
  script?: VideoScript | null;
  storyboard?: Storyboard & { frames: StoryboardFrame[] } | null;
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

export interface DeckWithRelations extends PitchDeck {
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

export interface MoodboardWithRelations extends Moodboard {
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
