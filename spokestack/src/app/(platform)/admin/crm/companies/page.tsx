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
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Globe,
  Users,
  DollarSign,
  Briefcase,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock companies data
const mockCompanies = [
  {
    id: "1",
    name: "Creative Communications Abu Dhabi",
    legalName: "CCAD LLC",
    industry: "Government",
    website: "https://ccad.ae",
    type: "CLIENT",
    size: "LARGE",
    email: "info@ccad.ae",
    phone: "+971 2 123 4567",
    city: "Abu Dhabi",
    country: "UAE",
    contactCount: 12,
    dealCount: 5,
    totalValue: 850000,
    isActive: true,
  },
  {
    id: "2",
    name: "Dubai Economy & Tourism",
    legalName: "DET",
    industry: "Government",
    website: "https://visitdubai.com",
    type: "CLIENT",
    size: "ENTERPRISE",
    email: "partnerships@det.ae",
    phone: "+971 4 987 6543",
    city: "Dubai",
    country: "UAE",
    contactCount: 8,
    dealCount: 3,
    totalValue: 1200000,
    isActive: true,
  },
  {
    id: "3",
    name: "Abu Dhabi Education & Knowledge",
    legalName: "ADEK",
    industry: "Education",
    website: "https://adek.gov.ae",
    type: "CLIENT",
    size: "ENTERPRISE",
    email: "info@adek.gov.ae",
    phone: "+971 2 555 1234",
    city: "Abu Dhabi",
    country: "UAE",
    contactCount: 6,
    dealCount: 2,
    totalValue: 450000,
    isActive: true,
  },
  {
    id: "4",
    name: "Emirates Creative Digital",
    legalName: "ECD FZ-LLC",
    industry: "Technology",
    website: "https://ecd.ae",
    type: "PARTNER",
    size: "MEDIUM",
    email: "hello@ecd.ae",
    phone: "+971 4 333 2211",
    city: "Dubai",
    country: "UAE",
    contactCount: 4,
    dealCount: 1,
    totalValue: 75000,
    isActive: true,
  },
  {
    id: "5",
    name: "Acme Marketing Solutions",
    legalName: "Acme Inc.",
    industry: "Marketing",
    website: "https://acme-marketing.com",
    type: "PROSPECT",
    size: "SMALL",
    email: "info@acme-marketing.com",
    phone: "+1 555 123 4567",
    city: "New York",
    country: "USA",
    contactCount: 2,
    dealCount: 0,
    totalValue: 0,
    isActive: true,
  },
];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || company.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "CLIENT":
        return "default";
      case "PROSPECT":
        return "secondary";
      case "PARTNER":
        return "outline";
      case "VENDOR":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage client companies, prospects, and partners
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
              <DialogDescription>
                Add a new company to your CRM. You can add contacts and deals after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" placeholder="e.g., Acme Corporation" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="legalName">Legal Name (optional)</Label>
                  <Input id="legalName" placeholder="e.g., Acme Corp. LLC" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select defaultValue="PROSPECT">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROSPECT">Prospect</SelectItem>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="PARTNER">Partner</SelectItem>
                      <SelectItem value="VENDOR">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="info@company.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 555 123 4567" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g., Dubai" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g., UAE" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Add Company
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
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCompanies.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockCompanies.filter((c) => c.type === "CLIENT").length} active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCompanies.reduce((sum, c) => sum + c.contactCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deals
            </CardTitle>
            <Briefcase className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCompanies.reduce((sum, c) => sum + c.dealCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockCompanies.reduce((sum, c) => sum + c.totalValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Companies</CardTitle>
              <CardDescription>
                View and manage company records
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
                  <SelectItem value="PROSPECT">Prospects</SelectItem>
                  <SelectItem value="PARTNER">Partners</SelectItem>
                  <SelectItem value="VENDOR">Vendors</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search companies..."
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
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            {company.website.replace("https://", "")}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(company.type)}>
                      {company.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.industry || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {company.city}, {company.country}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{company.contactCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{company.dealCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {company.totalValue > 0
                      ? formatCurrency(company.totalValue)
                      : "-"}
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Briefcase className="mr-2 h-4 w-4" />
                          View Deals
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
