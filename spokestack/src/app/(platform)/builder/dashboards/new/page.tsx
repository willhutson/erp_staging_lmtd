"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  ChevronLeft,
  LayoutTemplate,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Mock templates data (same as templates page)
const mockTemplates = [
  { id: "1", name: "Executive Overview", category: "performance", widgetCount: 8 },
  { id: "2", name: "Campaign Performance", category: "campaigns", widgetCount: 12 },
  { id: "3", name: "Creator Leaderboard", category: "creators", widgetCount: 6 },
  { id: "4", name: "Social Listening Dashboard", category: "creators", widgetCount: 10 },
  { id: "5", name: "Media Spend Tracker", category: "media", widgetCount: 9 },
  { id: "6", name: "Platform Comparison", category: "media", widgetCount: 7 },
  { id: "7", name: "Client Monthly Report", category: "client", widgetCount: 11 },
  { id: "8", name: "CCAD Custom Dashboard", category: "client", widgetCount: 8 },
  { id: "9", name: "Content Performance Grid", category: "creators", widgetCount: 5 },
  { id: "10", name: "Weekly Pulse", category: "performance", widgetCount: 4 },
];

function NewDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "ORGANIZATION",
  });

  const selectedTemplate = templateId
    ? mockTemplates.find(t => t.id === templateId)
    : null;

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        name: `${selectedTemplate.name} - Copy`,
      }));
    }
  }, [selectedTemplate]);

  const handleCreate = async () => {
    setIsCreating(true);
    // Simulate creation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a mock ID and redirect to editor
    const newId = `new-${Date.now()}`;
    router.push(`/builder/dashboards/${newId}/edit`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/builder/dashboards">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedTemplate
              ? `Based on "${selectedTemplate.name}" template`
              : "Start fresh or choose a template"
            }
          </p>
        </div>
      </div>

      {/* Template Info Card (if using template) */}
      {selectedTemplate && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutTemplate className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Using Template</CardTitle>
                <CardDescription>
                  {selectedTemplate.name} - {selectedTemplate.widgetCount} widgets
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard Details
          </CardTitle>
          <CardDescription>
            Configure your new dashboard settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Dashboard Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Performance Dashboard"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this dashboard for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData({ ...formData, visibility: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private - Only you</SelectItem>
                <SelectItem value="ORGANIZATION">Team - Your organization</SelectItem>
                <SelectItem value="CLIENT">Client Portal - Visible to clients</SelectItem>
                <SelectItem value="PUBLIC">Public - Anyone with link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!selectedTemplate && (
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Or choose a template</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" asChild className="h-auto py-3 flex-col gap-1">
                  <Link href="/builder/templates">
                    <LayoutTemplate className="h-5 w-5" />
                    <span className="text-xs">Browse Templates</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1" disabled>
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Blank Dashboard</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/builder/dashboards">Cancel</Link>
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!formData.name.trim() || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Dashboard
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function NewDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewDashboardContent />
    </Suspense>
  );
}
