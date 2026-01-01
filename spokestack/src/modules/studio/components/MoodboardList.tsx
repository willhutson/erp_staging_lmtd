"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
  Sparkles,
  MessageSquare,
  FileOutput,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MoodboardWithRelations, MoodboardItem } from "../types";

interface MoodboardListProps {
  moodboards: MoodboardWithRelations[];
  onMoodboardClick: (moodboard: MoodboardWithRelations) => void;
  onDeleteClick?: (moodboard: MoodboardWithRelations) => void;
  onShareClick?: (moodboard: MoodboardWithRelations) => void;
}

const typeConfig = {
  CAMPAIGN: { label: "Campaign", color: "bg-blue-100 text-blue-700" },
  BRAND: { label: "Brand", color: "bg-purple-100 text-purple-700" },
  PRODUCT: { label: "Product", color: "bg-green-100 text-green-700" },
  EVENT: { label: "Event", color: "bg-yellow-100 text-yellow-700" },
  CONTENT: { label: "Content", color: "bg-pink-100 text-pink-700" },
  GENERAL: { label: "General", color: "bg-gray-100 text-gray-700" },
};

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-700" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-500" },
};

export function MoodboardList({
  moodboards,
  onMoodboardClick,
  onDeleteClick,
  onShareClick,
}: MoodboardListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (moodboards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {moodboards.map((moodboard) => {
        const type = typeConfig[moodboard.type as keyof typeof typeConfig] || typeConfig.GENERAL;
        const status = statusConfig[moodboard.status] || statusConfig.DRAFT;
        const previewItems = moodboard.items || [];
        const itemCount = moodboard._count?.items || 0;
        const hasAI = (moodboard._count?.conversations || 0) > 0 || (moodboard._count?.outputs || 0) > 0;

        return (
          <div
            key={moodboard.id}
            className="group relative rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors cursor-pointer overflow-hidden"
            onClick={() => onMoodboardClick(moodboard)}
          >
            {/* Preview Grid */}
            <div className="aspect-video bg-ltd-surface-3 relative overflow-hidden">
              {previewItems.length > 0 ? (
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
                  {previewItems.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-ltd-surface-2 overflow-hidden"
                    >
                      {item.type === "IMAGE" && item.fileUrl ? (
                        <img
                          src={item.fileUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === "COLOR" && item.color ? (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: item.color }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-ltd-text-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-ltd-text-3/50" />
                </div>
              )}

              {/* Item count badge */}
              {itemCount > 0 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
                  {itemCount} items
                </div>
              )}

              {/* AI badge */}
              {hasAI && (
                <div className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-ltd-primary to-[#7B61FF] rounded-full">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Share indicator */}
              {moodboard.isPublic && (
                <div className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full">
                  <Share2 className="w-3 h-3 text-ltd-text-2" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ltd-text-1 truncate">
                    {moodboard.title}
                  </h3>
                  {moodboard.client && (
                    <p className="text-xs text-ltd-text-2 mt-0.5">
                      {moodboard.client.name}
                    </p>
                  )}
                </div>
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded", type.color)}>
                  {type.label}
                </span>
              </div>

              {moodboard.description && (
                <p className="text-xs text-ltd-text-2 mt-2 line-clamp-2">
                  {moodboard.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-xs text-ltd-text-3">
                {(moodboard._count?.conversations || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {moodboard._count?.conversations}
                  </span>
                )}
                {(moodboard._count?.outputs || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <FileOutput className="w-3 h-3" />
                    {moodboard._count?.outputs}
                  </span>
                )}
                <span>
                  Updated {format(new Date(moodboard.updatedAt), "MMM d")}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-2 left-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === moodboard.id ? null : moodboard.id);
                  }}
                  className="p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                >
                  <MoreVertical className="w-4 h-4 text-ltd-text-2" />
                </button>

                {openMenuId === moodboard.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-ltd-surface-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] shadow-lg z-10">
                    {onShareClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareClick(moodboard);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-text-1 hover:bg-ltd-surface-3 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        {moodboard.isPublic ? "Manage Sharing" : "Share"}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(moodboard.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-text-1 hover:bg-ltd-surface-3 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </button>
                    {onDeleteClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(moodboard);
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
