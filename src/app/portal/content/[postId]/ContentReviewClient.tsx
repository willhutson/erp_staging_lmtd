"use client";

/**
 * Content Review Client Component
 *
 * Provides interactive content review with:
 * - Platform-specific previews (Instagram, TikTok, LinkedIn, etc.)
 * - Approve/Reject/Request Revision actions
 * - Comment thread
 *
 * @module portal/content/[postId]/ContentReviewClient
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Loader2,
  Calendar,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/editor";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SocialPlatform, ContentType, ContentPostStatus } from "@prisma/client";

interface Asset {
  id: string;
  type: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  aspectRatio: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorType: "internal" | "client";
}

interface Post {
  id: string;
  title: string;
  caption: string;
  captionAr: string | null;
  platforms: SocialPlatform[];
  contentType: ContentType;
  hashtags: string[];
  mentions: string[];
  linkUrl: string | null;
  scheduledFor: string | null;
  status: ContentPostStatus;
  assets: Asset[];
}

interface ContentReviewClientProps {
  post: Post;
  approvalId: string | null;
  contactId: string;
  comments: Comment[];
}

// ============================================
// PLATFORM PREVIEW COMPONENTS
// ============================================

function InstagramPreview({ post }: { post: Post }) {
  const asset = post.assets[0];
  const isVideo = asset?.type === "VIDEO";
  const isCarousel = post.contentType === "CAROUSEL";

  return (
    <div className="bg-white border rounded-lg max-w-[375px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-xs font-bold">B</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">brand_name</p>
          <p className="text-xs text-gray-500">Sponsored</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-gray-100 relative">
        {asset?.fileUrl ? (
          <>
            <img
              src={asset.thumbnailUrl || asset.fileUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            )}
            {isCarousel && (
              <div className="absolute top-3 right-3 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
                1/{post.assets.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No media
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
          <Share2 className="w-6 h-6" />
        </div>
        <Bookmark className="w-6 h-6" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold">1,234 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold">brand_name </span>
          {post.caption.slice(0, 150)}
          {post.caption.length > 150 && "..."}
        </p>
        {post.hashtags.length > 0 && (
          <p className="text-sm text-blue-900 mt-1">
            {post.hashtags.join(" ")}
          </p>
        )}
      </div>
    </div>
  );
}

function TikTokPreview({ post }: { post: Post }) {
  const asset = post.assets[0];

  return (
    <div className="bg-black rounded-lg max-w-[280px] mx-auto overflow-hidden relative" style={{ aspectRatio: "9/16" }}>
      {/* Video */}
      {asset?.fileUrl ? (
        <img
          src={asset.thumbnailUrl || asset.fileUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
          No media
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex">
        {/* Right sidebar */}
        <div className="flex-1" />
        <div className="flex flex-col items-center justify-end gap-4 p-4 pb-20">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white" />
            <div className="w-5 h-5 bg-red-500 rounded-full -mt-2 flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Heart className="w-8 h-8 text-white" />
            <span className="text-white text-xs">1.2K</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="w-8 h-8 text-white" />
            <span className="text-white text-xs">234</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark className="w-8 h-8 text-white" />
            <span className="text-white text-xs">89</span>
          </div>
          <div className="flex flex-col items-center">
            <Share2 className="w-8 h-8 text-white" />
            <span className="text-white text-xs">Share</span>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-semibold text-sm">@brand_name</p>
        <p className="text-white text-sm line-clamp-2 mt-1">
          {post.caption.slice(0, 100)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Music2 className="w-4 h-4 text-white" />
          <p className="text-white text-xs">Original Sound</p>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ post }: { post: Post }) {
  const asset = post.assets[0];

  return (
    <div className="bg-white border rounded-lg max-w-[500px] mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-bold">B</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Brand Name</p>
          <p className="text-xs text-gray-500">Company • 1,234 followers</p>
          <p className="text-xs text-gray-400">1h • 🌐</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm whitespace-pre-wrap">
          {post.caption.slice(0, 300)}
          {post.caption.length > 300 && "... see more"}
        </p>
        {post.hashtags.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {post.hashtags.join(" ")}
          </p>
        )}
      </div>

      {/* Media */}
      {asset?.fileUrl && (
        <div className="aspect-video bg-gray-100">
          <img
            src={asset.thumbnailUrl || asset.fileUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Engagement */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b">
        <span>👍 ❤️ 123</span>
        <span>12 comments • 5 reposts</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around py-2">
        {["Like", "Comment", "Repost", "Send"].map((action) => (
          <button
            key={action}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm text-gray-600"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function XPreview({ post }: { post: Post }) {
  const asset = post.assets[0];

  return (
    <div className="bg-white border rounded-lg max-w-[500px] mx-auto p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm">Brand Name</span>
            <span className="text-gray-500 text-sm">@brand_name</span>
            <span className="text-gray-500 text-sm">• 1h</span>
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap">
            {post.caption.slice(0, 280)}
          </p>

          {asset?.fileUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border">
              <img
                src={asset.thumbnailUrl || asset.fileUrl}
                alt=""
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <Share2 className="w-4 h-4" />
            <Heart className="w-4 h-4" />
            <Bookmark className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ContentReviewClient({
  post,
  approvalId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contactId: _contactId,
  comments,
}: ContentReviewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(post.platforms[0]);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleApprove = () => {
    if (!approvalId) return;

    startTransition(async () => {
      const response = await fetch(`/api/content/${post.id}/approvals`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          status: "APPROVED",
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!approvalId) return;

    startTransition(async () => {
      const response = await fetch(`/api/content/${post.id}/approvals`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          status: "REJECTED",
          responseNotes: feedback,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    });
  };

  const handleRequestRevision = () => {
    if (!approvalId || !feedback) return;

    startTransition(async () => {
      const response = await fetch(`/api/content/${post.id}/approvals`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          status: "REVISION_REQUESTED",
          responseNotes: feedback,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    });
  };

  const platformTabs = post.platforms.map((p) => ({
    value: p,
    label: p.replace(/_/g, " ").replace(/INSTAGRAM|FACEBOOK|LINKEDIN|YOUTUBE|X /g, ""),
    icon:
      p.startsWith("INSTAGRAM") ? <Instagram className="w-4 h-4" /> :
      p.startsWith("FACEBOOK") ? <Facebook className="w-4 h-4" /> :
      p.startsWith("LINKEDIN") ? <Linkedin className="w-4 h-4" /> :
      p.startsWith("YOUTUBE") ? <Youtube className="w-4 h-4" /> :
      p.startsWith("X_") ? <Twitter className="w-4 h-4" /> :
      p === "TIKTOK" ? <Music2 className="w-4 h-4" /> :
      <Globe className="w-4 h-4" />,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview Column */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialPlatform)}>
              <TabsList className="mb-4">
                {platformTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2"
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-gray-100 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
                {activeTab.startsWith("INSTAGRAM") && <InstagramPreview post={post} />}
                {activeTab === "TIKTOK" && <TikTokPreview post={post} />}
                {activeTab.startsWith("LINKEDIN") && <LinkedInPreview post={post} />}
                {activeTab.startsWith("X_") && <XPreview post={post} />}
                {activeTab.startsWith("FACEBOOK") && <InstagramPreview post={post} />}
                {activeTab.startsWith("YOUTUBE") && <LinkedInPreview post={post} />}
                {!["INSTAGRAM", "TIKTOK", "LINKEDIN", "X_", "FACEBOOK", "YOUTUBE"].some(p => activeTab.startsWith(p)) && (
                  <div className="text-gray-500 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Preview not available for this platform</p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Details & Actions Column */}
      <div className="space-y-6">
        {/* Post Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Caption</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{post.caption}</p>
            </div>

            {post.captionAr && (
              <div>
                <p className="text-sm font-medium text-gray-500">Arabic Caption</p>
                <p className="text-sm mt-1 whitespace-pre-wrap" dir="rtl">
                  {post.captionAr}
                </p>
              </div>
            )}

            {post.hashtags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Hash className="w-4 h-4" /> Hashtags
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {post.linkUrl && (
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" /> Link
                </p>
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 block truncate"
                >
                  {post.linkUrl}
                </a>
              </div>
            )}

            {post.scheduledFor && (
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Scheduled For
                </p>
                <p className="text-sm mt-1">
                  {new Date(post.scheduledFor).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {approvalId && post.status === "CLIENT_REVIEW" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showFeedbackForm ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve Content
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <RichTextEditor
                    variant="standard"
                    placeholder="Describe the changes you'd like to see..."
                    onChange={(html) => setFeedback(html)}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={handleRequestRevision}
                      disabled={isPending || !feedback}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Request Revision
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Badge */}
        {post.status !== "CLIENT_REVIEW" && (
          <Card>
            <CardContent className="p-4">
              <Badge
                className={cn(
                  "w-full justify-center py-2",
                  post.status === "APPROVED" && "bg-green-100 text-green-700",
                  post.status === "REVISION_REQUESTED" && "bg-yellow-100 text-yellow-700",
                  post.status === "PUBLISHED" && "bg-blue-100 text-blue-700"
                )}
              >
                {post.status.replace(/_/g, " ")}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
