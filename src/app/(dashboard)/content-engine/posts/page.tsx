import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getContentPosts } from "@/modules/content/actions/content-actions";
import { PostsListClient } from "./PostsListClient";
import { db } from "@/lib/db";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [posts, clients] = await Promise.all([
    getContentPosts({ organizationId }),
    db.client.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
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
          <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
          <p className="text-gray-500 mt-1">
            Manage all content posts across clients
          </p>
        </div>
      </div>

      <PostsListClient posts={posts} clients={clients} />
    </div>
  );
}
