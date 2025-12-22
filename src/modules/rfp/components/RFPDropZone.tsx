"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileStack, Upload, FileText, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RFPDropZoneProps {
  canCreate: boolean;
}

export function RFPDropZone({ canCreate }: RFPDropZoneProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canCreate) {
      setIsDragging(true);
    }
  }, [canCreate]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canCreate) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  }, [canCreate]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    // Store file info in sessionStorage for the form to pick up
    const fileInfo = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    sessionStorage.setItem("rfp_dropped_files", JSON.stringify(fileInfo));

    // For now, we'll just navigate. In the future, this could upload files
    // and pass IDs, or use a more sophisticated file handling approach
    router.push("/rfp/new?hasFiles=true");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  // If files are selected, show the file list with continue button
  if (files.length > 0) {
    return (
      <div className="rounded-[var(--ltd-radius-lg)] border-2 border-ltd-primary bg-ltd-primary/5 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-ltd-text-1">
              {files.length} document{files.length > 1 ? "s" : ""} ready
            </h3>
            <p className="text-sm text-ltd-text-2 mt-1">
              These will be attached to your new RFP
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors"
          >
            Continue to RFP
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] border border-ltd-border-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-ltd-text-1 truncate max-w-[300px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-ltd-text-3">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-ltd-surface-3 rounded transition-colors"
              >
                <X className="w-4 h-4 text-ltd-text-2" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-ltd-border-1 flex justify-between items-center">
          <label className="text-sm text-ltd-primary hover:underline cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
            />
            + Add more files
          </label>
          <button
            onClick={() => setFiles([])}
            className="text-sm text-ltd-text-2 hover:text-ltd-text-1"
          >
            Clear all
          </button>
        </div>
      </div>
    );
  }

  // Empty state with drop zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-[var(--ltd-radius-lg)] border-2 border-dashed p-12 text-center transition-all",
        isDragging
          ? "border-ltd-primary bg-ltd-primary/10 scale-[1.02]"
          : "border-ltd-border-2 bg-ltd-surface-overlay hover:border-ltd-primary/50 hover:bg-ltd-surface-2",
        !canCreate && "opacity-60 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
          isDragging ? "bg-ltd-primary/20" : "bg-ltd-surface-3"
        )}
      >
        {isDragging ? (
          <Upload className="w-8 h-8 text-ltd-primary animate-bounce" />
        ) : (
          <FileStack className="w-8 h-8 text-ltd-text-3" />
        )}
      </div>

      {isDragging ? (
        <p className="text-lg font-medium text-ltd-primary">Drop files here</p>
      ) : (
        <>
          <p className="text-lg font-medium text-ltd-text-1 mb-2">
            No active RFPs in the pipeline
          </p>
          {canCreate ? (
            <>
              <p className="text-ltd-text-2 mb-4">
                Drag & drop RFP documents here to get started
              </p>
              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Documents
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
                  />
                </label>
                <span className="text-ltd-text-3">or</span>
                <a
                  href="/rfp/new"
                  className="px-4 py-2 border border-ltd-border-1 text-ltd-text-1 font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
                >
                  Create Manually
                </a>
              </div>
              <p className="text-xs text-ltd-text-3 mt-4">
                Supports PDF, Word, Excel, and PowerPoint files
              </p>
            </>
          ) : (
            <p className="text-sm text-ltd-text-3">
              Contact an admin to create RFPs
            </p>
          )}
        </>
      )}
    </div>
  );
}
