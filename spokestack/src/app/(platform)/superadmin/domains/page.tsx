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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Shield,
} from "lucide-react";

async function getDomainsWithInstances() {
  try {
    const instances = await prisma.clientInstance.findMany({
      where: {
        customDomain: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        customDomainVerified: true,
        organization: { select: { name: true, slug: true } },
      },
    });
    return instances;
  } catch {
    return [];
  }
}

async function getDomainStats() {
  try {
    const [total, verified, pending] = await Promise.all([
      prisma.clientInstance.count({ where: { customDomain: { not: null } } }).catch(() => 0),
      prisma.clientInstance.count({ where: { customDomain: { not: null }, customDomainVerified: true } }).catch(() => 0),
      prisma.clientInstance.count({ where: { customDomain: { not: null }, customDomainVerified: false } }).catch(() => 0),
    ]);
    return { total, verified, pending };
  } catch {
    return { total: 0, verified: 0, pending: 0 };
  }
}

export default async function DomainsPage() {
  let domains: Awaited<ReturnType<typeof getDomainsWithInstances>> = [];
  let stats = { total: 0, verified: 0, pending: 0 };

  try {
    [domains, stats] = await Promise.all([
      getDomainsWithInstances(),
      getDomainStats(),
    ]);
  } catch {
    // Fallback to defaults on error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domain Management</h1>
          <p className="text-muted-foreground">
            Verify and configure custom domains for client portals
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.verified}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains Table */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            All custom domains configured for client portals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Instance</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No custom domains configured yet
                  </TableCell>
                </TableRow>
              ) : (
                domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{domain.customDomain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/superadmin/instances/${domain.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {domain.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {domain.slug}.spokestack.io
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{domain.organization?.name || "-"}</span>
                    </TableCell>
                    <TableCell>
                      {domain.customDomainVerified ? (
                        <Badge className="bg-green-500 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
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
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Verify DNS
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            View SSL Status
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/instances/${domain.id}`}>
                              View Instance
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

      {/* DNS Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>
            Instructions for setting up custom domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">CNAME Record</h4>
            <p className="text-sm text-muted-foreground">
              Point your custom domain to SpokeStack by adding a CNAME record:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <span className="text-muted-foreground">Type:</span> CNAME<br />
              <span className="text-muted-foreground">Name:</span> @ or subdomain<br />
              <span className="text-muted-foreground">Value:</span> proxy.spokestack.io
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">SSL Certificate</h4>
            <p className="text-sm text-muted-foreground">
              Once DNS is verified, SSL certificates are automatically provisioned via Let's Encrypt.
              This typically takes 5-10 minutes after DNS propagation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
