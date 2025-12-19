import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { RFPForm } from "@/modules/rfp/components/RFPForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewRFPPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!can(session.user as Parameters<typeof can>[0], "rfp:create")) {
    redirect("/rfp");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/rfp"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New RFP</h1>
          <p className="text-gray-500 mt-1">Create a new RFP submission</p>
        </div>
      </div>

      <RFPForm />
    </div>
  );
}
