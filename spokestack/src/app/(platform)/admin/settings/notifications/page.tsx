"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ArrowLeft,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  Users,
  Construction,
} from "lucide-react";

const PLANNED_FEATURES = [
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Configure which events trigger email notifications",
  },
  {
    icon: Smartphone,
    title: "Push Notifications",
    description: "Manage browser and mobile push notification settings",
  },
  {
    icon: MessageSquare,
    title: "SpokeChat Notifications",
    description: "Control @mentions, DMs, and channel notification preferences",
  },
  {
    icon: Calendar,
    title: "Brief & Deadline Alerts",
    description: "Get notified about upcoming deadlines and brief assignments",
  },
  {
    icon: Users,
    title: "Team Updates",
    description: "Stay informed about team activity, approvals, and leave requests",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function NotificationSettingsPage() {
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
            <Bell className="h-6 w-6 text-amber-500" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground">
            Email and push notification preferences
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-amber-500" />
            </div>
            <Badge className="bg-amber-500 mb-3">Coming Soon</Badge>
            <h2 className="text-xl font-semibold mb-2">Notification Center Under Development</h2>
            <p className="text-muted-foreground max-w-md">
              We're building a comprehensive notification system so you never miss important updates.
              You'll be able to customize exactly what you want to hear about.
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
