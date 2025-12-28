"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  UserPlus,
  X,
  Users,
  FileText,
  Briefcase,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string | null;
}

interface Client {
  id: string;
  name: string;
}

interface AddMemberDialogProps {
  departments: string[];
  teamMembers?: TeamMember[];
  clients?: Client[];
}

const PERMISSION_LEVELS = [
  { value: "ADMIN", label: "Admin", description: "Full access to all features" },
  { value: "LEADERSHIP", label: "Leadership", description: "Access to all + RFP pipeline" },
  { value: "TEAM_LEAD", label: "Team Lead", description: "Manage team assignments" },
  { value: "STAFF", label: "Staff", description: "Standard employee access" },
  { value: "FREELANCER", label: "Freelancer", description: "Assigned work only" },
];

const DEFAULT_DEPARTMENTS = [
  "Creative",
  "Production",
  "Strategy",
  "Account Management",
  "Operations",
  "Technology",
];

// Mock team members for org chart placement (when not provided via props)
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "will", name: "Will Hutson", role: "Managing Director", department: "Leadership" },
  { id: "cj", name: "CJ Ocampo", role: "Creative Director", department: "Creative" },
  { id: "ted", name: "Ted Vicencio", role: "Head of Production", department: "Production" },
  { id: "salma", name: "Salma Hassan", role: "Account Director", department: "Account Management" },
  { id: "afaq", name: "Afaq Ahmed", role: "Head of Technology", department: "Technology" },
  { id: "matthew", name: "Matthew Reynolds", role: "Strategy Director", department: "Strategy" },
];

// Mock clients (when not provided via props)
const MOCK_CLIENTS: Client[] = [
  { id: "ccad", name: "Culture & Creative Arts Dubai" },
  { id: "det", name: "Dubai Economy & Tourism" },
  { id: "adek", name: "Abu Dhabi Education" },
  { id: "ecd", name: "Economy Dubai" },
];

// Workflow types
const WORKFLOW_TYPES = [
  { id: "video_shoot", label: "Video Shoot", color: "bg-blue-500" },
  { id: "video_edit", label: "Video Edit", color: "bg-indigo-500" },
  { id: "design", label: "Design", color: "bg-pink-500" },
  { id: "copywriting_en", label: "Copywriting (EN)", color: "bg-emerald-500" },
  { id: "copywriting_ar", label: "Copywriting (AR)", color: "bg-teal-500" },
  { id: "paid_media", label: "Paid Media", color: "bg-orange-500" },
  { id: "social_management", label: "Social Management", color: "bg-purple-500" },
  { id: "strategy", label: "Strategy", color: "bg-cyan-500" },
];

