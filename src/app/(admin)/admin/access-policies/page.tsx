"use client";

import { useList, useCan, useInvalidate } from "@refinedev/core";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Send,
  Archive,
  RotateCcw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Policy {
  id: string;
  name: string;
  description: string | null;
  defaultLevel: string | null;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  isActive: boolean;
  priority: number;
  version: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
  approvedBy: { id: string; name: string } | null;
  _count: { rules: number; assignments: number };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function AccessPoliciesListPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const invalidate = useInvalidate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    policy: Policy | null;
  }>({ open: false, action: "", policy: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const isAdmin = session?.user?.permissionLevel === "ADMIN";

  const { data: canCreate } = useCan({
    resource: "access-policies",
    action: "create",
  });

  const { query: listQuery, result } = useList<Policy>({
    resource: "access-policies",
    filters: [
      ...(searchQuery ? [{ field: "q", operator: "contains" as const, value: searchQuery }] : []),
      ...(statusFilter !== "all"
        ? [{ field: "status", operator: "eq" as const, value: statusFilter }]
        : []),
    ],
    sorters: [{ field: "priority", order: "desc" }],
  });

  const isLoading = listQuery.isLoading;
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: string, policy: Policy) => {
    if (action === "reject" && !rejectionReason) {
      toast.error("Rejection reason is required");
      return;
    }

    const url = `/api/admin/access-policies/${policy.id}/actions`;
    const payload: { action: string; reason?: string } = { action };
    if (action === "reject") {
      payload.reason = rejectionReason;
    }

    setActionLoading(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success(`Policy ${action}ed successfully`);
      invalidate({ resource: "access-policies", invalidates: ["list"] });
      setActionDialog({ open: false, action: "", policy: null });
      setRejectionReason("");
    } catch (error) {
      toast.error(`Failed to ${action} policy`);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (action: string, policy: Policy) => {
    setActionDialog({ open: true, action, policy });
    setRejectionReason("");
  };

  const policies = result?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Access Policies</h1>
          <p className="text-muted-foreground">
            Configure role-based access rules for your organization
          </p>
        </div>
        {canCreate?.can && (
          <Link href="/admin/access-policies/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isAdmin ? "Create Policy" : "Draft Policy"}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Default Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rules</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      {policy.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {policy.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {policy.defaultLevel ? (
                      <Badge variant="outline">{policy.defaultLevel}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[policy.status]}>
                      {policy.status}
                    </Badge>
                    {policy.status === "REJECTED" && policy.rejectionReason && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                        {policy.rejectionReason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{policy._count?.rules || 0}</TableCell>
                  <TableCell>{policy.priority}</TableCell>
                  <TableCell>
                    <div className="text-sm">{policy.createdBy?.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/access-policies/${policy.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* Submit (for drafts/rejected) */}
                      {(policy.status === "DRAFT" || policy.status === "REJECTED") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openActionDialog("submit", policy)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Approve/Reject (for admins, submitted policies) */}
                      {isAdmin && policy.status === "SUBMITTED" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => openActionDialog("approve", policy)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => openActionDialog("reject", policy)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Edit (for drafts or admins) */}
                      {(policy.status === "DRAFT" || isAdmin) && (
                        <Link href={`/admin/access-policies/${policy.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}

                      {/* Archive/Restore (for admins) */}
                      {isAdmin && policy.status === "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openActionDialog("archive", policy)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && policy.status === "ARCHIVED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openActionDialog("restore", policy)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          setActionDialog({ open, action: "", policy: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "submit" && "Submit Policy for Approval"}
              {actionDialog.action === "approve" && "Approve Policy"}
              {actionDialog.action === "reject" && "Reject Policy"}
              {actionDialog.action === "archive" && "Archive Policy"}
              {actionDialog.action === "restore" && "Restore Policy"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "submit" &&
                "This will submit the policy for admin approval. It will become active once approved."}
              {actionDialog.action === "approve" &&
                "This will approve and activate the policy. Users with the default level will gain these permissions."}
              {actionDialog.action === "reject" &&
                "Please provide a reason for rejection. The creator will be notified."}
              {actionDialog.action === "archive" &&
                "This will deactivate the policy. It can be restored later."}
              {actionDialog.action === "restore" &&
                "This will restore and reactivate the policy."}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this policy is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: "", policy: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                actionDialog.policy &&
                handleAction(actionDialog.action, actionDialog.policy)
              }
              disabled={actionLoading}
              variant={actionDialog.action === "reject" ? "destructive" : "default"}
            >
              {actionDialog.action === "submit" && "Submit"}
              {actionDialog.action === "approve" && "Approve"}
              {actionDialog.action === "reject" && "Reject"}
              {actionDialog.action === "archive" && "Archive"}
              {actionDialog.action === "restore" && "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
