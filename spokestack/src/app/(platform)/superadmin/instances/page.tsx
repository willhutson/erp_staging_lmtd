export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  XCircle,
  Clock,
} from "lucide-react";

async function getClientInstances() {
  return prisma.clientInstance.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true, slug: true } },
      _count: {
        select: { users: true },
      },
    },
  });
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

export default async function InstancesPage() {
  const instances = await getClientInstances();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Instances</h1>
          <p className="text-muted-foreground">
            White-label portals with custom branding and domains
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/instances/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Instance
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instance</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Custom Domain</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No client instances yet. Create one to enable white-labeling.
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((instance) => (
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
                            {instance.enabledModules.length} modules enabled
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{instance.organization?.name || "-"}</span>
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
                    <TableCell>
                      <Badge className={getTierColor(instance.tier)}>
                        {instance.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{instance._count.users}</Badge>
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
                            <Link href={`/superadmin/instances/${instance.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/instances/${instance.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/instances/${instance.id}/branding`}>
                              Configure Branding
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/instances/${instance.id}/domains`}>
                              <Globe className="mr-2 h-4 w-4" />
                              Manage Domains
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
