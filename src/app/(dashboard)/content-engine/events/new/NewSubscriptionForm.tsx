"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import { createSubscription } from "@/modules/content-engine/services/event-bus";
import type { EntityType, EventAction } from "@/modules/content-engine/services/event-bus";

const ENTITY_TYPES: Array<EntityType | "*"> = [
  "*",
  "BRIEF",
  "DELIVERABLE",
  "CLIENT",
  "RFP",
  "USER",
  "KNOWLEDGE_DOC",
  "SKILL",
];

const EVENT_ACTIONS: Array<EventAction | "*"> = [
  "*",
  "CREATED",
  "UPDATED",
  "DELETED",
  "STATUS_CHANGED",
  "ASSIGNED",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

interface NewSubscriptionFormProps {
  handlers: Array<{
    name: string;
    entityType: string;
    description: string;
  }>;
  skills: Array<{
    slug: string;
    name: string;
  }>;
}

export function NewSubscriptionForm({ handlers, skills }: NewSubscriptionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [entityType, setEntityType] = useState<EntityType | "*">("*");
  const [action, setAction] = useState<EventAction | "*">("*");
  const [handler, setHandler] = useState("");
  const [skillSlug, setSkillSlug] = useState("");
  const [priority, setPriority] = useState("100");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!handler && !skillSlug) {
      setError("Please select a handler or skill to trigger");
      return;
    }

    startTransition(async () => {
      try {
        await createSubscription({
          entityType,
          action,
          handler: handler || `skill:${skillSlug}`,
          skillSlug: skillSlug || undefined,
          priority: parseInt(priority) || 100,
        });
        router.push("/content-engine/events");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create subscription");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Entity Type */}
      <div className="space-y-2">
        <Label>Entity Type</Label>
        <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType | "*")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "*" ? "All Entities" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Which type of entity should trigger this subscription
        </p>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <Label>Action</Label>
        <Select value={action} onValueChange={(v) => setAction(v as EventAction | "*")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_ACTIONS.map((act) => (
              <SelectItem key={act} value={act}>
                {act === "*" ? "All Actions" : act.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Which action should trigger this subscription
        </p>
      </div>

      {/* Handler */}
      <div className="space-y-2">
        <Label>Handler (Built-in)</Label>
        <Select value={handler} onValueChange={setHandler}>
          <SelectTrigger>
            <SelectValue placeholder="Select a handler..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {handlers.map((h) => (
              <SelectItem key={h.name} value={h.name}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Built-in handler function to execute
        </p>
      </div>

      {/* Skill */}
      <div className="space-y-2">
        <Label>Or Trigger Skill</Label>
        <Select value={skillSlug} onValueChange={setSkillSlug}>
          <SelectTrigger>
            <SelectValue placeholder="Select a skill..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {skills.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          AI skill to invoke when event occurs
        </p>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <Input
          type="number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          min="1"
          max="1000"
        />
        <p className="text-xs text-gray-500">
          Lower numbers execute first (1-1000)
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#52EDC7] hover:bg-[#1BA098] text-white"
        >
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Subscription
        </Button>
      </div>
    </form>
  );
}
