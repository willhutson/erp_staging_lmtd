"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  Image,
  Video,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SocialPlatform, ContentPostStatus } from "@prisma/client";

interface Post {
  id: string;
  title: string;
  platforms: SocialPlatform[];
  contentType: string;
  status: ContentPostStatus;
  scheduledFor: Date | null;
  createdAt: Date;
  client: { id: string; name: string; code: string };
  createdBy: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
  assets: Array<{ id: string; type: string; thumbnailUrl: string | null; fileUrl: string }>;
  _count: { contentComments: number; approvals: number };
}

interface Client {
  id: string;
  name: string;
  code: string;
}

interface PostsListClientProps {
  posts: Post[];
  clients: Client[];
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM_FEED: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_STORY: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_REEL: <Instagram className="w-4 h-4 text-pink-500" />,
  FACEBOOK_PAGE: <Facebook className="w-4 h-4 text-blue-600" />,
  FACEBOOK_STORY: <Facebook className="w-4 h-4 text-blue-600" />,
  THREADS: <Globe className="w-4 h-4 text-gray-800" />,
  TIKTOK: <Music2 className="w-4 h-4 text-gray-800" />,
  YOUTUBE_VIDEO: <Youtube className="w-4 h-4 text-red-600" />,
  YOUTUBE_SHORT: <Youtube className="w-4 h-4 text-red-600" />,
  LINKEDIN_PAGE: <Linkedin className="w-4 h-4 text-blue-700" />,
  LINKEDIN_PERSONAL: <Linkedin className="w-4 h-4 text-blue-700" />,
  LINKEDIN_ARTICLE: <Linkedin className="w-4 h-4 text-blue-700" />,
  X_TWEET: <Twitter className="w-4 h-4 text-gray-800" />,
  X_THREAD: <Twitter className="w-4 h-4 text-gray-800" />,
  WORDPRESS: <Globe className="w-4 h-4 text-blue-500" />,
  CUSTOM_CMS: <Globe className="w-4 h-4 text-gray-500" />,
};

const statusColors: Record<ContentPostStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  INTERNAL_REVIEW: "bg-yellow-100 text-yellow-700",
  CLIENT_REVIEW: "bg-orange-100 text-orange-700",
  REVISION_REQUESTED: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHING: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<ContentPostStatus, string> = {
  DRAFT: "Draft",
  INTERNAL_REVIEW: "Internal Review",
  CLIENT_REVIEW: "Client Review",
  REVISION_REQUESTED: "Revisions",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHING: "Publishing",
  PUBLISHED: "Published",
  FAILED: "Failed",
  ARCHIVED: "Archived",
};

export function PostsListClient({ posts, clients }: PostsListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (search && !post.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedClient && post.client.id !== selectedClient) {
        return false;
      }
      if (selectedStatus && post.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [posts, search, selectedClient, selectedStatus]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedClient || "all"}
          onValueChange={(v) => setSelectedClient(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus || "all"}
          onValueChange={(v) => setSelectedStatus(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Link href="/content-engine/posts/new">
          <Button className="bg-[#52EDC7] hover:bg-[#3dd9b3] text-gray-900">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/content-engine/posts/${post.id}`}>
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100 relative">
                {post.assets[0]?.thumbnailUrl || post.assets[0]?.fileUrl ? (
                  <img
                    src={post.assets[0].thumbnailUrl || post.assets[0].fileUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {post.contentType.includes("VIDEO") ? (
                      <Video className="w-12 h-12 text-gray-300" />
                    ) : (
                      <Image className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                )}
                
                {/* Platform badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {post.platforms.slice(0, 3).map((p) => (
                    <div
                      key={p}
                      className="bg-white rounded-full p-1 shadow-sm"
                    >
                      {platformIcons[p]}
                    </div>
                  ))}
                  {post.platforms.length > 3 && (
                    <div className="bg-white rounded-full px-2 py-1 shadow-sm text-xs">
                      +{post.platforms.length - 3}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="absolute bottom-2 right-2">
                  <Badge className={cn("text-xs", statusColors[post.status])}>
                    {statusLabels[post.status]}
                  </Badge>
                </div>
              </div>
            </Link>

            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/content-engine/posts/${post.id}`}
                    className="font-medium text-gray-900 hover:text-[#52EDC7] truncate block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500">{post.client.name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/content-engine/posts/${post.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/content-engine/posts/${post.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {post.scheduledFor && (
                <p className="text-xs text-gray-400 mt-2">
                  Scheduled: {new Date(post.scheduledFor).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                <span>By {post.createdBy.name}</span>
                {post._count.contentComments > 0 && (
                  <span>{post._count.contentComments} comments</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No posts found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your filters or create a new post
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
