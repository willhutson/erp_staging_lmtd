export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Handshake, CheckSquare, ArrowRight, DollarSign, FileText } from "lucide-react";
import { PipelineFunnel, DEMO_PIPELINE_STAGES } from "@/components/ui/pipeline-funnel";

async function getCRMStats() {
  try {
    // Try to get stats from CRM models if they exist
    const [companies, contacts, deals, tasks] = await Promise.all([
      prisma.client.count().catch(() => 0),
      prisma.clientContact.count().catch(() => 0),
      prisma.deal.count().catch(() => 0),
      prisma.cRMTask.count({ where: { status: { not: "COMPLETED" } } }).catch(() => 0),
    ]);

    // Get pipeline value
    const pipelineValue = await prisma.deal.aggregate({
      where: { stage: { in: ["LEAD", "PITCH", "NEGOTIATION"] } },
      _sum: { value: true },
    }).catch(() => ({ _sum: { value: null } }));

    // Get stage counts for funnel
    const stageCounts = await prisma.deal.groupBy({
      by: ['stage'],
      _count: true,
      _sum: { value: true },
    }).catch(() => []);

    return {
      companies,
      contacts,
      deals,
      openTasks: tasks,
      pipelineValue: Number(pipelineValue._sum.value || 0),
      stageCounts,
    };
  } catch {
    return { companies: 0, contacts: 0, deals: 0, openTasks: 0, pipelineValue: 0, stageCounts: [] };
  }
}

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

const CRM_MODULES = [
  {
    id: "companies",
    label: "Companies",
    description: "Manage client companies and accounts",
    icon: Building2,
    href: "/crm/companies",
    color: "bg-blue-500",
    statKey: "companies" as const,
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Client contacts and stakeholders",
    icon: Users,
    href: "/crm/contacts",
    color: "bg-green-500",
    statKey: "contacts" as const,
  },
  {
    id: "deals",
    label: "Deals",
    description: "Track opportunities and pipeline",
    icon: Handshake,
    href: "/crm/deals",
    color: "bg-purple-500",
    statKey: "deals" as const,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Follow-ups and action items",
    icon: CheckSquare,
    href: "/crm/tasks",
    color: "bg-orange-500",
    statKey: "openTasks" as const,
  },
];

export default async function CRMPage() {
  let stats = { companies: 0, contacts: 0, deals: 0, openTasks: 0, pipelineValue: 0, stageCounts: [] as any[] };

  try {
    stats = await getCRMStats();
  } catch {
    // Fallback to defaults
  }

  // Build funnel stages from real data or use demo
  const funnelStages = stats.stageCounts.length > 0
    ? [
        { id: "lead", name: "Leads", count: stats.stageCounts.find(s => s.stage === "LEAD")?._count || 0, value: Number(stats.stageCounts.find(s => s.stage === "LEAD")?._sum?.value || 0), color: "bg-slate-500" },
        { id: "pitch", name: "Pitch", count: stats.stageCounts.find(s => s.stage === "PITCH")?._count || 0, value: Number(stats.stageCounts.find(s => s.stage === "PITCH")?._sum?.value || 0), color: "bg-blue-500" },
        { id: "proposal", name: "Proposal", count: stats.stageCounts.find(s => s.stage === "PROPOSAL")?._count || 0, value: Number(stats.stageCounts.find(s => s.stage === "PROPOSAL")?._sum?.value || 0), color: "bg-cyan-500" },
        { id: "negotiation", name: "Negotiation", count: stats.stageCounts.find(s => s.stage === "NEGOTIATION")?._count || 0, value: Number(stats.stageCounts.find(s => s.stage === "NEGOTIATION")?._sum?.value || 0), color: "bg-amber-500" },
        { id: "won", name: "Won", count: stats.stageCounts.find(s => s.stage === "WON")?._count || 0, value: Number(stats.stageCounts.find(s => s.stage === "WON")?._sum?.value || 0), color: "bg-emerald-500" },
      ]
    : DEMO_PIPELINE_STAGES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            Manage client relationships, deals, and communications
          </p>
        </div>
        <Link
          href="/rfp"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <FileText className="h-4 w-4" />
          RFPs & Tenders
        </Link>
      </div>

      {/* Main Grid: Funnel + Stats */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: CRM Modules */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="interactive-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pipeline Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{formatCurrency(stats.pipelineValue)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active opportunities</p>
              </CardContent>
            </Card>
            <Card className="interactive-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">{stats.openTasks}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Action items pending</p>
              </CardContent>
            </Card>
          </div>

          {/* CRM Modules */}
          <div className="grid gap-4 md:grid-cols-2">
            {CRM_MODULES.map((module) => {
              const Icon = module.icon;
              const count = stats[module.statKey as keyof typeof stats] as number;
              return (
                <Link key={module.id} href={module.href}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group interactive-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {module.label}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Pipeline Funnel */}
        <div>
          <PipelineFunnel
            stages={funnelStages}
            title="Sales Pipeline"
            showConversion={true}
            showValue={true}
          />
        </div>
      </div>
    </div>
  );
}
