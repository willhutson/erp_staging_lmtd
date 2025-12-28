"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Globe, Palette, Boxes } from "lucide-react";

const AVAILABLE_MODULES = [
  { id: "admin", label: "Admin Dashboard", description: "Core admin features" },
  { id: "crm", label: "CRM", description: "Companies, contacts, deals" },
  { id: "listening", label: "Social Listening", description: "Creator discovery and tracking" },
  { id: "mediabuying", label: "Media Buying", description: "Ad campaign management" },
  { id: "analytics", label: "Analytics", description: "Performance dashboards" },
  { id: "builder", label: "Dashboard Builder", description: "Custom dashboard creation" },
  { id: "briefs", label: "Briefs", description: "Project briefs and workflows" },
  { id: "time", label: "Time Tracking", description: "Time logs and timesheets" },
];

export default function NewOrgInstancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tier, setTier] = useState("PRO");
  const [primaryColor, setPrimaryColor] = useState("#52EDC7");
  const [secondaryColor, setSecondaryColor] = useState("#1BA098");
  const [enabledModules, setEnabledModules] = useState<string[]>(["admin", "analytics"]);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/superadmin/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          tier,
          primaryColor,
          secondaryColor,
          enabledModules,
          isActive: true,
          // organizationId will come from session
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create portal");
      }

      router.push("/admin/instances");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/instances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Client Portal</h1>
          <p className="text-muted-foreground">
            Set up a new white-label portal for your client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Portal Details
            </CardTitle>
            <CardDescription>
              Basic information about the client portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Portal Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Corp Portal"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Subdomain *</Label>
                <div className="flex">
                  <Input
                    id="slug"
                    placeholder="acme"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="rounded-r-none"
                    required
                  />
                  <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground">
                    .spokestack.io
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Plan Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines available features and limits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#52EDC7"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#1BA098"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <Separator />
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-white font-bold">
                      {name.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{name || "Portal Name"}</p>
                    <p className="text-xs text-muted-foreground">
                      {slug || "subdomain"}.spokestack.io
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-2 rounded-md text-white text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-md text-white text-sm"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Enabled Modules
            </CardTitle>
            <CardDescription>
              Choose which features to enable for this portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {AVAILABLE_MODULES.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{module.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  <Switch
                    checked={enabledModules.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/instances">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Portal
          </Button>
        </div>
      </form>
    </div>
  );
}
