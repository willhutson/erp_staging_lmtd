"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Clock,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  semanticSearch,
  hybridSearch,
} from "@/modules/content-engine/services/semantic-search";
import type { SearchResponse } from "@/modules/content-engine/services/semantic-search";

const DOC_TYPE_COLORS: Record<string, string> = {
  SKILL: "bg-purple-100 text-purple-700",
  PERSONA: "bg-blue-100 text-blue-700",
  PROCEDURE: "bg-green-100 text-green-700",
  POLICY: "bg-red-100 text-red-700",
  CHECKLIST: "bg-yellow-100 text-yellow-700",
  PLAYBOOK: "bg-orange-100 text-orange-700",
  TEMPLATE: "bg-pink-100 text-pink-700",
  REFERENCE: "bg-gray-100 text-gray-700",
};

export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searchMode, setSearchMode] = useState<"semantic" | "hybrid">("hybrid");
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) return;

    startTransition(async () => {
      const searchFn = searchMode === "hybrid" ? hybridSearch : semanticSearch;
      const response = await searchFn(query, {
        limit: 10,
        minScore: 0.3,
        includeContent: true,
      });
      setResults(response);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for procedures, skills, policies..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 border rounded-lg p-1">
          <button
            onClick={() => setSearchMode("hybrid")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              searchMode === "hybrid"
                ? "bg-[#52EDC7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setSearchMode("semantic")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              searchMode === "semantic"
                ? "bg-[#52EDC7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Semantic
          </button>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isPending || !query.trim()}
          className="bg-[#52EDC7] hover:bg-[#1BA098] text-white"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Found {results.totalResults} results in {results.searchTime}ms
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {results.metadata.tokensUsed} tokens used
            </span>
          </div>

          {/* Results List */}
          {results.results.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No results found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different keywords or broaden your search
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.results.map((result, index) => (
                <SearchResultCard key={`${result.documentId}-${result.chunkIndex}`} result={result} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!results && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto text-[#52EDC7] mb-4" />
          <p className="text-gray-600 font-medium">
            AI-Powered Knowledge Search
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            Search uses semantic understanding to find relevant content, even if
            your query uses different words than the documents.
          </p>
        </div>
      )}
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResponse["results"][number];
  rank: number;
}

function SearchResultCard({ result, rank }: SearchResultCardProps) {
  const relevancePercent = Math.round(result.score * 100);
  const typeColor = DOC_TYPE_COLORS[result.document.documentType] || DOC_TYPE_COLORS.REFERENCE;

  return (
    <div className="border rounded-lg p-4 hover:border-[#52EDC7] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Type */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-400">#{rank}</span>
            <Link
              href={`/content-engine/knowledge${result.document.path}`}
              className="font-medium text-gray-900 hover:text-[#52EDC7] truncate"
            >
              {result.document.title}
            </Link>
            <Badge className={typeColor} variant="secondary">
              {result.document.documentType}
            </Badge>
          </div>

          {/* Path */}
          <p className="text-sm text-gray-500 mb-2">{result.document.path}</p>

          {/* Highlight/Content */}
          {result.highlight && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {result.highlight}
            </p>
          )}
        </div>

        {/* Relevance Score */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#52EDC7] transition-all"
                style={{ width: `${relevancePercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 w-10 text-right">
              {relevancePercent}%
            </span>
          </div>
          <Link
            href={`/content-engine/knowledge${result.document.path}`}
            className="text-xs text-[#52EDC7] hover:underline flex items-center gap-1"
          >
            View <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
