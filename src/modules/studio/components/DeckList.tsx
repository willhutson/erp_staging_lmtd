"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Presentation,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Layers,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckWithRelations } from "../types";

interface DeckListProps {
  decks: DeckWithRelations[];
  onDeckClick: (deck: DeckWithRelations) => void;
  onDeleteClick?: (deck: DeckWithRelations) => void;
  onPresentClick?: (deck: DeckWithRelations) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  PRESENTED: { label: "Presented", color: "bg-purple-100 text-purple-700" },
  WON: { label: "Won", color: "bg-emerald-100 text-emerald-700" },
  LOST: { label: "Lost", color: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-500" },
};

export function DeckList({
  decks,
  onDeckClick,
  onDeleteClick,
  onPresentClick,
}: DeckListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (decks.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => {
        const status = statusConfig[deck.status] || statusConfig.DRAFT;
        const slideCount = deck.slides?.length || 0;

        return (
          <div
            key={deck.id}
            className="group relative rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors cursor-pointer overflow-hidden"
            onClick={() => onDeckClick(deck)}
          >
            {/* Preview area */}
            <div className="aspect-video bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center relative">
              <Presentation className="w-12 h-12 text-orange-500/50" />

              {/* Slide count badge */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
                <Layers className="w-3 h-3" />
                {slideCount} slides
              </div>

              {/* Present button */}
              {onPresentClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPresentClick(deck);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                  title="Present"
                >
                  <Play className="w-4 h-4 text-ltd-text-1" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ltd-text-1 truncate">
                    {deck.title}
                  </h3>
                  {deck.client && (
                    <p className="text-xs text-ltd-text-2 mt-0.5">
                      {deck.client.name}
                    </p>
                  )}
                </div>
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded", status.color)}>
                  {status.label}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-ltd-text-3">
                {deck.presentationDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(deck.presentationDate), "MMM d, yyyy")}
                  </span>
                )}
                <span>
                  Updated {format(new Date(deck.updatedAt), "MMM d")}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-2 left-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === deck.id ? null : deck.id);
                  }}
                  className="p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                >
                  <MoreVertical className="w-4 h-4 text-ltd-text-2" />
                </button>

                {openMenuId === deck.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-ltd-surface-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] shadow-lg z-10">
                    {deck.googleSlidesUrl && (
                      <a
                        href={deck.googleSlidesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-text-1 hover:bg-ltd-surface-3 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Google Slides
                      </a>
                    )}
                    {onDeleteClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(deck);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
