import { Suspense } from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { KnowledgeSearch } from "./KnowledgeSearch";
import { getEmbeddingStats } from "@/modules/content-engine/services/embedding-service";

export default async function SearchPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const stats = await getEmbeddingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#52EDC7]" />
              Knowledge Search
            </h1>
            <p className="text-gray-500 mt-1">
              AI-powered semantic search across your knowledge base
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Documents Indexed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.embeddedDocuments}
              <span className="text-lg text-gray-400 font-normal">
                /{stats.totalDocuments}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Chunks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalChunks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Embedding Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-gray-700">
              {stats.models[0] || "Not configured"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading search...</div>}>
            <KnowledgeSearch />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
