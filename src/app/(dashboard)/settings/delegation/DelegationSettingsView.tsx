"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ltd/patterns/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LtdButton } from "@/components/ltd/primitives/ltd-button";
import { LtdSelect } from "@/components/ltd/primitives/ltd-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DelegationProfileConfig,
  DelegationScope,
  EscalationRules,
} from "@/modules/delegation/types";
import { updateMyDelegationProfile } from "@/modules/delegation/actions";
import { formatDate } from "@/lib/format/date";
import {
  User,
  Users,
  Shield,
  AlertTriangle,
  Calendar,
  Check,
  ArrowRight,
} from "lucide-react";

interface DelegationSettingsViewProps {
  currentProfile: DelegationProfileConfig | null;
  delegations: {
    asDelegator: Array<{
      id: string;
      delegateName: string;
      startDate: Date;
      endDate: Date;
      status: string;
    }>;
    asDelegate: Array<{
      id: string;
      delegatorName: string;
      startDate: Date;
      endDate: Date;
      status: string;
    }>;
  };
  potentialDelegates: Array<{
    id: string;
    name: string;
    role: string;
    department: string;
    matchScore: number;
    alreadyDelegatingTo: boolean;
  }>;
  coveringFor: Array<{
    id: string;
    delegatorName: string;
    startDate: Date;
    endDate: Date;
  }>;
}

