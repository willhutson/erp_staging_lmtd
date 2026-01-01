"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  Star,
  UserPlus,
  Clock,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock contacts data
const mockContacts = [
  {
    id: "1",
    firstName: "Ahmed",
    lastName: "Al Rashid",
    email: "ahmed.rashid@ccad.ae",
    phone: "+971 50 123 4567",
    title: "Marketing Director",
    department: "Marketing",
    company: "Creative Communications Abu Dhabi",
    companyId: "1",
    type: "CLIENT",
    status: "ACTIVE",
    lastContactedAt: "2024-12-27T10:30:00Z",
    avatar: null,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@det.ae",
    phone: "+971 55 987 6543",
    title: "Head of Partnerships",
    department: "Business Development",
    company: "Dubai Economy & Tourism",
    companyId: "2",
    type: "CLIENT",
    status: "ACTIVE",
    lastContactedAt: "2024-12-26T14:00:00Z",
    avatar: null,
  },
  {
    id: "3",
    firstName: "Mohammed",
    lastName: "Hassan",
    email: "m.hassan@adek.gov.ae",
    phone: "+971 52 555 1234",
    title: "Communications Manager",
    department: "Communications",
    company: "Abu Dhabi Education & Knowledge",
    companyId: "3",
    type: "CLIENT",
    status: "ACTIVE",
    lastContactedAt: "2024-12-20T09:00:00Z",
    avatar: null,
  },
  {
    id: "4",
    firstName: "Lisa",
    lastName: "Chen",
    email: "lisa.chen@ecd.ae",
    phone: "+971 54 333 2211",
    title: "Creative Director",
    department: "Creative",
    company: "Emirates Creative Digital",
    companyId: "4",
    type: "PARTNER",
    status: "ACTIVE",
    lastContactedAt: "2024-12-25T16:00:00Z",
    avatar: null,
  },
  {
    id: "5",
    firstName: "James",
    lastName: "Wilson",
    email: "james@acme-marketing.com",
    phone: "+1 555 123 4567",
    title: "CEO",
    department: "Executive",
    company: "Acme Marketing Solutions",
    companyId: "5",
    type: "LEAD",
    status: "ACTIVE",
    lastContactedAt: "2024-12-15T11:00:00Z",
    avatar: null,
  },
  {
    id: "6",
    firstName: "Fatima",
    lastName: "Al Maktoum",
    email: "fatima@ccad.ae",
    phone: "+971 50 888 9999",
    title: "Account Manager",
    department: "Client Services",
    company: "Creative Communications Abu Dhabi",
    companyId: "1",
    type: "CLIENT",
    status: "ACTIVE",
    lastContactedAt: "2024-12-28T08:30:00Z",
    avatar: null,
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredContacts = mockContacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "CLIENT":
        return "default";
      case "LEAD":
        return "secondary";
      case "PROSPECT":
        return "secondary";
      case "PARTNER":
        return "outline";
      case "CREATOR":
        return "default";
      default:
        return "outline";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatLastContacted = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and relationships
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+971 50 123 4567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" placeholder="e.g., Marketing Manager" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="e.g., Marketing" />
                </div>
              </div>
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
                    <SelectItem value="4">Emirates Creative Digital</SelectItem>
                    <SelectItem value="new">+ Add New Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Contact Type</Label>
                <Select defaultValue="LEAD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAD">Lead</SelectItem>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="PARTNER">Partner</SelectItem>
                    <SelectItem value="CREATOR">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Add Contact
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
              Total Contacts
            </CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockContacts.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockContacts.filter((c) => c.status === "ACTIVE").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockContacts.filter((c) => c.type === "CLIENT").length}
            </div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockContacts.filter((c) => c.type === "LEAD" || c.type === "PROSPECT").length}
            </div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recently Contacted
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockContacts.filter((c) => {
                const date = new Date(c.lastContactedAt);
                const now = new Date();
                const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contacts</CardTitle>
              <CardDescription>
                View and manage contact records
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CLIENT">Clients</SelectItem>
                  <SelectItem value="LEAD">Leads</SelectItem>
                  <SelectItem value="PROSPECT">Prospects</SelectItem>
                  <SelectItem value="PARTNER">Partners</SelectItem>
                  <SelectItem value="CREATOR">Creators</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
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
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || undefined} />
                        <AvatarFallback>
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {contact.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(contact.type)}>
                      {contact.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{contact.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.department}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {formatLastContacted(contact.lastContactedAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
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
    </div>
  );
}
