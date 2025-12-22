"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createScopeChange, type ScopeChangeImpact } from "../actions/scope-change-actions";

interface ScopeChangeFormProps {
  briefId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const IMPACT_OPTIONS: { value: ScopeChangeImpact; label: string; description: string }[] = [
  { value: "MINOR", label: "Minor", description: "Small tweak, minimal rework" },
  { value: "MODERATE", label: "Moderate", description: "Notable change, some rework required" },
  { value: "MAJOR", label: "Major", description: "Significant pivot, substantial rework" },
  { value: "CRITICAL", label: "Critical", description: "Complete direction change, major impact" },
];

export function ScopeChangeForm({ briefId, onSuccess, onCancel }: ScopeChangeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [originalDirection, setOriginalDirection] = useState("");
  const [newDirection, setNewDirection] = useState("");
  const [reason, setReason] = useState("");
  const [impactLevel, setImpactLevel] = useState<ScopeChangeImpact>("MODERATE");
  const [hoursSpentBefore, setHoursSpentBefore] = useState("");
  const [estimatedAdditionalHours, setEstimatedAdditionalHours] = useState("");
  const [costImpact, setCostImpact] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!originalDirection.trim()) {
      setError("Original direction is required");
      return;
    }
    if (!newDirection.trim()) {
      setError("New direction is required");
      return;
    }

    startTransition(async () => {
      try {
        await createScopeChange({
          briefId,
          title: title.trim(),
          originalDirection: originalDirection.trim(),
          newDirection: newDirection.trim(),
          reason: reason.trim() || undefined,
          impactLevel,
          hoursSpentBefore: hoursSpentBefore ? parseFloat(hoursSpentBefore) : undefined,
          estimatedAdditionalHours: estimatedAdditionalHours ? parseFloat(estimatedAdditionalHours) : undefined,
          costImpact: costImpact ? parseFloat(costImpact) : undefined,
          requiresApproval,
        });

        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create scope change");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#52EDC7]" />
          <h3 className="font-semibold text-gray-900">Record Scope Change</h3>
        </div>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Change Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Client requested different visual style"
          disabled={isPending}
        />
      </div>

      {/* Original vs New Direction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="originalDirection">Original Direction *</Label>
          <Textarea
            id="originalDirection"
            value={originalDirection}
            onChange={(e) => setOriginalDirection(e.target.value)}
            placeholder="What was originally planned or agreed..."
            rows={4}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newDirection">New Direction *</Label>
          <Textarea
            id="newDirection"
            value={newDirection}
            onChange={(e) => setNewDirection(e.target.value)}
            placeholder="What the client now wants..."
            rows={4}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Change</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why did the client request this change? (optional)"
          rows={2}
          disabled={isPending}
        />
      </div>

      {/* Impact Level */}
      <div className="space-y-2">
        <Label>Impact Level</Label>
        <Select value={impactLevel} onValueChange={(v) => setImpactLevel(v as ScopeChangeImpact)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IMPACT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <span className="font-medium">{option.label}</span>
                  <span className="text-gray-500 ml-2">– {option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hours & Cost */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hoursSpentBefore">Hours Spent Before</Label>
          <Input
            id="hoursSpentBefore"
            type="number"
            step="0.5"
            min="0"
            value={hoursSpentBefore}
            onChange={(e) => setHoursSpentBefore(e.target.value)}
            placeholder="0"
            disabled={isPending}
          />
          <p className="text-xs text-gray-500">Work done before this change</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedAdditionalHours">Additional Hours</Label>
          <Input
            id="estimatedAdditionalHours"
            type="number"
            step="0.5"
            min="0"
            value={estimatedAdditionalHours}
            onChange={(e) => setEstimatedAdditionalHours(e.target.value)}
            placeholder="0"
            disabled={isPending}
          />
          <p className="text-xs text-gray-500">Estimated extra hours needed</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="costImpact">Cost Impact (AED)</Label>
          <Input
            id="costImpact"
            type="number"
            step="100"
            min="0"
            value={costImpact}
            onChange={(e) => setCostImpact(e.target.value)}
            placeholder="0"
            disabled={isPending}
          />
          <p className="text-xs text-gray-500">Financial impact if any</p>
        </div>
      </div>

      {/* Requires Approval */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="requiresApproval" className="text-sm font-medium">
            Requires Client Approval
          </Label>
          <p className="text-xs text-gray-500">
            Send this scope change to the client portal for acknowledgment
          </p>
        </div>
        <Switch
          id="requiresApproval"
          checked={requiresApproval}
          onCheckedChange={setRequiresApproval}
          disabled={isPending}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-[#52EDC7] hover:bg-[#1BA098] text-gray-900 hover:text-white"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recording...
            </>
          ) : (
            "Record Scope Change"
          )}
        </Button>
      </div>
    </form>
  );
}
