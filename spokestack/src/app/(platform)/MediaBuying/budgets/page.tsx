"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Mock budget allocations data
const mockBudgets = [
  {
    id: "1",
    client: "Creative Communications Abu Dhabi",
    clientCode: "CCAD",
    period: "December 2024",
    allocated: 75000,
    spent: 45000,
    remaining: 30000,
    platforms: {
      META: { allocated: 45000, spent: 28000 },
      GOOGLE: { allocated: 20000, spent: 12000 },
      TIKTOK: { allocated: 10000, spent: 5000 },
    },
    status: "ON_TRACK",
    paceRate: 92,
  },
  {
    id: "2",
    client: "Dubai Economy & Tourism",
    clientCode: "DET",
    period: "December 2024",
    allocated: 120000,
    spent: 78500,
    remaining: 41500,
    platforms: {
      META: { allocated: 70000, spent: 48000 },
      GOOGLE: { allocated: 40000, spent: 25000 },
      TIKTOK: { allocated: 10000, spent: 5500 },
    },
    status: "ON_TRACK",
    paceRate: 98,
  },
  {
    id: "3",
    client: "Abu Dhabi Education & Knowledge",
    clientCode: "ADEK",
    period: "December 2024",
    allocated: 35000,
    spent: 32000,
    remaining: 3000,
    platforms: {
      GOOGLE: { allocated: 25000, spent: 24000 },
      META: { allocated: 10000, spent: 8000 },
    },
    status: "AT_RISK",
    paceRate: 115,
  },
  {
    id: "4",
    client: "Emirates Creative Digital",
    clientCode: "ECD",
    period: "December 2024",
    allocated: 25000,
    spent: 12500,
    remaining: 12500,
    platforms: {
      TIKTOK: { allocated: 15000, spent: 8000 },
      META: { allocated: 10000, spent: 4500 },
    },
    status: "UNDER_PACE",
    paceRate: 65,
  },
];

// Platform totals
const platformTotals = {
  META: { allocated: 135000, spent: 88500 },
  GOOGLE: { allocated: 85000, spent: 61000 },
  TIKTOK: { allocated: 35000, spent: 18500 },
};

export default function BudgetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);

  const filteredBudgets = mockBudgets.filter((budget) => {
    const matchesSearch =
      budget.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.clientCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return (
          <Badge className="bg-green-500">
            <TrendingUp className="mr-1 h-3 w-3" />
            On Track
          </Badge>
        );
      case "AT_RISK":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            At Risk
          </Badge>
        );
      case "UNDER_PACE":
        return (
          <Badge className="bg-yellow-500">
            <ArrowDownRight className="mr-1 h-3 w-3" />
            Under Pace
          </Badge>
        );
      case "OVER_BUDGET":
        return (
          <Badge variant="destructive">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Over Budget
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalAllocated = mockBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = mockBudgets.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage and track client budget allocations
          </p>
        </div>
        <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Allocate Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Allocate Budget</DialogTitle>
              <DialogDescription>
                Create a new budget allocation for a client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ccad">CCAD - Creative Communications Abu Dhabi</SelectItem>
                    <SelectItem value="det">DET - Dubai Economy & Tourism</SelectItem>
                    <SelectItem value="adek">ADEK - Abu Dhabi Education & Knowledge</SelectItem>
                    <SelectItem value="ecd">ECD - Emirates Creative Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="period">Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan-2025">January 2025</SelectItem>
                      <SelectItem value="feb-2025">February 2025</SelectItem>
                      <SelectItem value="q1-2025">Q1 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total">Total Budget</Label>
                  <Input id="total" type="number" placeholder="50000" />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Platform Breakdown</Label>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-sm font-medium">Meta</div>
                    <Input type="number" placeholder="25000" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-sm font-medium">Google</div>
                    <Input type="number" placeholder="15000" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-sm font-medium">TikTok</div>
                    <Input type="number" placeholder="10000" className="flex-1" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAllocateDialogOpen(false)}>
                Create Allocation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Allocated
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
            <p className="text-xs text-muted-foreground">December 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalAllocated) * 100).toFixed(0)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBudgets.filter((b) => b.status === "AT_RISK").length}
            </div>
            <p className="text-xs text-muted-foreground">Clients need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(platformTotals).map(([platform, data]) => (
          <Card key={platform}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{platform}</CardTitle>
                <Badge variant="outline">
                  {((data.spent / data.allocated) * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">{formatCurrency(data.allocated)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">{formatCurrency(data.spent)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(data.spent / data.allocated) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Budgets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Budgets</CardTitle>
              <CardDescription>
                Track budget utilization by client
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ON_TRACK">On Track</SelectItem>
                  <SelectItem value="AT_RISK">At Risk</SelectItem>
                  <SelectItem value="UNDER_PACE">Under Pace</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Pace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{budget.clientCode}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {budget.client}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {budget.period}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(budget.allocated)}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(budget.platforms).map(([platform, data]) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}: {formatCurrency(data.allocated)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(budget.spent)}</div>
                    <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          (budget.spent / budget.allocated) > 0.95
                            ? "bg-red-500"
                            : (budget.spent / budget.allocated) > 0.8
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min((budget.spent / budget.allocated) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${budget.remaining < 5000 ? "text-red-500" : ""}`}>
                      {formatCurrency(budget.remaining)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        budget.paceRate > 100
                          ? "border-red-500 text-red-500"
                          : budget.paceRate < 80
                          ? "border-yellow-500 text-yellow-500"
                          : "border-green-500 text-green-500"
                      }
                    >
                      {budget.paceRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(budget.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Allocation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          View Trends
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Budget
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
