"use client";

/**
 * Message Search Component
 *
 * Full-text search across chat messages with filters.
 *
 * @module chat/components/MessageSearch
 */

import { useState, useCallback, useEffect, useTransition } from "react";
import { Search, X, Filter, Hash, User, Calendar, Paperclip, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { searchMessages, type SearchResult } from "../actions/message-actions";
import { formatDistanceToNow } from "date-fns";

// ============================================
// TYPES
// ============================================

interface MessageSearchProps {
  organizationId: string;
  channels: Array<{ id: string; name: string; slug: string }>;
  users: Array<{ id: string; name: string; avatarUrl?: string | null }>;
  onSelectMessage: (result: SearchResult) => void;
  currentChannelId?: string;
}

interface SearchFilters {
  channelId?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  hasAttachments: boolean;
}

// ============================================
// SEARCH TRIGGER (for keyboard shortcut)
// ============================================

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border transition-colors"
    >
      <Search className="h-4 w-4" />
      <span>Search messages</span>
      <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-background rounded border">
        ⌘K
      </kbd>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MessageSearch({
  organizationId,
  channels,
  users,
  onSelectMessage,
  currentChannelId,
}: MessageSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    hasAttachments: false,
  });

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Search when query changes
  const performSearch = useCallback(
    (searchQuery: string, searchFilters: SearchFilters, offset = 0) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      startTransition(async () => {
        const response = await searchMessages({
          organizationId,
          query: searchQuery,
          channelId: searchFilters.channelId,
          userId: searchFilters.userId,
          fromDate: searchFilters.fromDate
            ? new Date(searchFilters.fromDate)
            : undefined,
          toDate: searchFilters.toDate
            ? new Date(searchFilters.toDate)
            : undefined,
          hasAttachments: searchFilters.hasAttachments || undefined,
          limit: 20,
          offset,
        });

        if (offset === 0) {
          setResults(response.results);
        } else {
          setResults((prev) => [...prev, ...response.results]);
        }
        setTotal(response.total);
        setHasMore(response.hasMore);
      });
    },
    [organizationId]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, performSearch]);

  // Reset on close
  const handleClose = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setTotal(0);
    setShowFilters(false);
    setFilters({ hasAttachments: false });
  };

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    onSelectMessage(result);
    handleClose();
  };

  // Load more
  const loadMore = () => {
    performSearch(query, filters, results.length);
  };

  // Highlight matching text
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Search Messages</DialogTitle>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10 pr-10"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button
                    variant={
                      filters.channelId ||
                      filters.userId ||
                      filters.fromDate ||
                      filters.hasAttachments
                        ? "secondary"
                        : "outline"
                    }
                    size="icon"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filters</h4>

                    {/* Channel Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Channel
                      </Label>
                      <Select
                        value={filters.channelId || "all"}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            channelId: v === "all" ? undefined : v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All channels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All channels</SelectItem>
                          {channels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              # {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* User Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        From
                      </Label>
                      <Select
                        value={filters.userId || "all"}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            userId: v === "all" ? undefined : v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Anyone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Anyone</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={filters.fromDate || ""}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              fromDate: e.target.value || undefined,
                            }))
                          }
                          placeholder="From"
                          className="flex-1"
                        />
                        <Input
                          type="date"
                          value={filters.toDate || ""}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              toDate: e.target.value || undefined,
                            }))
                          }
                          placeholder="To"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Has Attachments */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hasAttachments"
                        checked={filters.hasAttachments}
                        onCheckedChange={(checked) =>
                          setFilters((f) => ({
                            ...f,
                            hasAttachments: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="hasAttachments"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Paperclip className="h-4 w-4" />
                        Has attachments
                      </Label>
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setFilters({ hasAttachments: false })
                      }
                    >
                      Clear filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DialogHeader>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isPending && query.length >= 2 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
                Searching...
              </div>
            )}

            {!isPending && query.length >= 2 && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2" />
                <p>No messages found for "{query}"</p>
              </div>
            )}

            {query.length < 2 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>Type at least 2 characters to search</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {total} result{total !== 1 ? "s" : ""} found
                </p>

                <div className="space-y-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={result.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {result.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {result.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              in #{result.channel.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(result.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {result.hasAttachments && (
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlightMatch(result.snippet, query)}
                          </p>

                          {result.replyCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {result.replyCount} repl{result.replyCount === 1 ? "y" : "ies"}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full mt-3"
                    onClick={loadMore}
                    disabled={isPending}
                  >
                    Load more results
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MessageSearch;
