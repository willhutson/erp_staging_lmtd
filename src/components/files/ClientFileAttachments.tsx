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
  FolderOpen,
  Loader2,
} from "lucide-react";
import { FileUploader } from "./FileUploader";
import {
  attachFileToClient,
} from "@/modules/files/actions/file-actions";
import type { File as FileType, FileCategory } from "@prisma/client";

interface Props {
  clientId: string;
  files: FileType[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

const roleOptions = [
  { value: "logo", label: "Logo" },
  { value: "brand_asset", label: "Brand Asset" },
  { value: "document", label: "Document" },
  { value: "asset", label: "Other Asset" },
];

export function ClientFileAttachments({
  clientId,
  files,
  canEdit = true,
  onRefresh,
}: Props) {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedRole, setSelectedRole] = useState("asset");

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

  const getCategoryForRole = (role: string): FileCategory => {
    switch (role) {
      case "logo":
        return "LOGO";
      case "brand_asset":
        return "BRAND_ASSET";
      case "document":
        return "DOCUMENT";
      default:
        return "OTHER";
    }
  };

  const handleUploadComplete = async (uploadedFile: { id: string }) => {
    await attachFileToClient({
      clientId,
      fileId: uploadedFile.id,
      role: selectedRole,
    });
    setShowUploader(false);
    onRefresh?.();
  };

  // Group files by category
  const logos = files.filter((f) => f.category === "LOGO");
  const brandAssets = files.filter((f) => f.category === "BRAND_ASSET");
  const documents = files.filter((f) => f.category === "DOCUMENT");
  const otherFiles = files.filter(
    (f) =>
      !["LOGO", "BRAND_ASSET", "DOCUMENT"].includes(f.category)
  );

  const renderFileGroup = (groupFiles: FileType[], title: string) => {
    if (groupFiles.length === 0) return null;

    return (
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          {title}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {groupFiles.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  {isImage(file.mimeType) && file.cdnUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.cdnUrl}
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Icon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="p-2">
                  <p
                    className="text-xs font-medium text-gray-900 truncate"
                    title={file.originalName}
                  >
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {file.cdnUrl && (
                    <>
                      <a
                        href={file.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.cdnUrl}
                        download={file.originalName}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Client Assets ({files.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-1.5 text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload Asset
          </button>
        )}
      </div>

      {showUploader && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <FileUploader
            category={getCategoryForRole(selectedRole)}
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error(error)}
          />
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No assets uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderFileGroup(logos, "Logos")}
          {renderFileGroup(brandAssets, "Brand Assets")}
          {renderFileGroup(documents, "Documents")}
          {renderFileGroup(otherFiles, "Other Files")}
        </div>
      )}
    </div>
  );
}
