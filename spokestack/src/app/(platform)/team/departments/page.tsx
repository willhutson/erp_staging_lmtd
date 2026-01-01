"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Briefcase,
  TrendingUp,
  Clock,
  Building2,
} from "lucide-react";

// Mock departments data
const mockDepartments = [
  {
    id: "creative",
    name: "Creative",
    description: "Design, branding, and visual content creation",
    color: "#EC4899",
    head: { id: "cj", name: "CJ Ocampo", role: "Creative Director", avatar: null },
    members: [
      { id: "haidy", name: "Haidy Mohammed", role: "Senior Designer", avatar: null },
      { id: "omar", name: "Omar Khalil", role: "Motion Designer", avatar: null },
      { id: "ahmed", name: "Ahmed Hassan", role: "Designer", avatar: null },
      { id: "fatima", name: "Fatima Al-Rashid", role: "Junior Designer", avatar: null },
    ],
    metrics: {
      activeProjects: 12,
      utilization: 85,
      avgHoursWeek: 42,
    },
    clients: ["CCAD", "Dubai Tourism", "ADEK"],
  },
  {
    id: "production",
    name: "Production",
    description: "Video production, editing, and post-production",
    color: "#3B82F6",
    head: { id: "ted", name: "Ted Vicencio", role: "Head of Production", avatar: null },
    members: [
      { id: "marco", name: "Marco Santos", role: "Video Producer", avatar: null },
      { id: "ali", name: "Ali Mahmoud", role: "Video Editor", avatar: null },
      { id: "sarah", name: "Sarah Chen", role: "Production Coordinator", avatar: null },
    ],
    metrics: {
      activeProjects: 8,
      utilization: 92,
      avgHoursWeek: 45,
    },
    clients: ["CCAD", "Economy Dubai"],
  },
  {
    id: "account-management",
    name: "Account Management",
    description: "Client relationships and project coordination",
    color: "#22C55E",
    head: { id: "salma", name: "Salma Hassan", role: "Account Director", avatar: null },
    members: [
      { id: "nour", name: "Nour El-Din", role: "Senior Account Manager", avatar: null },
      { id: "layla", name: "Layla Farouk", role: "Account Executive", avatar: null },
    ],
    metrics: {
      activeProjects: 15,
      utilization: 78,
      avgHoursWeek: 40,
    },
    clients: ["CCAD", "Dubai Tourism", "ADEK", "Economy Dubai"],
  },
  {
    id: "technology",
    name: "Technology",
    description: "Development, platforms, and technical solutions",
    color: "#F97316",
    head: { id: "afaq", name: "Afaq Ahmed", role: "Head of Technology", avatar: null },
    members: [
      { id: "rashed", name: "Rashed Al-Maktoum", role: "Full Stack Developer", avatar: null },
      { id: "priya", name: "Priya Sharma", role: "Frontend Developer", avatar: null },
    ],
    metrics: {
      activeProjects: 6,
      utilization: 88,
      avgHoursWeek: 44,
    },
    clients: ["Internal", "CCAD"],
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Research, insights, and strategic planning",
    color: "#06B6D4",
    head: { id: "matthew", name: "Matthew Reynolds", role: "Strategy Director", avatar: null },
    members: [
      { id: "dana", name: "Dana Ibrahim", role: "Strategist", avatar: null },
    ],
    metrics: {
      activeProjects: 4,
      utilization: 70,
      avgHoursWeek: 38,
    },
    clients: ["CCAD", "Dubai Tourism"],
  },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredDepartments = mockDepartments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = mockDepartments.reduce(
    (sum, dept) => sum + dept.members.length + 1, // +1 for head
    0
  );
  const avgUtilization = Math.round(
    mockDepartments.reduce((sum, dept) => sum + dept.metrics.utilization, 0) / mockDepartments.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              {mockDepartments.length} departments with {totalMembers} total members
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
              <DialogDescription>
                Add a new department to your organization structure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" placeholder="e.g., Marketing" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="What does this department do?" rows={2} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  {["#EC4899", "#3B82F6", "#22C55E", "#F97316", "#8B5CF6", "#06B6D4"].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{mockDepartments.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalMembers}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{avgUtilization}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">
                {mockDepartments.reduce((sum, dept) => sum + dept.metrics.activeProjects, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {dept.members.length + 1} members
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Department
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{dept.description}</p>

              {/* Department Head */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Department Head</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={dept.head.avatar || undefined} />
                    <AvatarFallback className="text-xs">{getInitials(dept.head.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{dept.head.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.head.role}</p>
                  </div>
                </div>
              </div>

              {/* Team Members Preview */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                <div className="flex -space-x-2">
                  {dept.members.slice(0, 5).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {dept.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{dept.members.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-lg font-semibold">{dept.metrics.activeProjects}</p>
                  <p className="text-[10px] text-muted-foreground">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{dept.metrics.utilization}%</p>
                  <p className="text-[10px] text-muted-foreground">Utilization</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{dept.metrics.avgHoursWeek}h</p>
                  <p className="text-[10px] text-muted-foreground">Avg/Week</p>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className={dept.metrics.utilization > 90 ? "text-amber-600" : "text-green-600"}>
                    {dept.metrics.utilization}%
                  </span>
                </div>
                <Progress value={dept.metrics.utilization} className="h-2" />
              </div>

              {/* Clients */}
              <div className="flex flex-wrap gap-1">
                {dept.clients.map((client) => (
                  <Badge key={client} variant="outline" className="text-xs">
                    {client}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