export function DelegationSettingsView({
  currentProfile,
  delegations,
  potentialDelegates,
  coveringFor,
}: DelegationSettingsViewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [primaryDelegateId, setPrimaryDelegateId] = useState<string | null>(
    currentProfile?.primaryDelegateId || null
  );
  const [scope, setScope] = useState<DelegationScope>(
    currentProfile?.scope || {
      clients: "all",
      briefTypes: "all",
      authority: "execute_only",
    }
  );
  const [escalationRules, setEscalationRules] = useState<EscalationRules>(
    currentProfile?.escalationRules || {
      escalateIf: ["high_priority"],
      escalateTo: "",
    }
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyDelegationProfile({
        primaryDelegateId,
        scope,
        escalationRules,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to save delegation settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Delegation" },
      ]}
      title="Delegation of Authority"
    >
      <div className="space-y-6">
        {/* Active Coverage Banner */}
        {coveringFor.length > 0 && (
          <Card className="p-4 bg-ltd-primary/10 border-ltd-primary">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-ltd-primary" />
              <div>
                <p className="font-medium text-ltd-text-1">
                  You are currently covering for:
                </p>
                <p className="text-sm text-ltd-text-2">
                  {coveringFor.map((c) => c.delegatorName).join(", ")}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-ltd-surface-1">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="active">
              <Calendar className="h-4 w-4 mr-2" />
              Active Delegations
            </TabsTrigger>
            <TabsTrigger value="covering">
              <Users className="h-4 w-4 mr-2" />
              Covering For
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-6">
            {/* Primary Delegate Selection */}
            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">
                Primary Delegate
              </h3>
              <p className="text-sm text-ltd-text-2 mb-4">
                Who should handle your work when you're on leave?
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-ltd-text-2">
                    Select Delegate
                  </Label>
                  <Select
                    value={primaryDelegateId || "none"}
                    onValueChange={(v) =>
                      setPrimaryDelegateId(v === "none" ? null : v)
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a delegate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No delegate</SelectItem>
                      {potentialDelegates.map((delegate) => (
                        <SelectItem key={delegate.id} value={delegate.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{delegate.name}</span>
                            <span className="text-xs text-ltd-text-3 ml-2">
                              {delegate.role} • {delegate.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {potentialDelegates.length > 0 && (
                  <div className="text-xs text-ltd-text-3">
                    Suggested based on your role and department
                  </div>
                )}
              </div>
            </Card>

            {/* Delegation Scope */}
            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">
                Delegation Scope
              </h3>
              <p className="text-sm text-ltd-text-2 mb-4">
                What should your delegate have access to?
              </p>

              <div className="space-y-6">
                {/* Authority Level */}
                <div>
                  <Label className="text-sm text-ltd-text-2">
                    Authority Level
                  </Label>
                  <Select
                    value={scope.authority}
                    onValueChange={(v) =>
                      setScope({
                        ...scope,
                        authority: v as DelegationScope["authority"],
                      })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">
                        Full Authority - Can do everything you can
                      </SelectItem>
                      <SelectItem value="execute_only">
                        Execute Only - Can complete tasks, no approvals
                      </SelectItem>
                      <SelectItem value="monitor_only">
                        Monitor Only - View and escalate only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clients */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-ltd-text-1">
                      All Clients
                    </Label>
                    <p className="text-xs text-ltd-text-3">
                      Delegate can handle all your client work
                    </p>
                  </div>
                  <Switch
                    checked={scope.clients === "all"}
                    onCheckedChange={(checked) =>
                      setScope({
                        ...scope,
                        clients: checked ? "all" : [],
                      })
                    }
                  />
                </div>

                {/* Brief Types */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-ltd-text-1">
                      All Brief Types
                    </Label>
                    <p className="text-xs text-ltd-text-3">
                      Delegate can handle all types of briefs
                    </p>
                  </div>
                  <Switch
                    checked={scope.briefTypes === "all"}
                    onCheckedChange={(checked) =>
                      setScope({
                        ...scope,
                        briefTypes: checked ? "all" : [],
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Escalation Rules */}
            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">
                Escalation Rules
              </h3>
              <p className="text-sm text-ltd-text-2 mb-4">
                When should items be escalated to your manager instead of
                delegated?
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={escalationRules.escalateIf.includes(
                      "high_priority"
                    )}
                    onCheckedChange={(checked) => {
                      const newRules = checked
                        ? [...escalationRules.escalateIf, "high_priority"]
                        : escalationRules.escalateIf.filter(
                            (r) => r !== "high_priority"
                          );
                      setEscalationRules({
                        ...escalationRules,
                        escalateIf: newRules,
                      });
                    }}
                  />
                  <Label>High priority items</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={escalationRules.escalateIf.includes("new_client")}
                    onCheckedChange={(checked) => {
                      const newRules = checked
                        ? [...escalationRules.escalateIf, "new_client"]
                        : escalationRules.escalateIf.filter(
                            (r) => r !== "new_client"
                          );
                      setEscalationRules({
                        ...escalationRules,
                        escalateIf: newRules,
                      });
                    }}
                  />
                  <Label>New client work</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={escalationRules.escalateIf.includes(
                      "budget_impact"
                    )}
                    onCheckedChange={(checked) => {
                      const newRules = checked
                        ? [...escalationRules.escalateIf, "budget_impact"]
                        : escalationRules.escalateIf.filter(
                            (r) => r !== "budget_impact"
                          );
                      setEscalationRules({
                        ...escalationRules,
                        escalateIf: newRules,
                      });
                    }}
                  />
                  <Label>Budget-impacting decisions</Label>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <LtdButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </LtdButton>
            </div>
          </TabsContent>

          {/* Active Delegations Tab */}
          <TabsContent value="active" className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold text-ltd-text-1">
              Your Delegations
            </h3>

            {delegations.asDelegator.length === 0 ? (
              <Card className="p-8 bg-ltd-surface-overlay border-ltd-border-1 text-center">
                <Calendar className="h-8 w-8 text-ltd-text-3 mx-auto mb-3" />
                <p className="text-ltd-text-2">No active or upcoming delegations</p>
                <p className="text-sm text-ltd-text-3 mt-1">
                  Delegations are created when your leave is approved
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {delegations.asDelegator.map((d) => (
                  <Card
                    key={d.id}
                    className="p-4 bg-ltd-surface-overlay border-ltd-border-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowRight className="h-4 w-4 text-ltd-text-3" />
                        <div>
                          <p className="font-medium text-ltd-text-1">
                            Delegating to {d.delegateName}
                          </p>
                          <p className="text-sm text-ltd-text-2">
                            {formatDate(d.startDate, "short")} -{" "}
                            {formatDate(d.endDate, "short")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          d.status === "ACTIVE"
                            ? "bg-ltd-success/10 text-ltd-success"
                            : "bg-ltd-warning/10 text-ltd-warning"
                        }
                      >
                        {d.status.toLowerCase()}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Covering For Tab */}
          <TabsContent value="covering" className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold text-ltd-text-1">
              Currently Covering For
            </h3>

            {delegations.asDelegate.length === 0 ? (
              <Card className="p-8 bg-ltd-surface-overlay border-ltd-border-1 text-center">
                <Users className="h-8 w-8 text-ltd-text-3 mx-auto mb-3" />
                <p className="text-ltd-text-2">
                  Not currently covering for anyone
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {delegations.asDelegate.map((d) => (
                  <Card
                    key={d.id}
                    className="p-4 bg-ltd-surface-overlay border-ltd-border-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-ltd-primary" />
                        <div>
                          <p className="font-medium text-ltd-text-1">
                            Covering for {d.delegatorName}
                          </p>
                          <p className="text-sm text-ltd-text-2">
                            {formatDate(d.startDate, "short")} -{" "}
                            {formatDate(d.endDate, "short")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          d.status === "ACTIVE"
                            ? "bg-ltd-success/10 text-ltd-success"
                            : "bg-ltd-warning/10 text-ltd-warning"
                        }
                      >
                        {d.status.toLowerCase()}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
