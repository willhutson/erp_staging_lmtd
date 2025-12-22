import { Suspense } from "react";
import Link from "next/link";
import { Plus, Folder, Image, Video, FileText, Music, Archive } from "lucide-react";
import { getAssetLibraries, getAssetStats } from "@/modules/dam/actions/asset-actions";
import type { LibraryType } from "@/modules/dam/actions/asset-actions";

const libraryTypeConfig: Record<LibraryType, { label: string; color: string; icon: React.ReactNode }> = {
  GENERAL: { label: "General", color: "bg-gray-100 text-gray-700", icon: <Folder className="w-4 h-4" /> },
  BRAND: { label: "Brand", color: "bg-purple-100 text-purple-700", icon: <Image className="w-4 h-4" /> },
  STOCK: { label: "Stock", color: "bg-blue-100 text-blue-700", icon: <Image className="w-4 h-4" /> },
  CLIENT: { label: "Client", color: "bg-green-100 text-green-700", icon: <Folder className="w-4 h-4" /> },
  PROJECT: { label: "Project", color: "bg-orange-100 text-orange-700", icon: <FileText className="w-4 h-4" /> },
  ARCHIVE: { label: "Archive", color: "bg-gray-100 text-gray-600", icon: <Archive className="w-4 h-4" /> },
};

async function AssetStats() {
  const stats = await getAssetStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Folder className="w-4 h-4" />
          Libraries
        </div>
        <p className="text-2xl font-bold mt-1">{stats.libraries}</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Image className="w-4 h-4" />
          Total Assets
        </div>
        <p className="text-2xl font-bold mt-1">{stats.assets}</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <FileText className="w-4 h-4" />
          Pending Review
        </div>
        <p className="text-2xl font-bold mt-1">{stats.pending}</p>
      </div>
    </div>
  );
}

async function AssetLibrariesList() {
  const libraries = await getAssetLibraries();

  if (libraries.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No asset libraries</h3>
        <p className="text-gray-500 mt-1 mb-4">
          Create your first asset library to start organizing digital assets.
        </p>
        <Link
          href="/assets/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Library
        </Link>
      </div>
    );
  }

  type Library = Awaited<ReturnType<typeof getAssetLibraries>>[number];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {libraries.map((library: Library) => {
        const config = libraryTypeConfig[library.libraryType as LibraryType];
        return (
          <Link
            key={library.id}
            href={`/assets/${library.id}`}
            className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${config.color.split(" ")[0]} flex items-center justify-center`}>
                {config.icon}
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 group-hover:text-[#52EDC7] transition-colors">
              {library.name}
            </h3>

            {library.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {library.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Image className="w-4 h-4" />
                {library._count.assets} assets
              </span>
              <span className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                {library._count.folders} folders
              </span>
            </div>

            {library.client && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Client: <span className="font-medium">{library.client.name}</span>
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>
          <p className="text-gray-500 mt-1">Manage your digital assets and media files</p>
        </div>
        <Link
          href="/assets/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Library
        </Link>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-lg border p-4 h-24 animate-pulse" />)}</div>}>
        <AssetStats />
      </Suspense>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Libraries</h2>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg border p-5 h-40 animate-pulse" />)}</div>}>
          <AssetLibrariesList />
        </Suspense>
      </div>
    </div>
  );
}
