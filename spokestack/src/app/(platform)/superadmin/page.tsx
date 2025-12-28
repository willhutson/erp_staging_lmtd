export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Globe,
  Layers,
  ArrowRight,
  TrendingUp,
  Server,
} from "lucide-react";

async function getStats() {
  try {
    const [orgCount, userCount, instanceCount, activeInstances] = await Promise.all([
      prisma.organization.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.clientInstance.count().catch(() => 0),
      prisma.clientInstance.count({ where: { isActive: true } }).catch(() => 0),
    ]);

    return { orgCount, userCount, instanceCount, activeInstances };
  } catch {
    return { orgCount: 0, userCount: 0, instanceCount: 0, activeInstances: 0 };
  }
}

async function getRecentOrganizations() {
  try {
    return await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, clients: true },
        },
      },
    });
  } catch {
    return [];
  }
}

async function getRecentInstances() {
  try {
    return await prisma.clientInstance.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true, slug: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function SuperAdminPage() {
  let stats = { orgCount: 0, userCount: 0, instanceCount: 0, activeInstances: 0 };
  let recentOrgs: Awaited<ReturnType<typeof getRecentOrganizations>> = [];
  let recentInstances: Awaited<ReturnType<typeof getRecentInstances>> = [];

  try {
    [stats, recentOrgs, recentInstances] = await Promise.all([
      getStats(),
      getRecentOrganizations(),
      getRecentInstances(),
    ]);
  } catch {
    // Fallback to defaults on error
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide management for SpokeStack
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgCount}</div>
            <p className="text-xs text-muted-foreground">Total registered orgs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Instances</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instanceCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeInstances} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Verified domains</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/superadmin/organizations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organizations
              </CardTitle>
              <CardDescription>
                Manage all organizations on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/superadmin/instances">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Client Instances
              </CardTitle>
              <CardDescription>
                White-label portals and custom domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                Manage <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/superadmin/domains">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                Domain Management
              </CardTitle>
              <CardDescription>
                Verify and configure custom domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                Configure <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
            <CardDescription>Newest organizations on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No organizations yet</p>
              ) : (
                recentOrgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org._count.users} users, {org._count.clients} clients
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{org.slug}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Client Instances</CardTitle>
            <CardDescription>Newest white-label portals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInstances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No instances yet</p>
              ) : (
                recentInstances.map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: instance.primaryColor || "#52EDC7" }}
                      >
                        <span className="text-xs font-bold text-white">
                          {instance.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{instance.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {instance.organization?.name || "Unknown org"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={instance.isActive ? "default" : "secondary"}
                        className={instance.isActive ? "bg-green-500" : ""}
                      >
                        {instance.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{instance.tier}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
