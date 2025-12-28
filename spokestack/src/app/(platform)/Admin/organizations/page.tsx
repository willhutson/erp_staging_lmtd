"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Settings,
  ExternalLink,
  Calendar,
  Globe,
  Shield,
  Mail,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - will be replaced with real data
const mockOrganizations = [
  {
    id: "1",
    name: "TeamLMTD",
    slug: "teamlmtd",
    type: "AGENCY",
    isActive: true,
    memberCount: 46,
    enabledModules: ["ADMIN", "CRM", "LISTENING", "MEDIA_BUYING", "ANALYTICS", "BUILDER"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "CCAD",
    slug: "ccad",
    type: "BRAND",
    isActive: true,
    memberCount: 5,
    enabledModules: ["ANALYTICS", "BUILDER"],
    parentId: "1",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Dubai Tourism",
    slug: "det",
    type: "BRAND",
    isActive: true,
    memberCount: 3,
    enabledModules: ["ANALYTICS", "BUILDER"],
    parentId: "1",
    createdAt: "2024-03-10",
  },
];

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<typeof mockOrganizations[0] | null>(null);

  const filteredOrganizations = mockOrganizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "PLATFORM":
        return "default";
      case "AGENCY":
        return "secondary";
      case "BRAND":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage organizations and their settings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to the platform. Organizations can be agencies or brands.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" placeholder="e.g., Acme Agency" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="e.g., acme-agency" />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Will be auto-generated if left empty.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue="AGENCY">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENCY">Agency</SelectItem>
                    <SelectItem value="BRAND">Brand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Organization (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level)</SelectItem>
                    {mockOrganizations
                      .filter((org) => org.type === "AGENCY")
                      .map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Organization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrganizations.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockOrganizations.filter((o) => o.type === "AGENCY").length} agencies,{" "}
              {mockOrganizations.filter((o) => o.type === "BRAND").length} brands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockOrganizations.reduce((sum, org) => sum + org.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Organizations
            </CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockOrganizations.filter((o) => o.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockOrganizations.filter((o) => !o.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>
                View and manage all organizations in the platform
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search organizations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">
                          /{org.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(org.type)}>
                      {org.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{org.memberCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {org.enabledModules.slice(0, 3).map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                      {org.enabledModules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{org.enabledModules.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={org.isActive ? "default" : "secondary"}>
                      {org.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrg(org)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Organization Details Sheet */}
      <Sheet open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          {selectedOrg && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#52EDC7]/20">
                    <Building2 className="h-7 w-7 text-[#52EDC7]" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedOrg.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      /{selectedOrg.slug}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status & Type */}
                <div className="flex items-center gap-3">
                  <Badge variant={selectedOrg.isActive ? "default" : "secondary"}>
                    {selectedOrg.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{selectedOrg.type}</Badge>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      Members
                    </div>
                    <p className="text-2xl font-bold mt-1">{selectedOrg.memberCount}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Shield className="h-4 w-4" />
                      Modules
                    </div>
                    <p className="text-2xl font-bold mt-1">{selectedOrg.enabledModules.length}</p>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Details</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(selectedOrg.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Email
                      </span>
                      <span className="text-sm font-medium">admin@{selectedOrg.slug}.com</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </span>
                      <span className="text-sm font-medium">+971 4 XXX XXXX</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Enabled Modules */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Enabled Modules</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrg.enabledModules.map((module) => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Organization
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
