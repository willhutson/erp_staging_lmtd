export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Palette,
  Settings,
} from "lucide-react";

interface InstanceWithCount {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  customDomainVerified: boolean;
  tier: string;
  isActive: boolean;
  primaryColor: string | null;
  logoMark: string | null;
  enabledModules: string[];
  createdAt: Date;
  _count: { users: number };
}

// TODO: Get organizationId from session
async function getOrgInstances(organizationId?: string): Promise<InstanceWithCount[]> {
  try {
    // For now, get all instances - will filter by org from session later
    const instances = await prisma.clientInstance.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
      // When we have session:
      // where: { organizationId },
    });
    return instances as InstanceWithCount[];
  } catch (error) {
    console.error("Error fetching instances:", error);
    return [];
  }
}

function getTierColor(tier: string) {
  switch (tier) {
    case "ENTERPRISE":
      return "bg-purple-500";
    case "PRO":
      return "bg-blue-500";
    case "FREE":
    default:
      return "bg-gray-500";
  }
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "ENTERPRISE":
      return <Badge className="bg-purple-500">Enterprise</Badge>;
    case "PRO":
      return <Badge className="bg-blue-500">Pro</Badge>;
    case "FREE":
    default:
      return <Badge variant="secondary">Free</Badge>;
  }
}

export default async function OrgInstancesPage() {
  const instances = await getOrgInstances();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Portals</h1>
          <p className="text-muted-foreground">
            Manage your white-label client portals and their branding
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/instances/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Portal
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Portals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {instances.filter((i) => i.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custom Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instances.filter((i) => i.customDomain).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instances.reduce((sum, i) => sum + i._count.users, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instances Grid for visual appeal, Table for data */}
      {instances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Client Portals Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first white-label portal to give clients their own branded experience.
            </p>
            <Button asChild>
              <Link href="/admin/instances/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Portal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portal</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Custom Domain</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: instance.primaryColor || "#52EDC7" }}
                        >
                          {instance.logoMark ? (
                            <img
                              src={instance.logoMark}
                              alt={instance.name}
                              className="h-6 w-6 rounded"
                            />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {instance.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{instance.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(instance.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://${instance.slug}.spokestack.io`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {instance.slug}.spokestack.io
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {instance.customDomain ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://${instance.customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm hover:underline"
                          >
                            {instance.customDomain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {instance.customDomainVerified ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getTierBadge(instance.tier)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{instance._count.users}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{instance.enabledModules.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {instance.isActive ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/instances/${instance.id}`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/instances/${instance.id}/branding`}>
                              <Palette className="mr-2 h-4 w-4" />
                              Branding
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/instances/${instance.id}/domains`}>
                              <Globe className="mr-2 h-4 w-4" />
                              Manage Domains
                            </Link>
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
      )}
    </div>
  );
}
