"use client";

/**
 * File Upload Component for Chat
 *
 * Handles file selection, preview, and upload for chat messages.
 *
 * @module chat/components/FileUpload
 */

import { useState, useCallback, useRef } from "react";
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  uploading: boolean;
  progress: number;
  error?: string;
  uploaded?: {
    url: string;
    thumbnailUrl?: string;
  };
}

export interface FileUploadProps {
  onFilesSelected: (files: FileUploadItem[]) => void;
  onFileRemove: (fileId: string) => void;
  files: FileUploadItem[];
  disabled?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

// File type icons
const FILE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  default: <File className="h-4 w-4" />,
};

// ============================================
// HELPERS
// ============================================

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getFileType(file: File): string {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type.includes("document") ||
    file.type.includes("word") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  ) {
    return "document";
  }
  return "default";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createPreview(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

// ============================================
// UPLOAD BUTTON (Trigger)
// ============================================

export function FileUploadButton({
  onFilesSelected,
  disabled,
  maxFiles = 10,
  maxSizeBytes = 25 * 1024 * 1024, // 25MB default
  acceptedTypes,
}: {
  onFilesSelected: (files: FileUploadItem[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList).slice(0, maxFiles);
      const items: FileUploadItem[] = [];

      for (const file of files) {
        // Validate size
        if (file.size > maxSizeBytes) {
          items.push({
            id: generateId(),
            file,
            uploading: false,
            progress: 0,
            error: `File too large (max ${formatFileSize(maxSizeBytes)})`,
          });
          continue;
        }

        // Create preview for images
        const preview = await createPreview(file);

        items.push({
          id: generateId(),
          file,
          preview,
          uploading: false,
          progress: 0,
        });
      }

      onFilesSelected(items);
      setOpen(false);
    },
    [maxFiles, maxSizeBytes, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, {formatFileSize(maxSizeBytes)} each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes?.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// FILE PREVIEW STRIP
// ============================================

export function FilePreviewStrip({
  files,
  onRemove,
}: {
  files: FileUploadItem[];
  onRemove: (id: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/30">
      {files.map((item) => (
        <FilePreviewItem key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}

function FilePreviewItem({
  item,
  onRemove,
}: {
  item: FileUploadItem;
  onRemove: (id: string) => void;
}) {
  const fileType = getFileType(item.file);
  const isImage = fileType === "image";

  return (
    <div
      className={cn(
        "relative group rounded-lg border overflow-hidden",
        isImage ? "w-20 h-20" : "flex items-center gap-2 px-3 py-2",
        item.error && "border-destructive bg-destructive/10"
      )}
    >
      {/* Image preview */}
      {isImage && item.preview && (
        <img
          src={item.preview}
          alt={item.file.name}
          className="w-full h-full object-cover"
        />
      )}

      {/* Non-image file */}
      {!isImage && (
        <>
          <span className="text-muted-foreground">
            {FILE_ICONS[fileType] || FILE_ICONS.default}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate max-w-[120px]">
              {item.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(item.file.size)}
            </p>
          </div>
        </>
      )}

      {/* Uploading overlay */}
      {item.uploading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {/* Error indicator */}
      {item.error && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
          <span className="text-xs text-destructive px-1 text-center">
            {item.error}
          </span>
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.id)}
        className={cn(
          "absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-destructive hover:text-destructive-foreground"
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================
// MESSAGE ATTACHMENT DISPLAY
// ============================================

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

export function MessageAttachments({
  attachments,
}: {
  attachments: MessageAttachment[];
}) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => a.fileType.startsWith("image/"));
  const files = attachments.filter((a) => !a.fileType.startsWith("image/"));

  return (
    <div className="mt-2 space-y-2">
      {/* Image gallery */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <a
              key={img.id}
              href={img.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
            >
              <img
                src={img.thumbnailUrl || img.fileUrl}
                alt={img.fileName}
                className="max-w-[300px] max-h-[200px] object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => {
            const type = file.fileType.includes("pdf")
              ? "pdf"
              : file.fileType.includes("document") || file.fileType.includes("word")
              ? "document"
              : "default";

            return (
              <a
                key={file.id}
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">
                  {FILE_ICONS[type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileUploadButton;
