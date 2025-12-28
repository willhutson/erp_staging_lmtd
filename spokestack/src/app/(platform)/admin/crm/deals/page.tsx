"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  Building2,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock deals data
const mockDeals = [
  {
    id: "1",
    name: "Q1 2025 Retainer - CCAD",
    description: "Annual content production retainer for social media",
    company: "Creative Communications Abu Dhabi",
    contact: "Ahmed Al Rashid",
    stage: "NEGOTIATION",
    status: "OPEN",
    amount: 350000,
    probability: 80,
    expectedClose: "2025-01-15",
    owner: "Will Hutson",
    createdAt: "2024-12-01",
  },
  {
    id: "2",
    name: "Dubai Summer Campaign",
    description: "Influencer marketing campaign for summer tourism",
    company: "Dubai Economy & Tourism",
    contact: "Sarah Johnson",
    stage: "PROPOSAL",
    status: "OPEN",
    amount: 500000,
    probability: 60,
    expectedClose: "2025-02-01",
    owner: "Afaq Ahmed",
    createdAt: "2024-12-10",
  },
  {
    id: "3",
    name: "Education Awareness Campaign",
    description: "Back to school campaign for ADEK",
    company: "Abu Dhabi Education & Knowledge",
    contact: "Mohammed Hassan",
    stage: "QUALIFIED",
    status: "OPEN",
    amount: 150000,
    probability: 40,
    expectedClose: "2025-03-01",
    owner: "Albert Fernandez",
    createdAt: "2024-12-15",
  },
  {
    id: "4",
    name: "Tech Partnership Program",
    description: "Co-marketing partnership with ECD",
    company: "Emirates Creative Digital",
    contact: "Lisa Chen",
    stage: "CLOSED",
    status: "WON",
    amount: 75000,
    probability: 100,
    expectedClose: "2024-12-20",
    owner: "Will Hutson",
    createdAt: "2024-11-01",
  },
  {
    id: "5",
    name: "Global Marketing Audit",
    description: "Comprehensive marketing audit proposal",
    company: "Acme Marketing Solutions",
    contact: "James Wilson",
    stage: "LEAD",
    status: "OPEN",
    amount: 25000,
    probability: 20,
    expectedClose: "2025-04-01",
    owner: "Afaq Ahmed",
    createdAt: "2024-12-20",
  },
];

const stages = [
  { id: "LEAD", name: "Lead", color: "bg-gray-500" },
  { id: "QUALIFIED", name: "Qualified", color: "bg-blue-500" },
  { id: "PROPOSAL", name: "Proposal", color: "bg-yellow-500" },
  { id: "NEGOTIATION", name: "Negotiation", color: "bg-orange-500" },
  { id: "CLOSED", name: "Closed", color: "bg-green-500" },
];

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

  const filteredDeals = mockDeals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    return stages.find((s) => s.id === stage)?.color || "bg-gray-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WON":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Won
          </Badge>
        );
      case "LOST":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Lost
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
    }
  };

  const openDeals = mockDeals.filter((d) => d.status === "OPEN");
  const totalPipeline = openDeals.reduce((sum, d) => sum + d.amount, 0);
  const weightedPipeline = openDeals.reduce((sum, d) => sum + (d.amount * d.probability) / 100, 0);
  const wonDeals = mockDeals.filter((d) => d.status === "WON");
  const wonValue = wonDeals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === "pipeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("pipeline")}
            >
              Pipeline
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Deal</DialogTitle>
                <DialogDescription>
                  Add a new deal to your pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Deal Name</Label>
                  <Input id="name" placeholder="e.g., Q1 2025 Campaign" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Brief description of the deal..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Creative Communications Abu Dhabi</SelectItem>
                        <SelectItem value="2">Dubai Economy & Tourism</SelectItem>
                        <SelectItem value="3">Abu Dhabi Education & Knowledge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact">Primary Contact</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ahmed Al Rashid</SelectItem>
                        <SelectItem value="2">Sarah Johnson</SelectItem>
                        <SelectItem value="3">Mohammed Hassan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Deal Value</Label>
                    <Input id="amount" type="number" placeholder="100000" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select defaultValue="LEAD">
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expectedClose">Expected Close Date</Label>
                    <Input id="expectedClose" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="will">Will Hutson</SelectItem>
                        <SelectItem value="afaq">Afaq Ahmed</SelectItem>
                        <SelectItem value="albert">Albert Fernandez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Deal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pipeline
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipeline)}</div>
            <p className="text-xs text-muted-foreground">
              {openDeals.length} open deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weighted Pipeline
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weightedPipeline)}</div>
            <p className="text-xs text-muted-foreground">Based on probability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Won This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wonValue)}</div>
            <p className="text-xs text-muted-foreground">
              {wonDeals.length} deals closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Deal Size
            </CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPipeline / (openDeals.length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">Open deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline View */}
      {viewMode === "pipeline" ? (
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-medium">{stage.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(stageValue)}
                </div>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm line-clamp-2">
                          {deal.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {deal.company}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {formatCurrency(deal.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {deal.probability}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.expectedClose).toLocaleDateString()}
                        </div>
                        {deal.status !== "OPEN" && getStatusBadge(deal.status)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Deals</CardTitle>
                <CardDescription>
                  View and manage all deals
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search deals..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${getStageColor(deal.stage)}`} />
                    <div>
                      <div className="font-medium">{deal.name}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {deal.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {deal.contact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(deal.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {deal.probability}% probability
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{stages.find((s) => s.id === deal.stage)?.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(deal.expectedClose).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(deal.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Move Stage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Won
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark as Lost
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
