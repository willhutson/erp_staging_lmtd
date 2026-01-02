// Boards Module Types
// Kanban-style project boards (renamed from Workflows)

import type { Priority, BoardMemberRole } from "@/lib/prisma-enums";

// Re-export enums
export type { Priority, BoardMemberRole };

// ============================================
// Core Models
// ============================================

export interface Board {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isArchived: boolean;
  isPublic: boolean;
  clientId?: string | null;
  projectId?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  color?: string | null;
  position: number;
  wipLimit?: number | null;
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCard {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
  priority: Priority;
  dueDate?: Date | null;
  startDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  labels: string[];
  color?: string | null;
  assigneeId?: string | null;
  briefId?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardMemberRole;
  createdAt: Date;
}

export interface BoardCardComment {
  id: string;
  cardId: string;
  content: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCardAttachment {
  id: string;
  cardId: string;
  name: string;
  url: string;
  type?: string | null;
  size?: number | null;
  createdById: string;
  createdAt: Date;
}

export interface BoardCardChecklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  completedById?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardTemplate {
  id: string;
  organizationId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  icon?: string | null;
  color?: string | null;
  columns: unknown;
  cards?: unknown | null;
  isActive: boolean;
  usageCount: number;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Relations Types
// ============================================

export interface BoardWithRelations extends Board {
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  client?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  columns?: BoardColumnWithCards[];
  members?: BoardMemberWithUser[];
  _count?: {
    columns: number;
    members: number;
  };
}

export interface BoardColumnWithCards extends BoardColumn {
  cards: BoardCardWithRelations[];
}

export interface BoardCardWithRelations extends BoardCard {
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  brief?: { id: string; title: string } | null;
  column?: {
    board: { id: string; name: string };
  };
  comments?: BoardCardComment[];
  attachments?: BoardCardAttachment[];
  checklists?: BoardChecklistWithItems[];
  _count?: {
    comments: number;
    attachments: number;
    checklists: number;
  };
}

export interface BoardMemberWithUser extends BoardMember {
  user: { id: string; name: string; avatarUrl?: string | null };
}

export interface BoardChecklistWithItems extends BoardCardChecklist {
  items: BoardChecklistItem[];
}

export interface BoardTemplateWithRelations extends BoardTemplate {
  organization?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
}

// ============================================
// Input Types
// ============================================

export interface CreateBoardInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  clientId?: string;
  projectId?: string;
  templateId?: string; // If creating from template
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isArchived?: boolean;
  isPublic?: boolean;
}

export interface CreateColumnInput {
  boardId: string;
  name: string;
  color?: string;
  position?: number;
  wipLimit?: number;
}

export interface UpdateColumnInput {
  name?: string;
  color?: string;
  position?: number;
  wipLimit?: number;
  isCollapsed?: boolean;
}

export interface CreateCardInput {
  columnId: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  labels?: string[];
  color?: string;
  assigneeId?: string;
  briefId?: string;
}

export interface UpdateCardInput {
  columnId?: string; // For moving between columns
  title?: string;
  description?: string;
  position?: number;
  priority?: Priority;
  dueDate?: Date | null;
  startDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  labels?: string[];
  color?: string | null;
  assigneeId?: string | null;
}

export interface MoveCardInput {
  cardId: string;
  targetColumnId: string;
  targetPosition: number;
}

export interface AddBoardMemberInput {
  boardId: string;
  userId: string;
  role?: BoardMemberRole;
}

export interface CreateCommentInput {
  cardId: string;
  content: string;
}

export interface CreateChecklistInput {
  cardId: string;
  title: string;
}

export interface CreateChecklistItemInput {
  checklistId: string;
  title: string;
}

// ============================================
// Filter Types
// ============================================

export interface BoardFilters {
  clientId?: string;
  projectId?: string;
  isArchived?: boolean;
  search?: string;
}

export interface BoardCardFilters {
  assigneeId?: string;
  priority?: Priority;
  hasDeadline?: boolean;
  isOverdue?: boolean;
  labels?: string[];
  search?: string;
}
