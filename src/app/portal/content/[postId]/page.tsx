/**
 * Client Portal - Content Review Detail
 *
 * Shows content with platform previews for approval.
 *
 * @module portal/content/[postId]
 */

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { ContentReviewClient } from "./ContentReviewClient";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function PortalContentReviewPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/portal/login");
  }

  const { postId } = await params;

  // Get client portal user
  const portalUser = await db.clientPortalUser.findUnique({
    where: { id: session.user.id },
    include: {
      contact: true,
    },
  });

  if (!portalUser) {
    redirect("/portal/login");
  }

  // Get post with all details
  const post = await db.contentPost.findFirst({
    where: {
      id: postId,
      clientId: portalUser.clientId,
    },
    include: {
      client: { select: { id: true, name: true } },
      assets: { orderBy: { sortOrder: "asc" } },
      approvals: {
        where: { approvalType: "CLIENT" },
        orderBy: { createdAt: "desc" },
        include: {
          clientContact: { select: { id: true, name: true } },
        },
      },
      contentComments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          clientContact: { select: { id: true, name: true } },
        },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Find pending approval for this contact
  const pendingApproval = post.approvals.find(
    (a) => a.status === "PENDING" && a.clientContactId === portalUser.contactId
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/portal/content"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          <p className="text-gray-500">Review content before publishing</p>
        </div>
      </div>

      <ContentReviewClient
        post={{
          id: post.id,
          title: post.title,
          caption: post.caption,
          captionAr: post.captionAr,
          platforms: post.platforms,
          contentType: post.contentType,
          hashtags: post.hashtags,
          mentions: post.mentions,
          linkUrl: post.linkUrl,
          scheduledFor: post.scheduledFor?.toISOString() || null,
          status: post.status,
          assets: post.assets.map((a) => ({
            id: a.id,
            type: a.type,
            fileUrl: a.fileUrl,
            thumbnailUrl: a.thumbnailUrl,
            aspectRatio: a.aspectRatio,
          })),
        }}
        approvalId={pendingApproval?.id || null}
        contactId={portalUser.contactId}
        comments={post.contentComments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          authorName: c.user?.name || c.clientContact?.name || "Unknown",
          authorType: c.user ? "internal" : "client",
        }))}
      />
    </div>
  );
}
