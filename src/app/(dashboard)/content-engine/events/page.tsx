import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Zap,
  Bell,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { listSubscriptions, listHandlers } from "@/modules/content-engine/services";
import { SubscriptionActions } from "./SubscriptionActions";

export default async function EventSubscriptionsPage() {
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

  const [subscriptions, handlers] = await Promise.all([
    listSubscriptions(),
    Promise.resolve(listHandlers()),
  ]);

  // Group by entity type
  const groupedSubs = subscriptions.reduce(
    (acc, sub) => {
      const key = sub.entityType === "*" ? "All Entities" : sub.entityType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(sub);
      return acc;
    },
    {} as Record<string, typeof subscriptions>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#52EDC7]" />
              Event Subscriptions
            </h1>
            <p className="text-gray-500 mt-1">
              Configure automatic actions when events occur
            </p>
          </div>
        </div>
        <Link href="/content-engine/events/new">
          <Button className="bg-[#52EDC7] hover:bg-[#1BA098] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {subscriptions.filter((s) => s.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available Handlers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{handlers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Available Handlers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Available Handlers
          </CardTitle>
          <CardDescription>
            Built-in handlers that can be triggered by events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {handlers.map((handler) => (
              <div
                key={handler.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm">{handler.name}</p>
                  <p className="text-xs text-gray-500">{handler.description}</p>
                </div>
                <Badge variant="outline">{handler.entityType}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No subscriptions configured</p>
              <p className="text-sm text-gray-400 mt-1">
                Create a subscription to trigger actions when events occur
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSubs).map(([entityType, subs]) => (
                <div key={entityType}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    {entityType}
                  </h3>
                  <div className="space-y-2">
                    {subs.map((sub) => (
                      <SubscriptionCard key={sub.id} subscription={sub} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionCard({
  subscription,
}: {
  subscription: Awaited<ReturnType<typeof listSubscriptions>>[number];
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg ${
            subscription.enabled ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {subscription.enabled ? (
            <ToggleRight className="h-5 w-5 text-green-600" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{subscription.handler}</span>
            {subscription.skillSlug && (
              <Badge variant="secondary" className="text-xs">
                Skill: {subscription.skillSlug}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {subscription.entityType === "*" ? "All entities" : subscription.entityType}
            </span>
            <span>•</span>
            <span>
              {subscription.action === "*" ? "All actions" : subscription.action}
            </span>
            <span>•</span>
            <span>Priority: {subscription.priority}</span>
          </div>
        </div>
      </div>
      <SubscriptionActions subscription={subscription} />
    </div>
  );
}
