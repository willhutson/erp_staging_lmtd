import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Zap,
  FileText,
  Brain,
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import type { SkillCategory } from "@/modules/content-engine/types";

const CATEGORY_ICONS: Record<SkillCategory, React.ReactNode> = {
  BRIEF_MANAGEMENT: <FileText className="h-5 w-5" />,
  RESOURCE_PLANNING: <Activity className="h-5 w-5" />,
  CLIENT_RELATIONS: <TrendingUp className="h-5 w-5" />,
  CONTENT_CREATION: <Brain className="h-5 w-5" />,
  QUALITY_ASSURANCE: <Zap className="h-5 w-5" />,
  ANALYTICS: <TrendingUp className="h-5 w-5" />,
  WORKFLOW: <Clock className="h-5 w-5" />,
  KNOWLEDGE: <FileText className="h-5 w-5" />,
};

export default async function ContentEnginePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const isAdmin = can(session.user as Parameters<typeof can>[0], "admin:access");

  // Fetch skills and stats
  const [skills, recentInvocations] = await Promise.all([
    db.agentSkill.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { invocationCount: "desc" },
    }),
    db.agentInvocation.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { skill: true },
    }),
  ]);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category as SkillCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, typeof skills>);

  // Calculate stats
  const totalInvocations = skills.reduce((sum, s) => sum + s.invocationCount, 0);
  const activeSkills = skills.filter((s) => s.status === "ACTIVE").length;
  const avgSuccessRate = skills.length > 0
    ? skills.reduce((sum, s) => sum + (s.successRate ?? 0), 0) / skills.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Engine</h1>
          <p className="text-gray-500 mt-1">
            AI-powered skills and knowledge management
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/content-engine/sandbox"
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Skill
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSkills} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invocations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvocations}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across skills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(skillsByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With skills defined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/content-engine/sandbox">
          <Card className="hover:border-[#52EDC7] transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#52EDC7]" />
                Skill Sandbox
              </CardTitle>
              <CardDescription>
                Test and develop skills interactively
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/content-engine/capture">
          <Card className="hover:border-[#52EDC7] transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#52EDC7]" />
                Knowledge Capture
              </CardTitle>
              <CardDescription>
                Record founder expertise through interviews
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/content-engine/knowledge">
          <Card className="hover:border-[#52EDC7] transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#52EDC7]" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Browse procedures, playbooks, and templates
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Skills by Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Skills by Category</h2>
        {Object.keys(skillsByCategory).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No skills created yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                <Link href="/content-engine/sandbox" className="text-[#52EDC7] hover:underline">
                  Create your first skill
                </Link>{" "}
                to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.entries(skillsByCategory) as [SkillCategory, typeof skills][]).map(
              ([category, categorySkills]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {CATEGORY_ICONS[category]}
                      {category.replace(/_/g, " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categorySkills.map((skill) => (
                        <Link
                          key={skill.id}
                          href={`/content-engine/skills/${skill.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">{skill.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {skill.invocationCount} invocations
                            </p>
                          </div>
                          <Badge
                            variant={skill.status === "ACTIVE" ? "default" : "secondary"}
                          >
                            {skill.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentInvocations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentInvocations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          inv.status === "COMPLETED"
                            ? "bg-green-500"
                            : inv.status === "FAILED"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {inv.skill?.name ?? inv.skillSlug}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.triggeredBy} • {inv.durationMs ? `${inv.durationMs}ms` : "pending"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
