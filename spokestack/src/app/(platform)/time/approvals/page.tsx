import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const pendingApprovals = [
  {
    id: "1",
    user: { name: "Sarah Johnson", avatar: null, initials: "SJ" },
    week: "Dec 23 - Dec 29",
    hours: 42.5,
    status: "pending",
    submittedAt: "Dec 29, 2024",
  },
  {
    id: "2",
    user: { name: "Mike Chen", avatar: null, initials: "MC" },
    week: "Dec 23 - Dec 29",
    hours: 38.0,
    status: "pending",
    submittedAt: "Dec 30, 2024",
  },
  {
    id: "3",
    user: { name: "Emily Davis", avatar: null, initials: "ED" },
    week: "Dec 23 - Dec 29",
    hours: 45.25,
    status: "pending",
    submittedAt: "Dec 30, 2024",
  },
];

export default function TimeApprovalsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Time Approvals</h1>
            <p className="text-sm text-muted-foreground">Review and approve team timesheets</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendingApprovals.length} Pending
        </Badge>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pending Approvals
        </h2>

        {pendingApprovals.map((approval) => (
          <Card key={approval.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={approval.user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {approval.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{approval.user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {approval.week} • Submitted {approval.submittedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{approval.hours}h</div>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state for when no approvals */}
      {pendingApprovals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-green-500/10 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No timesheets pending approval. Check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-sm text-muted-foreground">Approved This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">480h</div>
            <p className="text-sm text-muted-foreground">Total Team Hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
