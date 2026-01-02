import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  LayoutTemplate,
  FileCheck,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Megaphone,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import { getWorkflowTemplates } from "@/modules/workflow-builder/actions";

export const dynamic = "force-dynamic";

function PageError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Unable to Load</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
      </div>
    </div>
  );
}

// Icon mapping for templates
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCheck,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Megaphone,
  LayoutTemplate,
  GitBranch,
};

// Pre-built workflow templates
const DEFAULT_TEMPLATES = [
  {
    id: "brief-approval",
    name: "Brief Approval",
    description: "Multi-step approval workflow for creative briefs with manager and client sign-off",
    category: "Approval",
    icon: "FileCheck",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    steps: 4,
    triggers: "Manual, Brief Created",
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding",
    description: "Automated onboarding workflow with tasks for contracts, setup, and kickoff",
    category: "Onboarding",
    icon: "Users",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    steps: 8,
    triggers: "Deal Won",
  },
  {
    id: "invoice-approval",
    name: "Invoice Approval",
    description: "Finance approval workflow with budget checks and multi-level sign-off",
    category: "Finance",
    icon: "DollarSign",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    steps: 5,
    triggers: "Invoice Created",
  },
  {
    id: "content-review",
    name: "Content Review",
    description: "Editorial workflow with copyediting, legal review, and final approval",
    category: "Creative",
    icon: "Megaphone",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    steps: 6,
    triggers: "Content Ready",
  },
  {
    id: "employee-onboarding",
    name: "Employee Onboarding",
    description: "HR workflow for new hire setup, training, and equipment provisioning",
    category: "HR",
    icon: "Briefcase",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    steps: 10,
    triggers: "Offer Accepted",
  },
  {
    id: "time-off-request",
    name: "Time Off Request",
    description: "Leave request workflow with manager approval and calendar blocking",
    category: "HR",
    icon: "Clock",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    steps: 3,
    triggers: "Form Submitted",
  },
];

const CATEGORIES = ["All", "Approval", "Onboarding", "Creative", "Finance", "HR"];

export default async function WorkflowTemplatesPage() {
  try {
    const user = await getStudioUser();

    // Try to get templates from DB
    let templates = await getWorkflowTemplates();

    // If no DB templates, use defaults
    const displayTemplates = templates.length > 0
      ? templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || "",
          category: t.category || "Other",
          icon: t.icon || "GitBranch",
          color: t.color || "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-900/20",
          steps: t._count?.steps || 0,
          triggers: "Manual",
          isDbTemplate: true,
        }))
      : DEFAULT_TEMPLATES.map(t => ({ ...t, isDbTemplate: false }));

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/workflows"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Workflow Templates</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Start with pre-built automation workflows
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/workflows">
              <GitBranch className="mr-2 h-4 w-4" />
              Build Custom
            </Link>
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayTemplates.map((template) => {
            const Icon = ICON_MAP[template.icon] || GitBranch;
            return (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${template.bgColor}`}>
                      <Icon className={`h-6 w-6 ${template.color}`} />
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{template.steps} steps</span>
                    <span>Trigger: {template.triggers}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Workflow CTA */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <GitBranch className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold">Build from scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom workflow tailored to your process
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/workflows">Create Custom Workflow</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Templates page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PageError message={message} />;
  }
}
