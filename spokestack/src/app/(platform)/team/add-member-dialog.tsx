"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AddMemberDialogProps {
  departments: string[];
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

export function AddMemberDialog({ departments }: AddMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    permissionLevel: "STAFF",
    isFreelancer: false,
    weeklyCapacity: 40,
  });

  const allDepartments = [...new Set([...DEFAULT_DEPARTMENTS, ...departments])].sort();

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
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        permissionLevel: "STAFF",
        isFreelancer: false,
        weeklyCapacity: 40,
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team. They will receive an email invitation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
          </div>

          <DialogFooter>
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
