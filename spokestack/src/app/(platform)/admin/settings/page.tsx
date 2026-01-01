"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  CreditCard,
  ArrowRight,
  Plug,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Your personal information and preferences",
    icon: User,
    href: "/admin/settings/profile",
    color: "bg-blue-500",
  },
  {
    id: "organization",
    label: "Organization",
    description: "Company settings and branding",
    icon: Building2,
    href: "/admin/settings/organization",
    color: "bg-purple-500",
  },
  {
    id: "portal",
    label: "Portal Branding",
    description: "Customize your client portal appearance",
    icon: Palette,
    href: "/admin/settings/portal",
    color: "bg-pink-500",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email and push notification preferences",
    icon: Bell,
    href: "/admin/settings/notifications",
    color: "bg-amber-500",
  },
  {
    id: "security",
    label: "Security",
    description: "Password, 2FA, and session management",
    icon: Shield,
    href: "/admin/settings/security",
    color: "bg-red-500",
  },
  {
    id: "api",
    label: "API Keys",
    description: "Manage API keys and webhooks",
    icon: Key,
    href: "/admin/settings/api",
    color: "bg-slate-500",
    badge: "Developer",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect third-party services",
    icon: Plug,
    href: "/admin/integrations",
    color: "bg-green-500",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Subscription and payment methods",
    icon: CreditCard,
    href: "/admin/settings/billing",
    color: "bg-emerald-500",
    badge: "Admin",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
                    {section.label}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
