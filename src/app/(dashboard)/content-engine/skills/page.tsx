import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Zap,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Brain
} from "lucide-react";

// Inferred type
type SkillRecord = Awaited<ReturnType<typeof db.agentSkill.findMany>>[number];

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  BRIEF_MANAGEMENT: { icon: <FileText className="h-4 w-4" />, label: "Brief Management", color: "bg-blue-100 text-blue-700" },
  RESOURCE_PLANNING: { icon: <Users className="h-4 w-4" />, label: "Resource Planning", color: "bg-purple-100 text-purple-700" },
  CLIENT_RELATIONS: { icon: <TrendingUp className="h-4 w-4" />, label: "Client Relations", color: "bg-green-100 text-green-700" },
  QUALITY_ASSURANCE: { icon: <CheckCircle className="h-4 w-4" />, label: "Quality Assurance", color: "bg-yellow-100 text-yellow-700" },
  WORKFLOW: { icon: <Clock className="h-4 w-4" />, label: "Workflow", color: "bg-orange-100 text-orange-700" },
  ANALYTICS: { icon: <Activity className="h-4 w-4" />, label: "Analytics", color: "bg-indigo-100 text-indigo-700" },
  CONTENT_CREATION: { icon: <Brain className="h-4 w-4" />, label: "Content Creation", color: "bg-pink-100 text-pink-700" },
  KNOWLEDGE: { icon: <FileText className="h-4 w-4" />, label: "Knowledge", color: "bg-gray-100 text-gray-700" },
};

const USAGE_CONTEXT: Record<string, string[]> = {
  BRIEF_MANAGEMENT: ["Brief Creation", "Brief Assignment", "Brief Routing"],
  RESOURCE_PLANNING: ["Team Assignment", "Capacity Planning", "Workload Balancing"],
  CLIENT_RELATIONS: ["Client Health Monitoring", "Relationship Scoring"],
  QUALITY_ASSURANCE: ["Deliverable Review", "Quality Scoring", "Pre-delivery Checks"],
  WORKFLOW: ["Deadline Tracking", "Status Updates", "Escalations"],
  ANALYTICS: ["Performance Reports", "Trend Analysis"],
  CONTENT_CREATION: ["Copy Generation", "Report Building"],
  KNOWLEDGE: ["Document Retrieval", "Context Building"],
};

export default async function SkillsListPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const skills = await db.agentSkill.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: [{ isEnabled: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  // Group by category
  const skillsByCategory = skills.reduce(
    (acc: Record<string, SkillRecord[]>, skill: SkillRecord) => {
      const category = skill.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, SkillRecord[]>
  );

  const totalSkills = skills.length;
  const activeSkills = skills.filter((s: SkillRecord) => s.isEnabled).length;
  const disabledSkills = skills.filter((s: SkillRecord) => !s.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Skills Library</h1>
            <p className="text-gray-500 mt-1">
              All agent skills available in the system
            </p>
          </div>
        </div>
        <Link href="/content-engine/sandbox">
          <Button className="bg-[#52EDC7] hover:bg-[#1BA098] text-black">
            <Zap className="h-4 w-4 mr-2" />
            New Skill
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSkills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeSkills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Disabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{disabledSkills}</div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category */}
      {Object.entries(skillsByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No skills have been created yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the Skill Sandbox to create your first skill
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Object.entries(skillsByCategory) as [string, SkillRecord[]][]).map(([category, categorySkills]) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.KNOWLEDGE;
            const usedFor = USAGE_CONTEXT[category] || [];

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${config.color}`}>
                      {config.icon}
                    </span>
                    {config.label}
                    <Badge variant="secondary" className="ml-2">
                      {categorySkills.length} skill{categorySkills.length !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                  {usedFor.length > 0 && (
                    <CardDescription>
                      Used for: {usedFor.join(", ")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {categorySkills.map((skill: SkillRecord) => (
                      <Link
                        key={skill.id}
                        href={`/content-engine/skills/${skill.slug}`}
                        className="block p-4 rounded-lg border hover:border-[#52EDC7] hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{skill.name}</h3>
                          <Badge
                            variant={skill.isEnabled ? "default" : "secondary"}
                            className={skill.isEnabled ? "bg-green-100 text-green-700" : ""}
                          >
                            {skill.isEnabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {skill.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {skill.invocationCount} runs
                          </span>
                          {skill.successRate !== null && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {Math.round(skill.successRate)}% success
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>What Are Skills?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Skills</strong> are AI-powered capabilities that automate specific tasks.
            Each skill has defined inputs, outputs, and triggers.
          </p>
          <p>
            Skills can be triggered automatically by events (like a new brief being created)
            or manually invoked when needed.
          </p>
          <p>
            Each skill includes <strong>Founder Knowledge</strong> - captured expertise from
            15+ years of agency experience that guides the AI&apos;s decision-making.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
