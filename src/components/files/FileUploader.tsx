"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, File, Image, Video, FileText, Loader2 } from "lucide-react";
import type { FileCategory } from "@prisma/client";

interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  cdnUrl?: string | null;
  category: FileCategory;
}

interface Props {
  category?: FileCategory;
  folderId?: string;
  onUploadComplete?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
}

interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
  result?: UploadedFile;
}

export function FileUploader({
  category = "OTHER",
  folderId,
  onUploadComplete,
  onError,
  accept,
  maxSize = 100,
  multiple = true,
  className = "",
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.startsWith("video/")) return Video;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return FileText;
    return File;
  };

  const uploadFile = async (queuedFile: QueuedFile) => {
    const { file } = queuedFile;

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      setQueue((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id
            ? { ...f, status: "error", error: `File too large (max ${maxSize}MB)` }
            : f
        )
      );
      onError?.(`File too large (max ${maxSize}MB)`);
      return;
    }

    // Update status to uploading
    setQueue((prev) =>
      prev.map((f) =>
        f.id === queuedFile.id ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (folderId) formData.append("folderId", folderId);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      setQueue((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id
            ? { ...f, status: "complete", progress: 100, result: result.file }
            : f
        )
      );

      onUploadComplete?.(result.file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setQueue((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id ? { ...f, status: "error", error: message } : f
        )
      );
      onError?.(message);
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newQueue: QueuedFile[] = fileArray.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "pending" as const,
      }));

      setQueue((prev) => [...prev, ...newQueue]);

      // Start uploads
      newQueue.forEach((qf) => uploadFile(qf));
    },
    [category, folderId, maxSize, onUploadComplete, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(multiple ? files : [files[0]]);
      }
    },
    [handleFiles, multiple]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const activeUploads = queue.filter(
    (f) => f.status === "pending" || f.status === "uploading"
  );
  const completedUploads = queue.filter((f) => f.status === "complete");

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-[#52EDC7] bg-[#52EDC7]/5"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDragging ? "bg-[#52EDC7]/20" : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-6 h-6 ${
                isDragging ? "text-[#52EDC7]" : "text-gray-400"
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-gray-700">
              {isDragging ? "Drop files here" : "Drag files here or click to browse"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {multiple ? "Upload multiple files" : "Upload a file"} (max {maxSize}
              MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Upload queue */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          {queue.map((qf) => {
            const Icon = getFileIcon(qf.file.type);
            return (
              <div
                key={qf.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  qf.status === "error"
                    ? "border-red-200 bg-red-50"
                    : qf.status === "complete"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    qf.status === "error"
                      ? "bg-red-100"
                      : qf.status === "complete"
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      qf.status === "error"
                        ? "text-red-600"
                        : qf.status === "complete"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {qf.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {qf.status === "error"
                      ? qf.error
                      : qf.status === "complete"
                      ? "Uploaded"
                      : qf.status === "uploading"
                      ? "Uploading..."
                      : formatFileSize(qf.file.size)}
                  </p>
                </div>

                {qf.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-[#52EDC7] animate-spin" />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(qf.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Status summary */}
      {activeUploads.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Uploading {activeUploads.length} file
          {activeUploads.length > 1 ? "s" : ""}...
        </p>
      )}
    </div>
  );
}
