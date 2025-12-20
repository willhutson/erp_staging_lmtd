"use client";

import { useState } from "react";
import {
  File,
  Image,
  Video,
  FileText,
  Plus,
  X,
  Download,
  Eye,
  Paperclip,
  Loader2,
} from "lucide-react";
import { FileUploader } from "./FileUploader";
import {
  attachFileToBrief,
  detachFileFromBrief,
} from "@/modules/files/actions/file-actions";
import type { File as FileType } from "@prisma/client";

interface Props {
  briefId: string;
  files: FileType[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

export function BriefFileAttachments({
  briefId,
  files,
  canEdit = true,
  onRefresh,
}: Props) {
  const [showUploader, setShowUploader] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

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

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  const handleUploadComplete = async (uploadedFile: {
    id: string;
    name: string;
  }) => {
    // Attach the uploaded file to this brief
    await attachFileToBrief({
      briefId,
      fileId: uploadedFile.id,
      role: "attachment",
    });
    setShowUploader(false);
    onRefresh?.();
  };

  const handleRemove = async (fileId: string) => {
    setRemoving(fileId);
    await detachFileFromBrief(briefId, fileId);
    onRefresh?.();
    setRemoving(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Attachments ({files.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-1.5 text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium"
          >
            <Plus className="w-4 h-4" />
            Add File
          </button>
        )}
      </div>

      {showUploader && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <FileUploader
            category="OTHER"
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error(error)}
          />
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No files attached</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
              >
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {isImage(file.mimeType) && file.cdnUrl ? (
                    <img
                      src={file.cdnUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.cdnUrl && (
                    <>
                      <a
                        href={file.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.cdnUrl}
                        download={file.originalName}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleRemove(file.id)}
                      disabled={removing === file.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      {removing === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
