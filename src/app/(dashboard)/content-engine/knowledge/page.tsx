import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { KnowledgeDocumentType, Prisma } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Book,
  Lightbulb,
  FolderOpen,
  Search,
  Plus,
  ArrowLeft,
  Clock,
  Eye
} from "lucide-react";

// Inferred type from Prisma
type KnowledgeDocRecord = Awaited<ReturnType<typeof db.knowledgeDocument.findMany>>[number];

const DOCUMENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PROCEDURE: { icon: <FileText className="h-4 w-4" />, label: "Procedure", color: "bg-blue-100 text-blue-700" },
  PLAYBOOK: { icon: <Book className="h-4 w-4" />, label: "Playbook", color: "bg-purple-100 text-purple-700" },
  TEMPLATE: { icon: <FileText className="h-4 w-4" />, label: "Template", color: "bg-green-100 text-green-700" },
  REFERENCE: { icon: <FolderOpen className="h-4 w-4" />, label: "Reference", color: "bg-gray-100 text-gray-700" },
  SKILL_DEFINITION: { icon: <Lightbulb className="h-4 w-4" />, label: "Skill", color: "bg-yellow-100 text-yellow-700" },
  PERSONA: { icon: <FileText className="h-4 w-4" />, label: "Persona", color: "bg-pink-100 text-pink-700" },
  CASE_STUDY: { icon: <Book className="h-4 w-4" />, label: "Case Study", color: "bg-indigo-100 text-indigo-700" },
  LESSON_LEARNED: { icon: <Lightbulb className="h-4 w-4" />, label: "Lesson", color: "bg-orange-100 text-orange-700" },
};

interface SearchParams {
  type?: string;
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function KnowledgePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Build filter
  const where: Prisma.KnowledgeDocumentWhereInput = {
    organizationId: session.user.organizationId,
  };

  if (params.type) {
    where.documentType = params.type as KnowledgeDocumentType;
  }

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { content: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const documents = await db.knowledgeDocument.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // Get counts by type
  const typeCounts = await db.knowledgeDocument.groupBy({
    by: ["documentType"],
    where: { organizationId: session.user.organizationId },
    _count: true,
  });

  const typeCountMap: Record<string, number> = {};
  for (const item of typeCounts) {
    typeCountMap[item.documentType] = item._count;
  }

  const totalDocs = documents.length;

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
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-500 mt-1">
              Procedures, playbooks, and institutional knowledge
            </p>
          </div>
        </div>
        <Button className="bg-[#52EDC7] hover:bg-[#1BA098] text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search knowledge base..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>

            <select
              name="type"
              defaultValue={params.type}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            >
              <option value="">All Types</option>
              {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label} ({typeCountMap[type] || 0})
                </option>
              ))}
            </select>

            <Button type="submit" variant="secondary">
              Search
            </Button>

            {(params.type || params.q) && (
              <Link href="/content-engine/knowledge">
                <Button variant="ghost">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Type Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(DOCUMENT_TYPE_CONFIG).slice(0, 4).map(([type, config]) => (
          <Link key={type} href={`/content-engine/knowledge?type=${type}`}>
            <Card className="hover:border-[#52EDC7] transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {config.icon}
                  {config.label}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeCountMap[type] || 0}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({totalDocs})</CardTitle>
          <CardDescription>
            {params.type
              ? `Showing ${DOCUMENT_TYPE_CONFIG[params.type]?.label || params.type} documents`
              : "All knowledge documents"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">
                {params.q || params.type
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first knowledge document"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: KnowledgeDocRecord) => {
                const typeConfig = DOCUMENT_TYPE_CONFIG[doc.documentType] || DOCUMENT_TYPE_CONFIG.REFERENCE;
                return (
                  <Link
                    key={doc.id}
                    href={`/content-engine/knowledge/${doc.slug}`}
                    className="block p-4 rounded-lg border hover:border-[#52EDC7] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          <Badge className={typeConfig.color}>
                            {typeConfig.icon}
                            <span className="ml-1">{typeConfig.label}</span>
                          </Badge>
                          <Badge variant={doc.status === "PUBLISHED" ? "default" : "secondary"}>
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {doc.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(doc.updatedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            v{doc.version}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
