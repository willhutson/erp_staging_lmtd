"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Clock,
  Construction,
} from "lucide-react";

const PLANNED_FEATURES = [
  {
    icon: Building2,
    title: "Company Profile",
    description: "Update company name, logo, and description",
  },
  {
    icon: MapPin,
    title: "Address & Location",
    description: "Set your business address and regional settings",
  },
  {
    icon: Globe,
    title: "Localization",
    description: "Default language, date format, and currency settings",
  },
  {
    icon: Users,
    title: "Departments",
    description: "Manage team departments and organizational structure",
  },
  {
    icon: Briefcase,
    title: "Client Defaults",
    description: "Default settings for new clients and projects",
  },
  {
    icon: Clock,
    title: "Working Hours",
    description: "Set business hours and holiday calendar",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function OrganizationSettingsPage() {
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
            <Building2 className="h-6 w-6 text-purple-500" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            Company settings and branding
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
            <h2 className="text-xl font-semibold mb-2">Organization Settings Under Development</h2>
            <p className="text-muted-foreground max-w-md">
              We're building comprehensive organization management tools. For now, please
              contact your admin to update organization-level settings.
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
