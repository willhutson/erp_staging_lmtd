"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  ExternalLink,
  Cloud,
  CloudOff,
  RefreshCw,
  MoreVertical,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentWithRelations } from "../types";

interface DocumentListProps {
  documents: DocumentWithRelations[];
  onDocumentClick: (doc: DocumentWithRelations) => void;
  onSyncClick?: (doc: DocumentWithRelations) => void;
  onDeleteClick?: (doc: DocumentWithRelations) => void;
}

const syncStatusConfig = {
  PENDING: { icon: RefreshCw, label: "Pending sync", color: "text-yellow-600" },
  SYNCED: { icon: Cloud, label: "Synced", color: "text-green-600" },
  SYNCING: { icon: RefreshCw, label: "Syncing", color: "text-blue-600" },
  FAILED: { icon: RefreshCw, label: "Sync failed", color: "text-red-600" },
  ERROR: { icon: RefreshCw, label: "Error", color: "text-red-600" },
  SKIPPED: { icon: CloudOff, label: "Local only", color: "text-gray-500" },
  DISABLED: { icon: CloudOff, label: "Sync disabled", color: "text-gray-400" },
};

export function DocumentList({
  documents,
  onDocumentClick,
  onSyncClick,
  onDeleteClick,
}: DocumentListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const syncStatus = syncStatusConfig[doc.syncStatus || "SKIPPED"];
        const SyncIcon = syncStatus.icon;

        return (
          <div
            key={doc.id}
            className="group flex items-center gap-4 p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors cursor-pointer"
            onClick={() => onDocumentClick(doc)}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-[var(--ltd-radius-md)] bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-ltd-text-1 truncate">
                  {doc.title}
                </h3>
                {doc.googleDocUrl && (
                  <a
                    href={doc.googleDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-ltd-text-3 hover:text-ltd-primary"
                    title="Open in Google Docs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-ltd-text-2">
                {doc.client && (
                  <span className="px-1.5 py-0.5 bg-ltd-surface-3 rounded">
                    {doc.client.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                </span>
                {doc.wordCount && doc.wordCount > 0 && (
                  <span>{doc.wordCount.toLocaleString()} words</span>
                )}
              </div>
            </div>

            {/* Sync Status */}
            <div
              className={cn("flex items-center gap-1.5 text-xs", syncStatus.color)}
              title={syncStatus.label}
            >
              <SyncIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{syncStatus.label}</span>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                }}
                className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4 text-ltd-text-2" />
              </button>

              {openMenuId === doc.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-ltd-surface-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] shadow-lg z-10">
                  {doc.syncStatus !== "SYNCED" && onSyncClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSyncClick(doc);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-text-1 hover:bg-ltd-surface-3 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Sync to Google
                    </button>
                  )}
                  {doc.googleDocUrl && (
                    <a
                      href={doc.googleDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ltd-text-1 hover:bg-ltd-surface-3 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google
                    </a>
                  )}
                  {onDeleteClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(doc);
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
        );
      })}
    </div>
  );
}
