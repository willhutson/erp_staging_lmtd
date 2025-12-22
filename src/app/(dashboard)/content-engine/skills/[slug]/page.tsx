import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Zap,
  ArrowLeft,
  Play,
  Activity,
  TrendingUp,
  Clock,
  Target,
  ArrowRightLeft
} from "lucide-react";
import type { SkillInput, SkillOutput, SkillTrigger } from "@/modules/content-engine/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const skill = await db.agentSkill.findUnique({
    where: {
      organizationId_slug: {
        organizationId: session.user.organizationId,
        slug,
      },
    },
    include: {
      invocations: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!skill) {
    notFound();
  }

  const triggers = skill.triggers as SkillTrigger[];
  const inputs = skill.inputs as SkillInput[];
  const outputs = skill.outputs as SkillOutput[];

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#52EDC7]" />
              {skill.name}
            </h1>
            <p className="text-gray-500 mt-1">{skill.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={skill.status === "ACTIVE" ? "default" : "secondary"}>
            {skill.status}
          </Badge>
          <Link href={`/content-engine/sandbox?skill=${skill.slug}`}>
            <Button className="bg-[#52EDC7] hover:bg-[#1BA098] text-black">
              <Play className="h-4 w-4 mr-2" />
              Test Skill
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invocations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skill.invocationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {skill.successRate ? `${skill.successRate.toFixed(0)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {skill.category.replace(/_/g, " ")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(skill.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Triggers
            </CardTitle>
            <CardDescription>When this skill is invoked</CardDescription>
          </CardHeader>
          <CardContent>
            {triggers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No triggers defined</p>
            ) : (
              <div className="space-y-2">
                {triggers.map((trigger, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Badge variant="outline">{trigger.type}</Badge>
                    {trigger.eventType && (
                      <span className="text-sm text-muted-foreground">
                        {trigger.eventType}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inputs/Outputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Inputs & Outputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Inputs</p>
              {inputs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inputs defined</p>
              ) : (
                <div className="space-y-1">
                  {inputs.map((input, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{input.type}</Badge>
                      <span className="font-medium">{input.name}</span>
                      {input.required && (
                        <Badge variant="destructive" className="text-xs">required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Outputs</p>
              {outputs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No outputs defined</p>
              ) : (
                <div className="space-y-1">
                  {outputs.map((output, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{output.type}</Badge>
                      <span className="font-medium">{output.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Founder Knowledge */}
      {skill.founderKnowledge && (
        <Card>
          <CardHeader>
            <CardTitle>Founder Knowledge</CardTitle>
            <CardDescription>
              Expertise captured from 15+ years of agency experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{skill.founderKnowledge}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation Questions */}
      {skill.validationQuestions && skill.validationQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Questions</CardTitle>
            <CardDescription>
              Check-in questions to verify skill output quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {skill.validationQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[#52EDC7]">•</span>
                  {q}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Invocations */}
      {skill.invocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skill.invocations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
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
                      <Badge variant="outline">{inv.triggeredBy}</Badge>
                      <span className="text-sm text-muted-foreground ml-2">
                        {inv.durationMs ? `${inv.durationMs}ms` : "pending"}
                      </span>
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
      )}
    </div>
  );
}
