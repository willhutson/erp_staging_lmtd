"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  Monitor,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface NotificationRule {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  recipientType: string;
  recipientValue: string | null;
  notifyLevels: string[];
  notifyCreator: boolean;
  notifyAssignee: boolean;
  notifyApprover: boolean;
  notifyTeamLead: boolean;
  conditions: Record<string, unknown> | null;
  channels: string[];
  templateId: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
}

const EVENT_TYPES = [
  { value: "policy.assigned", label: "Policy Assigned" },
  { value: "policy.removed", label: "Policy Removed" },
  { value: "policy.submitted", label: "Policy Submitted for Approval" },
  { value: "policy.approved", label: "Policy Approved" },
  { value: "policy.rejected", label: "Policy Rejected" },
  { value: "policy.expiring", label: "Policy Assignment Expiring" },
  { value: "brief.created", label: "Brief Created" },
  { value: "brief.assigned", label: "Brief Assigned" },
  { value: "brief.updated", label: "Brief Updated" },
  { value: "submission.approved", label: "Submission Approved" },
  { value: "submission.rejected", label: "Submission Rejected" },
  { value: "leave.requested", label: "Leave Requested" },
  { value: "leave.approved", label: "Leave Approved" },
  { value: "leave.rejected", label: "Leave Rejected" },
];

const RECIPIENT_TYPES = [
  { value: "user", label: "Specific User" },
  { value: "role", label: "Users with Role" },
  { value: "team", label: "Team Members" },
  { value: "custom", label: "Custom Expression" },
];

const PERMISSION_LEVELS = [
  "ADMIN",
  "LEADERSHIP",
  "TEAM_LEAD",
  "STAFF",
  "FREELANCER",
];

export default function NotificationRulesPage() {
  const { data: session } = useSession();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    recipientType: "user" as string,
    recipientValue: "",
    notifyLevels: [] as string[],
    notifyCreator: false,
    notifyAssignee: false,
    notifyApprover: false,
    notifyTeamLead: false,
    channels: ["in_app"] as string[],
    isActive: true,
    priority: 0,
  });

  const isAdmin = session?.user?.permissionLevel === "ADMIN";

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const response = await fetch("/api/admin/notification-rules");
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      eventType: "",
      recipientType: "user",
      recipientValue: "",
      notifyLevels: [],
      notifyCreator: false,
      notifyAssignee: false,
      notifyApprover: false,
      notifyTeamLead: false,
      channels: ["in_app"],
      isActive: true,
      priority: 0,
    });
    setDialogOpen(true);
  }

  function openEditDialog(rule: NotificationRule) {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      eventType: rule.eventType,
      recipientType: rule.recipientType,
      recipientValue: rule.recipientValue || "",
      notifyLevels: rule.notifyLevels,
      notifyCreator: rule.notifyCreator,
      notifyAssignee: rule.notifyAssignee,
      notifyApprover: rule.notifyApprover,
      notifyTeamLead: rule.notifyTeamLead,
      channels: rule.channels,
      isActive: rule.isActive,
      priority: rule.priority,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const url = editingRule
        ? `/api/admin/notification-rules/${editingRule.id}`
        : "/api/admin/notification-rules";
      const method = editingRule ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchRules();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save rule");
      }
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Failed to save rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rule: NotificationRule) {
    if (!confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notification-rules/${rule.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  }

  async function handleToggleActive(rule: NotificationRule) {
    try {
      const response = await fetch(`/api/admin/notification-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });

      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  }

  function toggleChannel(channel: string) {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  }

  function toggleLevel(level: string) {
    setFormData((prev) => ({
      ...prev,
      notifyLevels: prev.notifyLevels.includes(level)
        ? prev.notifyLevels.filter((l) => l !== level)
        : [...prev.notifyLevels, level],
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Rules</h2>
          <p className="text-muted-foreground">
            Configure when and who gets notified for platform events
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Rules
          </CardTitle>
          <CardDescription>
            Rules are evaluated in priority order when events occur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No notification rules configured yet.</p>
              {isAdmin && (
                <p className="text-sm mt-1">
                  Click &quot;Create Rule&quot; to set up your first notification rule.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {rule.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {EVENT_TYPES.find((e) => e.value === rule.eventType)?.label ||
                          rule.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.notifyCreator && (
                          <Badge variant="secondary" className="text-xs">Creator</Badge>
                        )}
                        {rule.notifyAssignee && (
                          <Badge variant="secondary" className="text-xs">Assignee</Badge>
                        )}
                        {rule.notifyApprover && (
                          <Badge variant="secondary" className="text-xs">Approver</Badge>
                        )}
                        {rule.notifyTeamLead && (
                          <Badge variant="secondary" className="text-xs">Team Lead</Badge>
                        )}
                        {rule.notifyLevels.map((level) => (
                          <Badge key={level} variant="secondary" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                        {rule.recipientType === "user" && rule.recipientValue && (
                          <Badge variant="secondary" className="text-xs">
                            Specific User
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rule.channels.includes("in_app") && (
                          <span title="In-App">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        {rule.channels.includes("email") && (
                          <span title="Email">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        {rule.channels.includes("slack") && (
                          <span title="Slack">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => isAdmin && handleToggleActive(rule)}
                        disabled={!isAdmin}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rule)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "Edit Notification Rule" : "Create Notification Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure when and who should be notified for this event type
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Notify admins on policy submission"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe when this notification is sent"
                  rows={2}
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) =>
                  setFormData({ ...formData, eventType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            <div className="space-y-4">
              <Label>Recipients</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyCreator"
                    checked={formData.notifyCreator}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyCreator: checked === true })
                    }
                  />
                  <Label htmlFor="notifyCreator" className="font-normal">
                    Notify Creator
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyAssignee"
                    checked={formData.notifyAssignee}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyAssignee: checked === true })
                    }
                  />
                  <Label htmlFor="notifyAssignee" className="font-normal">
                    Notify Assignee
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyApprover"
                    checked={formData.notifyApprover}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyApprover: checked === true })
                    }
                  />
                  <Label htmlFor="notifyApprover" className="font-normal">
                    Notify Approver
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyTeamLead"
                    checked={formData.notifyTeamLead}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyTeamLead: checked === true })
                    }
                  />
                  <Label htmlFor="notifyTeamLead" className="font-normal">
                    Notify Team Lead
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notify Permission Levels</Label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_LEVELS.map((level) => (
                    <Badge
                      key={level}
                      variant={formData.notifyLevels.includes(level) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLevel(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel_in_app"
                    checked={formData.channels.includes("in_app")}
                    onCheckedChange={() => toggleChannel("in_app")}
                  />
                  <Label htmlFor="channel_in_app" className="font-normal flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    In-App
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel_email"
                    checked={formData.channels.includes("email")}
                    onCheckedChange={() => toggleChannel("email")}
                  />
                  <Label htmlFor="channel_email" className="font-normal flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel_slack"
                    checked={formData.channels.includes("slack")}
                    onCheckedChange={() => toggleChannel("slack")}
                  />
                  <Label htmlFor="channel_slack" className="font-normal flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Slack
                  </Label>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Rule is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.eventType}>
              {saving ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
