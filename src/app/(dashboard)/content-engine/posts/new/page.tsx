import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [clients, briefs] = await Promise.all([
    db.client.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        socialAccounts: {
          where: { isActive: true },
          select: {
            id: true,
            platform: true,
            accountName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.brief.findMany({
      where: {
        organizationId,
        status: { in: ["IN_PROGRESS", "APPROVED"] },
      },
      select: {
        id: true,
        title: true,
        briefNumber: true,
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/content-engine"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-500 mt-1">
            Create content for social media platforms
          </p>
        </div>
      </div>

      <NewPostForm
        clients={clients}
        briefs={briefs}
        organizationId={organizationId}
        userId={session.user.id}
      />
    </div>
  );
}
