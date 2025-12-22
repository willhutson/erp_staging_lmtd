/**
 * Client Portal - Content Review List
 *
 * Shows all content posts pending client approval.
 *
 * @module portal/content
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Calendar,
  Clock,
  Image,
  Video,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM_FEED: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_STORY: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_REEL: <Instagram className="w-4 h-4 text-pink-500" />,
  FACEBOOK_PAGE: <Facebook className="w-4 h-4 text-blue-600" />,
  TIKTOK: <Music2 className="w-4 h-4 text-gray-800" />,
  YOUTUBE_VIDEO: <Youtube className="w-4 h-4 text-red-600" />,
  LINKEDIN_PAGE: <Linkedin className="w-4 h-4 text-blue-700" />,
  X_TWEET: <Twitter className="w-4 h-4 text-gray-800" />,
};

export default async function PortalContentPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/portal/login");
  }

  // Get client portal user's client
  const portalUser = await db.clientPortalUser.findUnique({
    where: { id: session.user.id },
    include: {
      client: true,
      contact: true,
    },
  });

  if (!portalUser) {
    redirect("/portal/login");
  }

  // Get pending content for review
  const pendingContent = await db.contentPost.findMany({
    where: {
      clientId: portalUser.clientId,
      status: "CLIENT_REVIEW",
      approvals: {
        some: {
          status: "PENDING",
          approvalType: "CLIENT",
        },
      },
    },
    include: {
      assets: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      approvals: {
        where: {
          status: "PENDING",
          approvalType: "CLIENT",
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get recently reviewed
  const recentlyReviewed = await db.contentPost.findMany({
    where: {
      clientId: portalUser.clientId,
      approvals: {
        some: {
          approvalType: "CLIENT",
          status: { in: ["APPROVED", "REJECTED", "REVISION_REQUESTED"] },
          respondedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      },
    },
    include: {
      assets: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      approvals: {
        where: { approvalType: "CLIENT" },
        orderBy: { respondedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Review</h1>
        <p className="text-gray-500 mt-1">
          Review and approve content before it goes live
        </p>
      </div>

      {/* Pending Approvals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Pending Your Approval</h2>
          {pendingContent.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700">
              {pendingContent.length}
            </Badge>
          )}
        </div>

        {pendingContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No content pending your approval</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingContent.map((post) => (
              <Link
                key={post.id}
                href={`/portal/content/${post.id}`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 relative">
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
                          className="bg-white rounded-full p-1.5 shadow-sm"
                        >
                          {platformIcons[p] || <Globe className="w-4 h-4" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {post.caption}
                    </p>

                    {post.scheduledFor && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Scheduled:{" "}
                          {new Date(post.scheduledFor).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        Awaiting Your Review
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recently Reviewed */}
      {recentlyReviewed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-600">
              Recently Reviewed
            </h2>
          </div>

          <div className="space-y-2">
            {recentlyReviewed.map((post) => {
              const approval = post.approvals[0];
              return (
                <Link
                  key={post.id}
                  href={`/portal/content/${post.id}`}
                  className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {post.assets[0]?.thumbnailUrl || post.assets[0]?.fileUrl ? (
                      <img
                        src={post.assets[0].thumbnailUrl || post.assets[0].fileUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {post.platforms.slice(0, 2).map((p) => (
                        <span key={p}>{platformIcons[p]}</span>
                      ))}
                      <span className="font-medium truncate">{post.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {post.caption}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge
                    className={
                      approval?.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : approval?.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {approval?.status === "APPROVED"
                      ? "Approved"
                      : approval?.status === "REJECTED"
                      ? "Rejected"
                      : "Revisions"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
