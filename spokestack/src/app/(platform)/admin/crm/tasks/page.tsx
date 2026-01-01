"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckSquare,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  User,
  AlertCircle,
  Building2,
  Briefcase,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Mock tasks data
const mockTasks = [
  {
    id: "1",
    title: "Follow up with Ahmed on Q1 proposal",
    description: "Send updated pricing and timeline for the Q1 retainer deal",
    dueDate: "2024-12-29",
    priority: "HIGH",
    completed: false,
    assignedTo: "Will Hutson",
    contact: "Ahmed Al Rashid",
    company: "Creative Communications Abu Dhabi",
    deal: "Q1 2025 Retainer - CCAD",
    createdAt: "2024-12-20",
  },
  {
    id: "2",
    title: "Prepare campaign deck for DET",
    description: "Create presentation for Dubai Summer Campaign pitch",
    dueDate: "2024-12-30",
    priority: "HIGH",
    completed: false,
    assignedTo: "Afaq Ahmed",
    contact: "Sarah Johnson",
    company: "Dubai Economy & Tourism",
    deal: "Dubai Summer Campaign",
    createdAt: "2024-12-22",
  },
  {
    id: "3",
    title: "Send contract to ECD",
    description: "Finalize and send partnership agreement",
    dueDate: "2024-12-28",
    priority: "URGENT",
    completed: false,
    assignedTo: "Will Hutson",
    contact: "Lisa Chen",
    company: "Emirates Creative Digital",
    deal: "Tech Partnership Program",
    createdAt: "2024-12-18",
  },
  {
    id: "4",
    title: "Schedule kickoff meeting with ADEK",
    description: "Coordinate with Mohammed for project kickoff",
    dueDate: "2025-01-05",
    priority: "MEDIUM",
    completed: false,
    assignedTo: "Albert Fernandez",
    contact: "Mohammed Hassan",
    company: "Abu Dhabi Education & Knowledge",
    deal: "Education Awareness Campaign",
    createdAt: "2024-12-25",
  },
  {
    id: "5",
    title: "Review Acme proposal requirements",
    description: "Analyze RFP and prepare initial response outline",
    dueDate: "2025-01-10",
    priority: "LOW",
    completed: false,
    assignedTo: "Afaq Ahmed",
    contact: "James Wilson",
    company: "Acme Marketing Solutions",
    deal: "Global Marketing Audit",
    createdAt: "2024-12-26",
  },
  {
    id: "6",
    title: "Send invoice to CCAD",
    description: "Monthly retainer invoice for December",
    dueDate: "2024-12-25",
    priority: "MEDIUM",
    completed: true,
    completedAt: "2024-12-24",
    assignedTo: "Will Hutson",
    contact: "Ahmed Al Rashid",
    company: "Creative Communications Abu Dhabi",
    deal: null,
    createdAt: "2024-12-20",
  },
  {
    id: "7",
    title: "Update CRM with new contacts",
    description: "Add contacts from DET meeting",
    dueDate: "2024-12-23",
    priority: "LOW",
    completed: true,
    completedAt: "2024-12-23",
    assignedTo: "Afaq Ahmed",
    contact: null,
    company: "Dubai Economy & Tourism",
    deal: null,
    createdAt: "2024-12-22",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pending");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingTasks = mockTasks.filter((t) => !t.completed);
  const completedTasks = mockTasks.filter((t) => t.completed);
  const overdueTasks = mockTasks.filter((t) => !t.completed && new Date(t.dueDate) < today);
  const dueTodayTasks = mockTasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !t.completed && dueDate.getTime() === today.getTime();
  });

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    let matchesTab = true;
    if (selectedTab === "pending") matchesTab = !task.completed;
    if (selectedTab === "completed") matchesTab = task.completed;
    if (selectedTab === "overdue") matchesTab = !task.completed && new Date(task.dueDate) < today;

    return matchesSearch && matchesPriority && matchesTab;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge className="bg-red-500">Urgent</Badge>;
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary">Medium</Badge>;
      case "LOW":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage your CRM tasks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Add a new task to your CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" placeholder="e.g., Follow up with client" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Task details..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="MEDIUM">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="will">Will Hutson</SelectItem>
                      <SelectItem value="afaq">Afaq Ahmed</SelectItem>
                      <SelectItem value="albert">Albert Fernandez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Related Contact</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ahmed Al Rashid</SelectItem>
                      <SelectItem value="2">Sarah Johnson</SelectItem>
                      <SelectItem value="3">Mohammed Hassan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deal">Related Deal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 2025 Retainer - CCAD</SelectItem>
                    <SelectItem value="2">Dubai Summer Campaign</SelectItem>
                    <SelectItem value="3">Education Awareness Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">To be completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due Today
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueTodayTasks.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>
                View and manage your tasks
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    task.completed ? "bg-muted/50" : "hover:bg-accent/50"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {task.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {task.company}
                        </span>
                      )}
                      {task.deal && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {task.deal}
                        </span>
                      )}
                      {task.contact && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.contact}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-medium flex items-center gap-1 ${
                        !task.completed && isOverdue(task.dueDate) ? "text-red-500" : ""
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(task.dueDate)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(task.assignedTo)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {task.assignedTo}
                        </span>
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
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Reassign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!task.completed ? (
                          <DropdownMenuItem className="text-green-600">
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Mark Incomplete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">No tasks found</h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedTab === "completed"
                      ? "No completed tasks yet"
                      : selectedTab === "overdue"
                      ? "Great! You have no overdue tasks"
                      : "Create a new task to get started"}
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
