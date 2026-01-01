"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowLeft,
  Receipt,
  Users,
  Package,
  TrendingUp,
  Download,
  Construction,
} from "lucide-react";

const PLANNED_FEATURES = [
  {
    icon: Package,
    title: "Subscription Plans",
    description: "View and upgrade your current plan (Starter, Pro, Enterprise)",
  },
  {
    icon: CreditCard,
    title: "Payment Methods",
    description: "Manage credit cards, bank accounts, and billing addresses",
  },
  {
    icon: Receipt,
    title: "Invoice History",
    description: "Download past invoices and payment receipts",
  },
  {
    icon: Users,
    title: "Seat Management",
    description: "Add or remove user seats from your subscription",
  },
  {
    icon: TrendingUp,
    title: "Usage Analytics",
    description: "Monitor storage, API calls, and feature usage",
  },
  {
    icon: Download,
    title: "Export Data",
    description: "Export your data before plan changes or cancellation",
  },
];

const PLAN_TIERS = [
  { name: "Starter", price: "$49", users: "Up to 10 users", features: "Core modules" },
  { name: "Pro", price: "$149", users: "Up to 50 users", features: "All modules + API" },
  { name: "Enterprise", price: "Custom", users: "Unlimited", features: "Custom + Support" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function BillingSettingsPage() {
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
            <CreditCard className="h-6 w-6 text-emerald-500" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">Admin Only</Badge>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-amber-500" />
            </div>
            <Badge className="bg-amber-500 mb-3">Coming Soon</Badge>
            <h2 className="text-xl font-semibold mb-2">Billing Portal Under Development</h2>
            <p className="text-muted-foreground max-w-md">
              We're building a self-service billing portal. For now, please contact
              your account manager for any billing inquiries.
            </p>
            <Button className="mt-4" asChild>
              <a href="mailto:billing@spokestack.io">Contact Billing Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_TIERS.map((plan) => (
            <Card key={plan.name} className={plan.name === "Pro" ? "border-primary" : "bg-muted/30"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.name === "Pro" && <Badge>Popular</Badge>}
                </div>
                <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{plan.users}</p>
                <p>{plan.features}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
