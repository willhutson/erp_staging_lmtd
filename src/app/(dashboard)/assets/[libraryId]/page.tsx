import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Upload,
  Folder,
  FolderPlus,
  Image,
  Video,
  FileText,
  Music,
  File,
  MoreHorizontal,
  Grid,
  List,
  Search,
} from "lucide-react";
import { getAssetLibrary } from "@/modules/dam/actions/asset-actions";
import type { AssetType } from "@/modules/dam/actions/asset-actions";
import { cn } from "@/lib/utils";

const assetTypeConfig: Record<AssetType, { label: string; color: string; icon: React.ReactNode }> = {
  IMAGE: { label: "Image", color: "bg-blue-100 text-blue-700", icon: <Image className="w-4 h-4" /> },
  VIDEO: { label: "Video", color: "bg-purple-100 text-purple-700", icon: <Video className="w-4 h-4" /> },
  AUDIO: { label: "Audio", color: "bg-green-100 text-green-700", icon: <Music className="w-4 h-4" /> },
  DOCUMENT: { label: "Document", color: "bg-orange-100 text-orange-700", icon: <FileText className="w-4 h-4" /> },
  DESIGN: { label: "Design", color: "bg-pink-100 text-pink-700", icon: <File className="w-4 h-4" /> },
  FONT: { label: "Font", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  TEMPLATE: { label: "Template", color: "bg-indigo-100 text-indigo-700", icon: <FileText className="w-4 h-4" /> },
  OTHER: { label: "Other", color: "bg-gray-100 text-gray-600", icon: <File className="w-4 h-4" /> },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface Props {
  params: Promise<{ libraryId: string }>;
}

type Library = NonNullable<Awaited<ReturnType<typeof getAssetLibrary>>>;
type LibraryFolder = Library["folders"][number];
type LibraryAsset = Library["assets"][number];

async function LibraryContent({ libraryId }: { libraryId: string }) {
  const library = await getAssetLibrary(libraryId);

  if (!library) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/assets"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{library.name}</h1>
            <p className="text-gray-500 mt-0.5">
              {library._count.assets} assets · {library._count.folders} folders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 bg-white rounded-lg border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          <button className="p-2 bg-gray-100 text-gray-700 rounded">
            <Grid className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      {library.folders.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {library.folders.map((folder: LibraryFolder) => (
              <Link
                key={folder.id}
                href={`/assets/${libraryId}/folder/${folder.id}`}
                className="flex flex-col items-center p-4 bg-white rounded-lg border hover:shadow-md transition-shadow group"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: folder.color ? `${folder.color}20` : "#f3f4f6" }}
                >
                  <Folder
                    className="w-6 h-6"
                    style={{ color: folder.color || "#6b7280" }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center group-hover:text-[#52EDC7] transition-colors">
                  {folder.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Assets</h2>
        {library.assets.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No assets yet</h3>
            <p className="text-gray-500 mt-1 mb-4">
              Upload your first asset to this library.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors">
              <Upload className="w-4 h-4" />
              Upload Asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {library.assets.map((asset: LibraryAsset) => {
              const config = assetTypeConfig[asset.assetType as AssetType];
              return (
                <Link
                  key={asset.id}
                  href={`/assets/${libraryId}/asset/${asset.id}`}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 relative">
                    {asset.file.thumbnailUrl ? (
                      <img
                        src={asset.file.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.color)}>
                          {config.icon}
                        </div>
                      </div>
                    )}
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#52EDC7] transition-colors">
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatFileSize(asset.file.size)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LibraryPage({ params }: Props) {
  const { libraryId } = await params;

  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse w-64" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <LibraryContent libraryId={libraryId} />
      </Suspense>
    </div>
  );
}
