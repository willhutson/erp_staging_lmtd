export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Building2, Users, ExternalLink } from "lucide-react";

async function getOrganizations() {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            clientInstances: true,
          },
        },
      },
    }).catch(() => []);
    return orgs;
  } catch {
    return [];
  }
}

export default async function OrganizationsPage() {
  let organizations: Awaited<ReturnType<typeof getOrganizations>> = [];

  try {
    organizations = await getOrganizations();
  } catch {
    // Fallback to empty array on error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage all organizations on the SpokeStack platform
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/organizations/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Clients</TableHead>
                <TableHead className="text-center">Instances</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No organizations yet. Create your first one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="h-6 w-6 rounded"
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {org.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {org.domain ? (
                        <a
                          href={`https://${org.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {org.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{org._count.users}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{org._count.clients}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{org._count.clientInstances}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString()}
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
                            <Link href={`/superadmin/organizations/${org.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/organizations/${org.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/instances/new?org=${org.id}`}>
                              Create Instance
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
