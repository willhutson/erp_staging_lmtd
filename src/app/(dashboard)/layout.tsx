import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";
import type { SessionUser } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    organizationId: session.user.organizationId,
    permissionLevel: session.user.permissionLevel,
    department: session.user.department,
    role: session.user.role,
    avatarUrl: session.user.avatarUrl,
  };

  return <Shell user={user}>{children}</Shell>;
}
