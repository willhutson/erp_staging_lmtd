"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  FolderPlus,
  Upload,
  X,
  Folder,
  ChevronRight,
} from "lucide-react";
import { FileUploader } from "@/components/files/FileUploader";
import { FileGrid } from "@/components/files/FileGrid";
import { createFolder } from "@/modules/files/actions/file-actions";
import type { FileRecord, FileCategory, FolderRecord } from "@/types/prisma-types";

interface FileWithUploader extends FileRecord {
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

interface FolderWithCounts extends FolderRecord {
  _count: {
    files: number;
    children: number;
  };
}

interface Props {
  initialFiles: FileWithUploader[];
  initialFolders: FolderWithCounts[];
}

const categories: { value: FileCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Files" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "DOCUMENT", label: "Documents" },
  { value: "DESIGN_FILE", label: "Design Files" },
  { value: "LOGO", label: "Logos" },
  { value: "BRAND_ASSET", label: "Brand Assets" },
  { value: "OTHER", label: "Other" },
];

export function FilesClient({ initialFiles, initialFolders }: Props) {
  const router = useRouter();
  const [files, _setFiles] = useState(initialFiles);
  const [folders, _setFolders] = useState(initialFolders);
  // Suppress unused warnings - will be used for real-time updates
  void _setFiles;
  void _setFolders;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FileCategory | "ALL">("ALL");
  const [showUploader, setShowUploader] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      !search ||
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      file.originalName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "ALL" || file.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleRefresh = () => {
    router.refresh();
  };

  const handleUploadComplete = () => {
    handleRefresh();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreating(true);
    const result = await createFolder({ name: newFolderName.trim() });

    if (result.success) {
      setNewFolderName("");
      setShowNewFolder(false);
      handleRefresh();
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as FileCategory | "ALL")
            }
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <button
          onClick={() => setShowNewFolder(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>

        <button
          onClick={() => setShowUploader(!showUploader)}
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      {/* Upload area */}
      {showUploader && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Upload Files</h3>
            <button
              onClick={() => setShowUploader(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUploader
            category={category === "ALL" ? undefined : category}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* New folder modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creating}
                className="px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0] transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <button
                key={folder.id}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Folder className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {folder.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {folder._count.files} files
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">
            Files ({filteredFiles.length})
          </h3>
        </div>
        <FileGrid
          files={filteredFiles}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
