export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Mail,
  Briefcase,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { AddMemberDialog } from "./add-member-dialog";

async function getTeamMembers() {
  const result = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ department: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      avatarUrl: true,
      permissionLevel: true,
      isFreelancer: true,
      skills: true,
    },
  });
  return result;
}

type TeamMember = Awaited<ReturnType<typeof getTeamMembers>>[number];

async function getTeamStats() {
  try {
    const [total, freelancers, departments] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, isFreelancer: true } }),
      prisma.user.groupBy({
        by: ["department"],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      fullTime: total - freelancers,
      freelancers,
      departmentCount: departments.length,
    };
  } catch {
    return { total: 0, fullTime: 0, freelancers: 0, departmentCount: 0 };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadge(permissionLevel: string) {
  switch (permissionLevel) {
    case "ADMIN":
      return <Badge className="bg-red-500">Admin</Badge>;
    case "LEADERSHIP":
      return <Badge className="bg-purple-500">Leadership</Badge>;
    case "TEAM_LEAD":
      return <Badge className="bg-blue-500">Team Lead</Badge>;
    case "STAFF":
      return <Badge variant="secondary">Staff</Badge>;
    case "FREELANCER":
      return <Badge variant="outline">Freelancer</Badge>;
    default:
      return null;
  }
}

export default async function TeamPage() {
  let members: Awaited<ReturnType<typeof getTeamMembers>> = [];
  let stats = { total: 0, fullTime: 0, freelancers: 0, departmentCount: 0 };

  try {
    [members, stats] = await Promise.all([getTeamMembers(), getTeamStats()]);
  } catch {
    // Fallback to defaults on error
  }

  // Group by department
  const departments = members.reduce((acc: Record<string, TeamMember[]>, member: TeamMember) => {
    const dept = member.department || "Other";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage team members and organizational structure
          </p>
        </div>
        <AddMemberDialog departments={Object.keys(departments)} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Full-Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.fullTime}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Freelancers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.freelancers}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.departmentCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search team members..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <div className="flex border rounded-md">
          <Button variant="ghost" size="icon" className="rounded-r-none">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-l-none">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Team Grid by Department */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.keys(departments)
            .sort()
            .slice(0, 5)
            .map((dept) => (
              <TabsTrigger key={dept} value={dept}>
                {dept}
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {(Object.entries(departments) as [string, TeamMember[]][])
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dept, deptMembers]) => (
              <div key={dept}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  {dept}
                  <Badge variant="secondary">{deptMembers.length}</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {deptMembers.map((member) => (
                    <Card key={member.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-16 w-16 mb-4">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {member.role}
                          </p>
                          {getRoleBadge(member.permissionLevel)}

                          {member.skills && member.skills.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-3">
                              {member.skills.slice(0, 3).map((skill: string) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${member.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/team/${member.id}`}>
                                View Profile
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </TabsContent>

        {(Object.entries(departments) as [string, TeamMember[]][]).map(([dept, deptMembers]) => (
          <TabsContent key={dept} value={dept}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deptMembers.map((member) => (
                <Card key={member.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-4">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {member.role}
                      </p>
                      {getRoleBadge(member.permissionLevel)}

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/team/${member.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
