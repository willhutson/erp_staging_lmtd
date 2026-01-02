"use server";

import { getStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  WorkflowBoardWithRelations,
  WorkflowCardWithRelations,
  WorkflowTemplateWithRelations,
  CreateBoardInput,
  CreateColumnInput,
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
} from "./types";

// ============================================
// Board Actions
// ============================================

export async function getWorkflowBoards(): Promise<WorkflowBoardWithRelations[]> {
  const user = await getStudioUser();

  const boards = await prisma.workflowBoard.findMany({
    where: {
      organizationId: user.organizationId,
      isArchived: false,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      client: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, name: true },
      },
      _count: {
        select: { columns: true, members: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return boards as WorkflowBoardWithRelations[];
}

export async function getWorkflowBoard(boardId: string): Promise<WorkflowBoardWithRelations | null> {
  const user = await getStudioUser();

  const board = await prisma.workflowBoard.findFirst({
    where: {
      id: boardId,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      client: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, name: true },
      },
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              assignee: {
                select: { id: true, name: true, avatarUrl: true },
              },
              createdBy: {
                select: { id: true, name: true, avatarUrl: true },
              },
              _count: {
                select: { comments: true, attachments: true, checklists: true },
              },
            },
          },
        },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return board as WorkflowBoardWithRelations | null;
}

export async function createWorkflowBoard(input: CreateBoardInput): Promise<WorkflowBoardWithRelations> {
  const user = await getStudioUser();

  // If creating from template, get template data
  let defaultColumns: { name: string; color?: string }[] = [
    { name: "To Do", color: "#6B7280" },
    { name: "In Progress", color: "#3B82F6" },
    { name: "Review", color: "#F59E0B" },
    { name: "Done", color: "#10B981" },
  ];

  if (input.templateId) {
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: input.templateId },
    });
    if (template?.columns) {
      defaultColumns = template.columns as typeof defaultColumns;
      // Increment usage count
      await prisma.workflowTemplate.update({
        where: { id: input.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const board = await prisma.workflowBoard.create({
    data: {
      organizationId: user.organizationId,
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: input.color,
      clientId: input.clientId,
      projectId: input.projectId,
      createdById: user.id,
      columns: {
        create: defaultColumns.map((col, idx) => ({
          name: col.name,
          color: col.color,
          position: idx,
        })),
      },
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      client: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, name: true },
      },
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: true,
        },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  revalidatePath("/workflows");

  return board as WorkflowBoardWithRelations;
}

// ============================================
// Column Actions
// ============================================

export async function createColumn(input: CreateColumnInput) {
  const user = await getStudioUser();

  // Verify board belongs to user's org
  const board = await prisma.workflowBoard.findFirst({
    where: {
      id: input.boardId,
      organizationId: user.organizationId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // Get max position
  const maxPosition = await prisma.workflowColumn.aggregate({
    where: { boardId: input.boardId },
    _max: { position: true },
  });

  const column = await prisma.workflowColumn.create({
    data: {
      boardId: input.boardId,
      name: input.name,
      color: input.color,
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
      wipLimit: input.wipLimit,
    },
    include: {
      cards: true,
    },
  });

  revalidatePath(`/workflows/${input.boardId}`);

  return column;
}

// ============================================
// Card Actions
// ============================================

export async function createCard(input: CreateCardInput): Promise<WorkflowCardWithRelations> {
  const user = await getStudioUser();

  // Verify column belongs to user's org
  const column = await prisma.workflowColumn.findFirst({
    where: {
      id: input.columnId,
      board: {
        organizationId: user.organizationId,
      },
    },
    include: {
      board: true,
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  // Get max position in column
  const maxPosition = await prisma.workflowCard.aggregate({
    where: { columnId: input.columnId },
    _max: { position: true },
  });

  const card = await prisma.workflowCard.create({
    data: {
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,
      startDate: input.startDate,
      estimatedHours: input.estimatedHours,
      labels: input.labels ?? [],
      color: input.color,
      assigneeId: input.assigneeId,
      briefId: input.briefId,
      createdById: user.id,
      position: (maxPosition._max.position ?? -1) + 1,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { comments: true, attachments: true, checklists: true },
      },
    },
  });

  revalidatePath(`/workflows/${column.boardId}`);

  return card as WorkflowCardWithRelations;
}

export async function updateCard(cardId: string, input: UpdateCardInput): Promise<WorkflowCardWithRelations> {
  const user = await getStudioUser();

  // Verify card belongs to user's org
  const existingCard = await prisma.workflowCard.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          organizationId: user.organizationId,
        },
      },
    },
    include: {
      column: {
        include: { board: true },
      },
    },
  });

  if (!existingCard) {
    throw new Error("Card not found");
  }

  // Handle completion
  let completedAt = existingCard.completedAt;
  if (input.columnId) {
    const targetColumn = await prisma.workflowColumn.findUnique({
      where: { id: input.columnId },
    });
    if (targetColumn?.name.toLowerCase().includes("done")) {
      completedAt = new Date();
    } else {
      completedAt = null;
    }
  }

  const card = await prisma.workflowCard.update({
    where: { id: cardId },
    data: {
      ...input,
      completedAt,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { comments: true, attachments: true, checklists: true },
      },
    },
  });

  revalidatePath(`/workflows/${existingCard.column.boardId}`);

  return card as WorkflowCardWithRelations;
}

export async function moveCard(input: MoveCardInput) {
  const user = await getStudioUser();

  // Verify card and target column belong to user's org
  const card = await prisma.workflowCard.findFirst({
    where: {
      id: input.cardId,
      column: {
        board: {
          organizationId: user.organizationId,
        },
      },
    },
    include: {
      column: {
        include: { board: true },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const targetColumn = await prisma.workflowColumn.findFirst({
    where: {
      id: input.targetColumnId,
      board: {
        organizationId: user.organizationId,
      },
    },
  });

  if (!targetColumn) {
    throw new Error("Target column not found");
  }

  // Handle completion status
  let completedAt = card.completedAt;
  if (targetColumn.name.toLowerCase().includes("done")) {
    completedAt = new Date();
  } else {
    completedAt = null;
  }

  // Update card position
  await prisma.workflowCard.update({
    where: { id: input.cardId },
    data: {
      columnId: input.targetColumnId,
      position: input.targetPosition,
      completedAt,
    },
  });

  // Reorder other cards in target column
  await prisma.workflowCard.updateMany({
    where: {
      columnId: input.targetColumnId,
      id: { not: input.cardId },
      position: { gte: input.targetPosition },
    },
    data: {
      position: { increment: 1 },
    },
  });

  revalidatePath(`/workflows/${card.column.boardId}`);
}

// ============================================
// Template Actions
// ============================================

export async function getWorkflowTemplates(): Promise<WorkflowTemplateWithRelations[]> {
  const user = await getStudioUser();

  const templates = await prisma.workflowTemplate.findMany({
    where: {
      isActive: true,
      OR: [
        { organizationId: null }, // Global templates
        { organizationId: user.organizationId }, // Org-specific templates
      ],
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ usageCount: "desc" }, { name: "asc" }],
  });

  return templates as WorkflowTemplateWithRelations[];
}

// ============================================
// My Workflows (cards assigned to user)
// ============================================

export async function getMyWorkflowCards(): Promise<WorkflowCardWithRelations[]> {
  const user = await getStudioUser();

  const cards = await prisma.workflowCard.findMany({
    where: {
      assigneeId: user.id,
      column: {
        board: {
          organizationId: user.organizationId,
          isArchived: false,
        },
      },
      completedAt: null, // Only incomplete tasks
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      column: {
        include: {
          board: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: { comments: true, attachments: true, checklists: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });

  return cards as unknown as WorkflowCardWithRelations[];
}
