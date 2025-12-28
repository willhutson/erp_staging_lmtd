"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  ArrowLeft,
  Code,
  Webhook,
  FileJson,
  Shield,
  Activity,
  Construction,
} from "lucide-react";

const PLANNED_FEATURES = [
  {
    icon: Key,
    title: "API Key Management",
    description: "Create, rotate, and revoke API keys for programmatic access",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Configure webhooks to receive real-time event notifications",
  },
  {
    icon: FileJson,
    title: "API Documentation",
    description: "Interactive API docs with request/response examples",
  },
  {
    icon: Shield,
    title: "Rate Limits & Quotas",
    description: "View your API usage limits and current consumption",
  },
  {
    icon: Activity,
    title: "API Logs",
    description: "Monitor API requests, response times, and errors",
  },
];

const WEBHOOK_EVENTS = [
  "brief.created",
  "brief.updated",
  "brief.completed",
  "rfp.created",
  "rfp.won",
  "rfp.lost",
  "time_entry.created",
  "leave.requested",
  "leave.approved",
];

export default function ApiSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6 text-slate-500" />
            API Keys & Webhooks
          </h1>
          <p className="text-muted-foreground">
            Manage API access and webhook integrations
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">Developer</Badge>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-amber-500" />
            </div>
            <Badge className="bg-amber-500 mb-3">Coming Soon</Badge>
            <h2 className="text-xl font-semibold mb-2">Developer API Under Development</h2>
            <p className="text-muted-foreground max-w-md">
              We're building a powerful API that will let you integrate SpokeStack with your
              existing tools and workflows. Full REST API with webhook support coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Planned Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {PLANNED_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Webhook Events Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Planned Webhook Events
          </CardTitle>
          <CardDescription>
            Events you'll be able to subscribe to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <Badge key={event} variant="outline" className="font-mono text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
