// Workflow Module Types
// Re-exports enum types and defines module-specific types

import type { Priority, WorkflowMemberRole } from "@/lib/prisma-enums";

// Re-export enums
export type { Priority, WorkflowMemberRole };

// ============================================
// Core Models
// ============================================

export interface WorkflowBoard {
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

export interface WorkflowColumn {
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

export interface WorkflowCard {
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

export interface WorkflowBoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: WorkflowMemberRole;
  createdAt: Date;
}

export interface WorkflowComment {
  id: string;
  cardId: string;
  content: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowAttachment {
  id: string;
  cardId: string;
  name: string;
  url: string;
  type?: string | null;
  size?: number | null;
  createdById: string;
  createdAt: Date;
}

export interface WorkflowChecklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowChecklistItem {
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

export interface WorkflowTemplate {
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

export interface WorkflowBoardWithRelations extends WorkflowBoard {
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  client?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  columns?: WorkflowColumnWithCards[];
  members?: WorkflowBoardMemberWithUser[];
  _count?: {
    columns: number;
    members: number;
  };
}

export interface WorkflowColumnWithCards extends WorkflowColumn {
  cards: WorkflowCardWithRelations[];
}

export interface WorkflowCardWithRelations extends WorkflowCard {
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  brief?: { id: string; title: string } | null;
  comments?: WorkflowComment[];
  attachments?: WorkflowAttachment[];
  checklists?: WorkflowChecklistWithItems[];
  _count?: {
    comments: number;
    attachments: number;
    checklists: number;
  };
}

export interface WorkflowBoardMemberWithUser extends WorkflowBoardMember {
  user: { id: string; name: string; avatarUrl?: string | null };
}

export interface WorkflowChecklistWithItems extends WorkflowChecklist {
  items: WorkflowChecklistItem[];
}

export interface WorkflowTemplateWithRelations extends WorkflowTemplate {
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
  role?: WorkflowMemberRole;
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

export interface WorkflowBoardFilters {
  clientId?: string;
  projectId?: string;
  isArchived?: boolean;
  search?: string;
}

export interface WorkflowCardFilters {
  assigneeId?: string;
  priority?: Priority;
  hasDeadline?: boolean;
  isOverdue?: boolean;
  labels?: string[];
  search?: string;
}
