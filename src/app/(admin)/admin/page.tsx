"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FolderKanban, Shield, FileText, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.permissionLevel === "ADMIN";

  const quickLinks = [
    {
      title: "Users",
      description: "Manage team members and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-500",
    },
    {
      title: "Clients",
      description: "View and manage client accounts",
      icon: Building2,
      href: "/admin/clients",
      color: "text-green-500",
    },
    {
      title: "Projects",
      description: "Oversee all projects across clients",
      icon: FolderKanban,
      href: "/admin/projects",
      color: "text-purple-500",
    },
    {
      title: "Access Policies",
      description: "Configure access rules and permissions",
      icon: Shield,
      href: "/admin/access-policies",
      color: "text-orange-500",
    },
    {
      title: "Audit Logs",
      description: "Review system activity and changes",
      icon: FileText,
      href: "/admin/audit-logs",
      color: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Manage your organization settings here.
        </p>
      </div>

      {/* Permission level notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h3 className="font-semibold">Your Permission Level: {session?.user?.permissionLevel}</h3>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "You have full administrative access to all features."
                  : "Some features may be restricted based on your role."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <link.icon className={`h-8 w-8 ${link.color}`} />
                <div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Policy workflow section for leadership */}
      {(session?.user?.permissionLevel === "LEADERSHIP" ||
        session?.user?.permissionLevel === "ADMIN") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Policy Workflow
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Review and approve pending access policy changes"
                : "Submit new access policies for admin approval"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/admin/access-policies?status=SUBMITTED">
                <div className="text-center p-4 rounded-lg border hover:bg-muted cursor-pointer">
                  <div className="text-2xl font-bold text-yellow-500">-</div>
                  <div className="text-sm text-muted-foreground">Pending Approval</div>
                </div>
              </Link>
              <Link href="/admin/access-policies?status=DRAFT">
                <div className="text-center p-4 rounded-lg border hover:bg-muted cursor-pointer">
                  <div className="text-2xl font-bold text-gray-500">-</div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
              </Link>
              <Link href="/admin/access-policies?status=APPROVED">
                <div className="text-center p-4 rounded-lg border hover:bg-muted cursor-pointer">
                  <div className="text-2xl font-bold text-green-500">-</div>
                  <div className="text-sm text-muted-foreground">Active Policies</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
