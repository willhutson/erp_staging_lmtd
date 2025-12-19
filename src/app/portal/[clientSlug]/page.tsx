import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ clientSlug: string }>;
}

export default async function ClientPortalPage({ params }: PageProps) {
  const { clientSlug } = await params;

  // Find client by code (slug)
  const client = await db.client.findFirst({
    where: { code: clientSlug.toUpperCase() },
  });

  if (!client) {
    notFound();
  }

  // Get client's briefs that are in review or completed
  const briefs = await db.brief.findMany({
    where: {
      clientId: client.id,
      status: {
        in: ["CLIENT_REVIEW", "COMPLETED", "REVISIONS"],
      },
    },
    include: {
      assignee: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const reviewingBriefs = briefs.filter((b) => b.status === "CLIENT_REVIEW");
  const completedBriefs = briefs.filter((b) => b.status === "COMPLETED");
  const revisionsBriefs = briefs.filter((b) => b.status === "REVISIONS");

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Welcome, {client.name}
        </h2>
        <p className="text-gray-500">
          Review your deliverables and provide feedback below.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Awaiting Review</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reviewingBriefs.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">In Revisions</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {revisionsBriefs.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Completed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {completedBriefs.length}
          </p>
        </div>
      </div>

      {/* Items awaiting review */}
      {reviewingBriefs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Awaiting Your Review</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {reviewingBriefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/portal/${clientSlug}/${brief.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{brief.title}</p>
                  <p className="text-sm text-gray-500">
                    Last updated{" "}
                    {new Date(brief.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  Review Required
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* In revisions */}
      {revisionsBriefs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">In Revisions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {revisionsBriefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/portal/${clientSlug}/${brief.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{brief.title}</p>
                  <p className="text-sm text-gray-500">
                    Being revised by {brief.assignee?.name || "team"}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                  In Progress
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedBriefs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Completed</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {completedBriefs.slice(0, 10).map((brief) => (
              <Link
                key={brief.id}
                href={`/portal/${clientSlug}/${brief.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{brief.title}</p>
                  <p className="text-sm text-gray-500">
                    Completed{" "}
                    {new Date(brief.completedAt || brief.updatedAt).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Approved
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {briefs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No deliverables to review yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            You&apos;ll see items here when they&apos;re ready for your review.
          </p>
        </div>
      )}
    </div>
  );
}