export function AddMemberDialog({ departments, teamMembers, clients }: AddMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    role: "",
    department: "",
    permissionLevel: "STAFF",
    isFreelancer: false,
    weeklyCapacity: 40,
    // Org Chart
    reportsTo: "",
    // Job Description
    jobDescription: "",
    responsibilities: [] as string[],
    qualifications: [] as string[],
    // Dependencies
    assignedClients: [] as string[],
    assignedWorkflows: [] as string[],
  });

  const [newResponsibility, setNewResponsibility] = useState("");
  const [newQualification, setNewQualification] = useState("");

  const allDepartments = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...departments])).sort();
  const allTeamMembers = teamMembers && teamMembers.length > 0 ? teamMembers : MOCK_TEAM_MEMBERS;
  const allClients = clients && clients.length > 0 ? clients : MOCK_CLIENTS;

  // Filter potential managers based on department
  const potentialManagers = allTeamMembers.filter((m) => {
    // If department is selected, show managers from same or leadership departments
    if (formData.department) {
      return m.department === formData.department || m.department === "Leadership";
    }
    return true;
  });

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()],
      }));
      setNewResponsibility("");
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification("");
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const toggleClient = (clientId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedClients: prev.assignedClients.includes(clientId)
        ? prev.assignedClients.filter((id) => id !== clientId)
        : [...prev.assignedClients, clientId],
    }));
  };

  const toggleWorkflow = (workflowId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedWorkflows: prev.assignedWorkflows.includes(workflowId)
        ? prev.assignedWorkflows.filter((id) => id !== workflowId)
        : [...prev.assignedWorkflows, workflowId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create team member");
      }

      toast.success("Team member added successfully");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      permissionLevel: "STAFF",
      isFreelancer: false,
      weeklyCapacity: 40,
      reportsTo: "",
      jobDescription: "",
      responsibilities: [],
      qualifications: [],
      assignedClients: [],
      assignedWorkflows: [],
    });
    setActiveTab("basic");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team with their org chart position, job description, and assignments.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="job" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Job Description
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Assignments
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4 pr-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Job Title</Label>
                    <Input
                      id="role"
                      placeholder="Designer"
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Org Chart Position */}
                <div className="grid gap-2">
                  <Label htmlFor="reportsTo" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Reports To (Manager)
                  </Label>
                  <Select
                    value={formData.reportsTo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, reportsTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager..." />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          <div className="flex flex-col">
                            <span>{manager.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {manager.role} • {manager.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This determines where the member appears in the org chart
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="permissionLevel">Permission Level</Label>
                  <Select
                    value={formData.permissionLevel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, permissionLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col">
                            <span>{level.label}</span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weeklyCapacity">Weekly Hours</Label>
                    <Input
                      id="weeklyCapacity"
                      type="number"
                      min={0}
                      max={60}
                      value={formData.weeklyCapacity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weeklyCapacity: parseInt(e.target.value) || 40 }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="isFreelancer"
                      checked={formData.isFreelancer}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isFreelancer: checked === true }))
                      }
                    />
                    <Label htmlFor="isFreelancer" className="text-sm font-normal">
                      Freelancer / Contractor
                    </Label>
                  </div>
                </div>
              </TabsContent>

              {/* Job Description Tab */}
              <TabsContent value="job" className="space-y-4 mt-0">
                <div className="grid gap-2">
                  <Label htmlFor="jobDescription">Job Description Summary</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Brief overview of the role and its purpose within the organization..."
                    value={formData.jobDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jobDescription: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Responsibilities */}
                <div className="grid gap-2">
                  <Label>Key Responsibilities</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility..."
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddResponsibility();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddResponsibility}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.responsibilities.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.responsibilities.map((resp, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                          <span className="text-sm flex-1">{resp}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveResponsibility(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Qualifications */}
                <div className="grid gap-2">
                  <Label>Required Qualifications</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a qualification..."
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddQualification();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddQualification}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.qualifications.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.qualifications.map((qual, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                          <span className="text-sm flex-1">{qual}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveQualification(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="space-y-6 mt-0">
                {/* Client Assignments */}
                <div className="space-y-3">
                  <Label>Client Assignments</Label>
                  <p className="text-xs text-muted-foreground">
                    Select which clients this team member will be working with
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {allClients.map((client) => {
                      const isSelected = formData.assignedClients.includes(client.id);
                      return (
                        <div
                          key={client.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                          onClick={() => toggleClient(client.id)}
                        >
                          <Checkbox checked={isSelected} />
                          <span className="text-sm font-medium">{client.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  {formData.assignedClients.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {formData.assignedClients.map((clientId) => {
                        const client = allClients.find((c) => c.id === clientId);
                        return (
                          <Badge key={clientId} variant="secondary">
                            {client?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Workflow Assignments */}
                <div className="space-y-3">
                  <Label>Workflow Capabilities</Label>
                  <p className="text-xs text-muted-foreground">
                    Select which types of work this team member can be assigned to
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKFLOW_TYPES.map((workflow) => {
                      const isSelected = formData.assignedWorkflows.includes(workflow.id);
                      return (
                        <div
                          key={workflow.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                          onClick={() => toggleWorkflow(workflow.id)}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${workflow.color}`} />
                            <span className="text-sm font-medium">{workflow.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {formData.assignedWorkflows.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {formData.assignedWorkflows.map((workflowId) => {
                        const workflow = WORKFLOW_TYPES.find((w) => w.id === workflowId);
                        return (
                          <Badge key={workflowId} variant="outline" className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${workflow?.color}`} />
                            {workflow?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
