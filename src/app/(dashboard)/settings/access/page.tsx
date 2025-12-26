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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Check, X, User, Calendar, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AccessRule {
  id: string;
  resource: string;
  action: string;
  effect: "ALLOW" | "DENY";
  conditionType: string;
}

interface Policy {
  id: string;
  name: string;
  description: string | null;
  priority?: number;
  rules: AccessRule[];
}

interface Assignment {
  id: string;
  reason: string | null;
  assignedAt: string;
  expiresAt: string | null;
  assignedBy: { id: string; name: string } | null;
  policy: Policy;
}

interface UserAccess {
  user: {
    id: string;
    name: string;
    email: string;
    permissionLevel: string;
  };
  defaultPolicy: Policy | null;
  assignments: Assignment[];
}

export default function AccessSettingsPage() {
  const { data: session } = useSession();
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccess() {
      try {
        const response = await fetch("/api/user/access");
        if (!response.ok) {
          throw new Error("Failed to fetch access information");
        }
        const data = await response.json();
        setAccess(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchAccess();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Access & Permissions
        </h2>
      </div>

      {/* Permission Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permission Level
          </CardTitle>
          <CardDescription>
            Your base permission level determines default access across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {access?.user.permissionLevel}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {getPermissionDescription(access?.user.permissionLevel)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Policy */}
      {access?.defaultPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Default Policy
            </CardTitle>
            <CardDescription>
              This policy applies to all users with your permission level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{access.defaultPolicy.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {access.defaultPolicy.description}
                </p>
              </div>
              <PolicyRulesTable rules={access.defaultPolicy.rules} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Additional Policy Assignments
          </CardTitle>
          <CardDescription>
            Policies specifically assigned to you that may grant additional permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {access?.assignments && access.assignments.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {access.assignments.map((assignment) => (
                <AccordionItem key={assignment.id} value={assignment.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <div className="font-medium">{assignment.policy.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {assignment.assignedBy && (
                            <span>Assigned by {assignment.assignedBy.name}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(assignment.assignedAt), "MMM d, yyyy")}
                          </span>
                          {assignment.expiresAt && (
                            <Badge variant="secondary" className="text-xs">
                              Expires {format(new Date(assignment.expiresAt), "MMM d, yyyy")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {assignment.reason && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium">Reason for assignment:</div>
                          <p className="text-sm text-muted-foreground">{assignment.reason}</p>
                        </div>
                      )}
                      {assignment.policy.description && (
                        <p className="text-sm text-muted-foreground">
                          {assignment.policy.description}
                        </p>
                      )}
                      <PolicyRulesTable rules={assignment.policy.rules} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional policies assigned to your account.</p>
              <p className="text-sm mt-1">
                Your access is determined by your permission level default policy.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Need different access?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                If you need access to resources not covered by your current policies, contact your
                team lead or administrator. They can assign additional policies to grant the
                necessary permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyRulesTable({ rules }: { rules: AccessRule[] }) {
  if (rules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No specific rules defined.</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Effect</TableHead>
            <TableHead>Scope</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-mono text-sm">{rule.resource}</TableCell>
              <TableCell>
                <Badge variant="outline">{formatAction(rule.action)}</Badge>
              </TableCell>
              <TableCell>
                {rule.effect === "ALLOW" ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    Allow
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <X className="h-4 w-4" />
                    Deny
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatCondition(rule.conditionType)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getPermissionDescription(level: string | undefined): string {
  switch (level) {
    case "ADMIN":
      return "Full platform access with ability to manage all settings, users, and policies.";
    case "LEADERSHIP":
      return "Access to most platform features including RFP management and team oversight.";
    case "TEAM_LEAD":
      return "Team management capabilities with access to assign and oversee team members.";
    case "STAFF":
      return "Standard access to day-to-day work features and personal settings.";
    case "FREELANCER":
      return "Limited access to assigned projects and time tracking.";
    default:
      return "Contact your administrator for permission details.";
  }
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    create: "Create",
    read: "View",
    update: "Edit",
    delete: "Delete",
    list: "List",
    approve: "Approve",
    assign: "Assign",
    "*": "All Actions",
  };
  return actionMap[action] || action;
}

function formatCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    ALL: "All records",
    OWN: "Own records only",
    ASSIGNED: "Assigned records",
    TEAM: "Team records",
    CLIENT: "Client records",
    CUSTOM: "Custom conditions",
  };
  return conditionMap[condition] || condition;
}
