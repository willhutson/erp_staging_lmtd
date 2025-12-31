"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  CreateDeckInput,
  DeckWithRelations,
} from "../types";
import type { DeckStatus, SlideLayoutType } from "@prisma/client";

/**
 * Create a new pitch deck
 */
export async function createPitchDeck(
  input: CreateDeckInput
): Promise<DeckWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deck = await db.pitchDeck.create({
    data: {
      organizationId: session.user.organizationId,
      title: input.title,
      description: input.description,
      type: input.type,
      clientId: input.clientId,
      dealId: input.dealId,
      projectId: input.projectId,
      templateId: input.templateId,
      presentationDate: input.presentationDate,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      template: true,
      slides: { orderBy: { orderIndex: "asc" } },
    },
  });

  // If template provided, copy template slides
  if (input.templateId) {
    const template = await db.deckTemplate.findUnique({
      where: { id: input.templateId },
    });

    if (template?.slideTemplates) {
      const slideTemplates = template.slideTemplates as Array<{
        layoutType: SlideLayoutType;
        title?: string;
        subtitle?: string;
        content?: unknown;
      }>;

      for (let i = 0; i < slideTemplates.length; i++) {
        const slideTemplate = slideTemplates[i];
        await db.deckSlide.create({
          data: {
            deckId: deck.id,
            orderIndex: i,
            layoutType: slideTemplate.layoutType,
            title: slideTemplate.title,
            subtitle: slideTemplate.subtitle,
            content: (slideTemplate.content || {}) as object,
          },
        });
      }
    }
  } else {
    // Create default title slide
    await db.deckSlide.create({
      data: {
        deckId: deck.id,
        orderIndex: 0,
        layoutType: "TITLE",
        title: input.title,
        content: {},
      },
    });
  }

  // Re-fetch with slides
  return getPitchDeck(deck.id) as Promise<DeckWithRelations>;
}

/**
 * Get a pitch deck by ID
 */
export async function getPitchDeck(
  deckId: string
): Promise<DeckWithRelations | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deck = await db.pitchDeck.findFirst({
    where: {
      id: deckId,
      organizationId: session.user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      template: true,
      slides: { orderBy: { orderIndex: "asc" } },
    },
  });

  return deck as DeckWithRelations | null;
}

/**
 * List pitch decks
 */
export async function listPitchDecks(filters: {
  clientId?: string;
  type?: string;
  status?: DeckStatus;
  search?: string;
} = {}): Promise<DeckWithRelations[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const decks = await db.pitchDeck.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        title: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      template: true,
      slides: { orderBy: { orderIndex: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return decks as DeckWithRelations[];
}

/**
 * Add slide to deck
 */
export async function addSlide(
  deckId: string,
  slide: {
    layoutType: SlideLayoutType;
    title?: string;
    subtitle?: string;
    content?: unknown;
    speakerNotes?: string;
    afterIndex?: number; // Insert after this index, or at end if not provided
  }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access
  const deck = await db.pitchDeck.findFirst({
    where: {
      id: deckId,
      organizationId: session.user.organizationId,
    },
  });

  if (!deck) throw new Error("Deck not found");

  // Determine order index
  let orderIndex: number;
  if (slide.afterIndex !== undefined) {
    orderIndex = slide.afterIndex + 1;
    // Shift existing slides
    await db.deckSlide.updateMany({
      where: {
        deckId,
        orderIndex: { gte: orderIndex },
      },
      data: {
        orderIndex: { increment: 1 },
      },
    });
  } else {
    const lastSlide = await db.deckSlide.findFirst({
      where: { deckId },
      orderBy: { orderIndex: "desc" },
    });
    orderIndex = (lastSlide?.orderIndex ?? -1) + 1;
  }

  await db.deckSlide.create({
    data: {
      deckId,
      orderIndex,
      layoutType: slide.layoutType,
      title: slide.title,
      subtitle: slide.subtitle,
      content: (slide.content || {}) as object,
      speakerNotes: slide.speakerNotes,
    },
  });
}

/**
 * Update slide
 */
export async function updateSlide(
  slideId: string,
  updates: {
    title?: string;
    subtitle?: string;
    content?: unknown;
    speakerNotes?: string;
    backgroundUrl?: string;
    backgroundColor?: string;
  }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access through deck
  const slide = await db.deckSlide.findUnique({
    where: { id: slideId },
    include: { deck: true },
  });

  if (!slide || slide.deck.organizationId !== session.user.organizationId) {
    throw new Error("Slide not found");
  }

  await db.deckSlide.update({
    where: { id: slideId },
    data: {
      title: updates.title,
      subtitle: updates.subtitle,
      content: updates.content as object,
      speakerNotes: updates.speakerNotes,
      backgroundUrl: updates.backgroundUrl,
      backgroundColor: updates.backgroundColor,
    },
  });
}

/**
 * Reorder slides
 */
export async function reorderSlides(
  deckId: string,
  slideOrder: string[] // Array of slide IDs in new order
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access
  const deck = await db.pitchDeck.findFirst({
    where: {
      id: deckId,
      organizationId: session.user.organizationId,
    },
  });

  if (!deck) throw new Error("Deck not found");

  // Update each slide's order
  for (let i = 0; i < slideOrder.length; i++) {
    await db.deckSlide.update({
      where: { id: slideOrder[i] },
      data: { orderIndex: i },
    });
  }
}

/**
 * Delete slide
 */
export async function deleteSlide(slideId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slide = await db.deckSlide.findUnique({
    where: { id: slideId },
    include: { deck: true },
  });

  if (!slide || slide.deck.organizationId !== session.user.organizationId) {
    throw new Error("Slide not found");
  }

  await db.deckSlide.delete({ where: { id: slideId } });

  // Reorder remaining slides
  await db.deckSlide.updateMany({
    where: {
      deckId: slide.deckId,
      orderIndex: { gt: slide.orderIndex },
    },
    data: {
      orderIndex: { decrement: 1 },
    },
  });
}
