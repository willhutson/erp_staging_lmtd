"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  Palmtree,
  Stethoscope,
  Baby,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Leave type configurations - Sick leave removed from top display
const LEAVE_TYPES_DISPLAY = [
  { id: "ANNUAL", label: "Annual Leave", icon: Palmtree, color: "text-green-500", days: 22 },
  { id: "PERSONAL", label: "Personal Leave", icon: CalendarDays, color: "text-blue-500", days: 5 },
  { id: "PARENTAL", label: "Parental Leave", icon: Baby, color: "text-purple-500", days: 45 },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-500 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="gap-1">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface LeaveBalance {
  annual: { used: number; total: number };
  sick: { used: number; total: number };
  personal: { used: number; total: number };
  parental: { used: number; total: number };
}

interface LeaveRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: string;
  leaveType?: { name: string } | null;
  user?: { name: string; avatarUrl: string | null } | null;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function LeavePage() {
  const router = useRouter();
  const [sickLeaveDialogOpen, setSickLeaveDialogOpen] = useState(false);
  const [balance, setBalance] = useState<LeaveBalance>({
    annual: { used: 0, total: 22 },
    sick: { used: 0, total: 15 },
    personal: { used: 0, total: 5 },
    parental: { used: 0, total: 45 },
  });
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [upcoming, setUpcoming] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    // Mock data - in production, fetch from API
    setBalance({
      annual: { used: 8, total: 22 },
      sick: { used: 2, total: 15 },
      personal: { used: 1, total: 5 },
      parental: { used: 0, total: 45 },
    });
  }, []);

  const sickDaysRemaining = balance.sick.total - balance.sick.used;

  const handleSickLeaveClick = () => {
    setSickLeaveDialogOpen(true);
  };

  const handleContinueToSickLeave = () => {
    setSickLeaveDialogOpen(false);
    router.push("/leave/request?type=sick");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Request time off and manage leave balances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/leave/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/leave/request">
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Link>
          </Button>
        </div>
      </div>

      {/* Leave Balances - Only shows Annual, Personal, Parental (not Sick) */}
      <div className="grid gap-4 md:grid-cols-3">
        {LEAVE_TYPES_DISPLAY.map((type) => {
          const balanceKey = type.id.toLowerCase() as keyof LeaveBalance;
          const typeBalance = balance[balanceKey] || { used: 0, total: type.days };
          const remaining = typeBalance.total - typeBalance.used;
          const usedPercent = (typeBalance.used / typeBalance.total) * 100;
          const Icon = type.icon;

          return (
            <Card key={type.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${type.color}`} />
                  {type.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{remaining}</span>
                    <span className="text-sm text-muted-foreground">
                      / {typeBalance.total} days
                    </span>
                  </div>
                  <Progress value={usedPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {typeBalance.used} days used
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leave Requests Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="my" className="w-full">
                <div className="border-b px-4">
                  <TabsList className="h-12">
                    <TabsTrigger value="my">My Requests</TabsTrigger>
                    <TabsTrigger value="team">Team Leave</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="my" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No leave requests yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.slice(0, 10).map((request) => {
                          return (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Palmtree className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{request.leaveType?.name || "Leave"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {new Date(request.startDate).toLocaleDateString()} -{" "}
                                  {new Date(request.endDate).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium">{String(request.totalDays)}</span>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="team" className="m-0 p-8 text-center text-muted-foreground">
                  View team leave calendar
                </TabsContent>

                <TabsContent value="pending" className="m-0 p-8 text-center text-muted-foreground">
                  No requests pending approval
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Leave Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Upcoming Leave</CardTitle>
              <CardDescription>Who&apos;s off soon</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming leave
                </p>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((leave) => (
                    <div key={leave.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={leave.user?.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {leave.user?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {leave.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {String(leave.totalDays)}d
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                <Link href="/leave/request?type=annual">
                  <Palmtree className="mr-2 h-4 w-4 text-green-500" />
                  Request Annual Leave
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleSickLeaveClick}
              >
                <Stethoscope className="mr-2 h-4 w-4 text-red-500" />
                Request Sick Day
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                <Link href="/leave/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Team Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sick Leave Confirmation Dialog */}
      <Dialog open={sickLeaveDialogOpen} onOpenChange={setSickLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-red-500" />
              Request Sick Day
            </DialogTitle>
            <DialogDescription>
              You have <span className="font-semibold text-foreground">{sickDaysRemaining} sick days</span> remaining this year.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Sick Leave Balance</p>
                <p className="text-xs text-muted-foreground">
                  {balance.sick.used} of {balance.sick.total} days used
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{sickDaysRemaining}</p>
                <p className="text-xs text-muted-foreground">days remaining</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSickLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContinueToSickLeave}>
              Continue to Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
