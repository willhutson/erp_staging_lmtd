import { getPortalUser } from "@/lib/portal/auth";
import { redirect } from "next/navigation";
import { PortalHeader } from "./PortalHeader";
import { PortalNav } from "./PortalNav";

export const dynamic = 'force-dynamic';

export default async function PortalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getPortalUser();

  if (!user) {
    redirect("/portal/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader user={user} />
      <div className="flex">
        <PortalNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
