import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewSurveyForm } from "./NewSurveyForm";

export const dynamic = "force-dynamic";

export default async function NewNPSSurveyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/feedback/nps");
  }

  // Get clients for selection
  const clients = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      code: true,
      contacts: {
        where: { isNpsDesignee: true, isActive: true },
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/feedback/nps">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to NPS
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New NPS Survey</h1>
        <p className="text-gray-500 mt-1">
          Send a Net Promoter Score survey to a client
        </p>
      </div>

      <NewSurveyForm
        clients={clients}
        defaultYear={currentYear}
        defaultQuarter={currentQuarter}
      />
    </div>
  );
}
