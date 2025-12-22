import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { listHandlers } from "@/modules/content-engine/services";
import { db } from "@/lib/db";
import { NewSubscriptionForm } from "./NewSubscriptionForm";

export default async function NewSubscriptionPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userIsAdmin = isAdmin(session.user as Parameters<typeof isAdmin>[0]);

  if (!userIsAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Admin access required</p>
      </div>
    );
  }

  // Get available handlers and skills
  const [handlers, skills] = await Promise.all([
    Promise.resolve(listHandlers()),
    db.agentSkill.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: "ACTIVE",
      },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/content-engine/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#52EDC7]" />
            New Subscription
          </h1>
          <p className="text-gray-500 mt-1">
            Configure when to trigger actions
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Settings</CardTitle>
          <CardDescription>
            Define which events should trigger which handlers or skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewSubscriptionForm
            handlers={handlers}
            skills={skills}
          />
        </CardContent>
      </Card>
    </div>
  );
}
