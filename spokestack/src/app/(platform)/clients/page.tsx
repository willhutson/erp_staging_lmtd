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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  Repeat,
  TrendingUp,
  Clock,
} from "lucide-react";

async function getClients() {
  try {
    return prisma.client.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            projects: true,
            briefs: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

async function getClientStats() {
  try {
    const [total, retainer, project] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { isRetainer: true } }),
      prisma.client.count({ where: { isRetainer: false } }),
    ]);

    return { total, retainer, project };
  } catch {
    return { total: 0, retainer: 0, project: 0 };
  }
}

function getStatusBadge(isActive: boolean, isRetainer: boolean) {
  if (!isActive) {
    return <Badge variant="outline">Inactive</Badge>;
  }
  if (isRetainer) {
    return <Badge className="bg-emerald-500">Retainer</Badge>;
  }
  return <Badge variant="secondary">Project</Badge>;
}

export default async function ClientsPage() {
  let clients: Awaited<ReturnType<typeof getClients>> = [];
  let stats = { total: 0, retainer: 0, project: 0 };

  try {
    [clients, stats] = await Promise.all([getClients(), getClientStats()]);
  } catch {
    // Fallback to defaults
  }

  const retainerClients = clients.filter((c) => c.isRetainer);
  const projectClients = clients.filter((c) => !c.isRetainer);
  const activeClients = clients.filter((c) => c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage client accounts, retainers, and relationships
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retainer Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{stats.retainer}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats.project}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{activeClients.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All ({clients.length})</TabsTrigger>
                <TabsTrigger value="retainer">Retainer ({retainerClients.length})</TabsTrigger>
                <TabsTrigger value="project">Project ({projectClients.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <ClientTable clients={clients} />
            </TabsContent>

            <TabsContent value="retainer" className="m-0">
              <ClientTable clients={retainerClients} />
            </TabsContent>

            <TabsContent value="project" className="m-0">
              <ClientTable clients={projectClients} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientTable({ clients }: { clients: Awaited<ReturnType<typeof getClients>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Projects</TableHead>
          <TableHead>Briefs</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No clients found
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={client.logoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:underline"
                    >
                      {client.name}
                    </Link>
                    {client.website && (
                      <p className="text-xs text-muted-foreground truncate">
                        {client.website.replace(/^https?:\/\//, '')}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {client.code}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {client.industry || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{client._count.projects}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{client._count.briefs}</span>
              </TableCell>
              <TableCell>{getStatusBadge(client.isActive, client.isRetainer)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/clients/${client.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/clients/${client.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/retainers?client=${client.id}`}>View Retainers</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects?client=${client.id}`}>View Projects</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
