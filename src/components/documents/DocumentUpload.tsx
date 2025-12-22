"use client";

import { useState, useCallback, useTransition } from "react";
import { FileText, Upload, X, Download, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  createdAt: Date;
}

interface DocumentUploadProps {
  attachments: AttachmentData[];
  entityType: "brief" | "rfp";
  entityId: string;
  canUpload?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  onDelete?: (attachmentId: string) => Promise<void>;
}

export function DocumentUpload({
  attachments,
  entityType,
  entityId,
  canUpload = true,
  onUpload,
  onDelete,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canUpload) {
      setIsDragging(true);
    }
  }, [canUpload]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canUpload || !onUpload) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      startTransition(async () => {
        await onUpload(droppedFiles);
      });
    }
  }, [canUpload, onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0 && onUpload) {
      startTransition(async () => {
        await onUpload(selectedFiles);
      });
    }
  }, [onUpload]);

  const handleDelete = (attachmentId: string) => {
    if (!onDelete) return;
    setDeletingId(attachmentId);
    startTransition(async () => {
      await onDelete(attachmentId);
      setDeletingId(null);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📑";
    if (mimeType.includes("image")) return "🖼️";
    return "📎";
  };

  return (
    <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
      <div className="p-4 border-b border-ltd-border-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-ltd-text-2" />
          <h3 className="font-semibold text-ltd-text-1">Supporting Documents</h3>
          <span className="text-xs text-ltd-text-3 bg-ltd-surface-3 px-2 py-0.5 rounded-full">
            {attachments.length}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Existing attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-ltd-surface-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getFileIcon(attachment.mimeType)}</span>
                  <div>
                    <p className="text-sm font-medium text-ltd-text-1 truncate max-w-[300px]">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-ltd-text-3">
                      {formatFileSize(attachment.fileSize)} •{" "}
                      {new Date(attachment.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 hover:bg-ltd-surface-3 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-ltd-text-2" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      disabled={deletingId === attachment.id}
                      className="p-1.5 hover:bg-ltd-error/10 rounded transition-colors"
                      title="Remove"
                    >
                      {deletingId === attachment.id ? (
                        <Loader2 className="w-4 h-4 text-ltd-error animate-spin" />
                      ) : (
                        <X className="w-4 h-4 text-ltd-error" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        {canUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-[var(--ltd-radius-md)] border-2 border-dashed p-6 text-center transition-all",
              isDragging
                ? "border-ltd-primary bg-ltd-primary/10"
                : "border-ltd-border-2 hover:border-ltd-primary/50 hover:bg-ltd-surface-2",
              isPending && "opacity-50 pointer-events-none"
            )}
          >
            {isPending ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-ltd-primary animate-spin" />
                <p className="text-sm text-ltd-text-2">Uploading...</p>
              </div>
            ) : isDragging ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-ltd-primary animate-bounce" />
                <p className="text-sm font-medium text-ltd-primary">Drop files here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-ltd-text-3" />
                <p className="text-sm text-ltd-text-2">
                  Drag & drop files here, or{" "}
                  <label className="text-ltd-primary hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.png,.jpg,.jpeg"
                    />
                  </label>
                </p>
                <p className="text-xs text-ltd-text-3">
                  PDF, Word, Excel, PowerPoint, images
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {attachments.length === 0 && !canUpload && (
          <p className="text-sm text-ltd-text-3 text-center py-4">
            No documents attached
          </p>
        )}
      </div>
    </div>
  );
}
