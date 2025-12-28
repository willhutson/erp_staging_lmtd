"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_MODULES = [
  { id: "admin", label: "Admin", description: "User and org management" },
  { id: "crm", label: "CRM", description: "Companies, contacts, deals" },
  { id: "listening", label: "Listening", description: "Creator and content tracking" },
  { id: "mediabuying", label: "Media Buying", description: "Ad accounts and campaigns" },
  { id: "analytics", label: "Analytics", description: "Performance dashboards" },
  { id: "builder", label: "Builder", description: "Custom dashboards and widgets" },
  { id: "briefs", label: "Briefs", description: "Work request management" },
  { id: "time", label: "Time Tracking", description: "Timesheets and billing" },
  { id: "leave", label: "Leave Management", description: "PTO and absence tracking" },
  { id: "hr", label: "HR", description: "Employee management" },
];

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function NewInstancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrg = searchParams.get("org");

  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    organizationId: preselectedOrg || "",
    tier: "PRO",
    primaryColor: "#52EDC7",
    secondaryColor: "#1BA098",
    enabledModules: ["admin", "crm", "analytics"],
  });

  useEffect(() => {
    // Fetch organizations
    fetch("/api/superadmin/organizations")
      .then((res) => res.json())
      .then((data) => setOrganizations(data))
      .catch(console.error);
  }, []);

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const toggleModule = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleId)
        ? prev.enabledModules.filter((m) => m !== moduleId)
        : [...prev.enabledModules, moduleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/superadmin/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create instance");
      }

      const instance = await res.json();
      toast.success("Instance created successfully");
      router.push(`/superadmin/instances/${instance.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create instance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/instances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Instance</h1>
          <p className="text-muted-foreground">
            Set up a new white-label client portal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the instance identity and ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Instance Name</Label>
                <Input
                  id="name"
                  placeholder="LMTD Portal"
                  value={formData.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Subdomain</Label>
                <div className="flex">
                  <Input
                    id="slug"
                    placeholder="lmtd"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
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
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, organizationId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Set the visual identity for this instance
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
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    placeholder="#52EDC7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondaryColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondaryColor: e.target.value,
                      }))
                    }
                    placeholder="#1BA098"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  <span className="text-sm font-bold text-white">
                    {formData.name.charAt(0) || "S"}
                  </span>
                </div>
                <span className="font-semibold">{formData.name || "Instance Name"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enabled Modules</CardTitle>
            <CardDescription>
              Select which modules are available in this instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {AVAILABLE_MODULES.map((module) => (
                <div
                  key={module.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={module.id}
                    checked={formData.enabledModules.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor={module.id} className="cursor-pointer font-medium">
                      {module.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/superadmin/instances">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Instance
          </Button>
        </div>
      </form>
    </div>
  );
}
