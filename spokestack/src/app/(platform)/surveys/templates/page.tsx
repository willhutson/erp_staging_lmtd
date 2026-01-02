"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTemplates, createTemplate } from "@/modules/survey/actions";
import { TemplateList } from "@/modules/survey/components";
import type { TemplateListItem, TemplateKind, TemplateCategory } from "@/modules/survey/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const KIND_OPTIONS: { value: TemplateKind; label: string }[] = [
  { value: "SURVEY", label: "Survey" },
  { value: "FORM", label: "Form" },
  { value: "QUIZ", label: "Quiz" },
  { value: "POLL", label: "Poll" },
  { value: "FEEDBACK", label: "Feedback" },
];

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "EMPLOYEE_ENGAGEMENT", label: "Employee Engagement" },
  { value: "CLIENT_SATISFACTION", label: "Client Satisfaction" },
  { value: "EVENT_FEEDBACK", label: "Event Feedback" },
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "APPLICATION", label: "Application" },
  { value: "RESEARCH", label: "Research" },
  { value: "INTERNAL_PROCESS", label: "Internal Process" },
  { value: "CUSTOM", label: "Custom" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<TemplateKind>("SURVEY");
  const [category, setCategory] = useState<TemplateCategory>("CUSTOM");

  const loadTemplates = useCallback(async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const template = await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        kind,
        category,
      });

      setShowCreateDialog(false);
      resetForm();
      router.push(`/surveys/templates/${template.id}`);
    } catch (error) {
      console.error("Failed to create template:", error);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setKind("SURVEY");
    setCategory("CUSTOM");
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <TemplateList
        templates={templates}
        onCreateNew={() => setShowCreateDialog(true)}
      />

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Start with a blank template or choose a category to get suggested questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Client Satisfaction Survey"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this template is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kind">Type</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as TemplateKind)}>
                  <SelectTrigger id="kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
