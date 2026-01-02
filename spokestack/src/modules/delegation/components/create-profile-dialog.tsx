"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateMyDelegationProfile } from "../actions";
import type { DelegationScope, EscalationRules, DelegationAuthority } from "../types";

interface PotentialDelegate {
  id: string;
  name: string;
  role: string;
  department: string;
  matchScore: number;
  alreadyDelegatingTo: boolean;
}

interface CreateProfileDialogProps {
  potentialDelegates: PotentialDelegate[];
  children: React.ReactNode;
}

const AUTHORITY_OPTIONS: { value: DelegationAuthority; label: string; description: string }[] = [
  {
    value: "full",
    label: "Full Authority",
    description: "Can make decisions, approve work, and act on your behalf completely",
  },
  {
    value: "keep_in_loop",
    label: "Keep in the Loop",
    description: "Acts independently but CCs you on all communications and decisions",
  },
  {
    value: "execute_only",
    label: "Execute Only",
    description: "Handles day-to-day tasks but escalates decisions to leadership",
  },
  {
    value: "monitor_only",
    label: "Monitor Only",
    description: "Read-only visibility into your work, no action authority",
  },
];

export function CreateProfileDialog({
  potentialDelegates,
  children,
}: CreateProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedDelegateId, setSelectedDelegateId] = useState<string>("");
  const [clientFacing, setClientFacing] = useState(true);
  const [authority, setAuthority] = useState<DelegationAuthority>("execute_only");
  const [allClients, setAllClients] = useState(true);
  const [allBriefTypes, setAllBriefTypes] = useState(true);

  const selectedDelegate = potentialDelegates.find((d) => d.id === selectedDelegateId);

  const handleSubmit = async () => {
    if (!selectedDelegateId) return;

    setLoading(true);
    try {
      const scope: DelegationScope = {
        clients: allClients ? "all" : [],
        briefTypes: allBriefTypes ? "all" : [],
        clientFacing,
        authority,
      };

      const escalationRules: EscalationRules = {
        escalateIf: ["high_priority", "new_client"],
        escalateTo: "", // Will be set by the action based on team lead
      };

      await updateMyDelegationProfile({
        primaryDelegateId: selectedDelegateId,
        scope,
        escalationRules,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Delegation Profile</DialogTitle>
          <DialogDescription>
            Configure who handles your work when you're away and what authority they have.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Primary Delegate Selection */}
          <div className="space-y-2">
            <Label>Primary Delegate</Label>
            <Select value={selectedDelegateId} onValueChange={setSelectedDelegateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select who will cover for you..." />
              </SelectTrigger>
              <SelectContent>
                {potentialDelegates.map((delegate) => (
                  <SelectItem key={delegate.id} value={delegate.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {delegate.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium">{delegate.name}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          {delegate.department}
                        </span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {delegate.matchScore}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDelegate && (
              <p className="text-xs text-muted-foreground">
                {selectedDelegate.role} in {selectedDelegate.department}
              </p>
            )}
          </div>

          {/* Authority Level */}
          <div className="space-y-2">
            <Label>Authority Level</Label>
            <Select value={authority} onValueChange={(v) => setAuthority(v as DelegationAuthority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTHORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Facing Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="client-facing">Client Facing</Label>
              <p className="text-sm text-muted-foreground">
                Allow delegate to communicate directly with clients
              </p>
            </div>
            <Switch
              id="client-facing"
              checked={clientFacing}
              onCheckedChange={setClientFacing}
            />
          </div>

          {/* Scope Toggles */}
          <div className="space-y-3">
            <Label>Delegation Scope</Label>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">All Clients</p>
                <p className="text-xs text-muted-foreground">
                  Delegate has access to all your client work
                </p>
              </div>
              <Switch checked={allClients} onCheckedChange={setAllClients} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">All Brief Types</p>
                <p className="text-xs text-muted-foreground">
                  Delegate can handle any type of brief
                </p>
              </div>
              <Switch checked={allBriefTypes} onCheckedChange={setAllBriefTypes} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedDelegateId || loading}>
            {loading ? "Creating..." : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
