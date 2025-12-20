"use client";

import { useState } from "react";
import {
  File,
  Image,
  Video,
  FileText,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Folder,
  Grid,
  List,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { File as FileType, FileCategory } from "@prisma/client";
import { archiveFile } from "@/modules/files/actions/file-actions";

interface FileWithUploader extends FileType {
  uploadedBy?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  folder?: {
    id: string;
    name: string;
    path: string;
  } | null;
}

interface Props {
  files: FileWithUploader[];
  onFileSelect?: (file: FileWithUploader) => void;
  onRefresh?: () => void;
}

const categoryColors: Record<FileCategory, string> = {
  BRIEF_ATTACHMENT: "bg-blue-100 text-blue-700",
  DELIVERABLE: "bg-green-100 text-green-700",
  CONTRACT: "bg-yellow-100 text-yellow-700",
  BRAND_ASSET: "bg-purple-100 text-purple-700",
  REFERENCE: "bg-orange-100 text-orange-700",
  INVOICE: "bg-red-100 text-red-700",
  PROFILE_PHOTO: "bg-pink-100 text-pink-700",
  IMAGE: "bg-green-100 text-green-700",
  VIDEO: "bg-red-100 text-red-700",
  AUDIO: "bg-orange-100 text-orange-700",
  DOCUMENT: "bg-yellow-100 text-yellow-700",
  DESIGN_FILE: "bg-pink-100 text-pink-700",
  LOGO: "bg-purple-100 text-purple-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export function FileGrid({ files, onFileSelect, onRefresh }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const result = await archiveFile(fileId);
    if (result.success) {
      onRefresh?.();
    }
    setMenuOpen(null);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No files yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload files to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition-colors ${
              view === "grid"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-colors ${
              view === "list"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className={`group relative bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                  selectedId === file.id
                    ? "ring-2 ring-[#52EDC7] border-[#52EDC7]"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setSelectedId(file.id);
                  onFileSelect?.(file);
                }}
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                  {isImage(file.mimeType) && file.cdnUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.cdnUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-12 h-12 text-gray-300" />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {file.cdnUrl && (
                      <a
                        href={file.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={file.cdnUrl || "#"}
                      download={file.originalName}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p
                    className="font-medium text-gray-900 truncate text-sm"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        categoryColors[file.category]
                      }`}
                    >
                      {file.category.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Menu button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === file.id ? null : file.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                {menuOpen === file.id && (
                  <div
                    className="absolute top-10 right-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {file.cdnUrl && (
                      <a
                        href={file.cdnUrl}
                        download={file.originalName}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Uploaded
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                return (
                  <tr
                    key={file.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedId === file.id ? "bg-[#52EDC7]/5" : ""
                    }`}
                    onClick={() => {
                      setSelectedId(file.id);
                      onFileSelect?.(file);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {isImage(file.mimeType) && file.cdnUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={file.cdnUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Icon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.extension?.toUpperCase() || "FILE"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          categoryColors[file.category]
                        }`}
                      >
                        {file.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(file.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === file.id ? null : file.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {menuOpen === file.id && (
                        <div
                          className="absolute top-full right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {file.cdnUrl && (
                            <a
                              href={file.cdnUrl}
                              download={file.originalName}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
