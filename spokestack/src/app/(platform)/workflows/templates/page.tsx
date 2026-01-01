import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  LayoutTemplate,
  FileText,
  Users,
  Megaphone,
  Target,
  Calendar,
  Building2,
  AlertTriangle,
} from "lucide-react";

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

// Pre-built workflow templates
const WORKFLOW_TEMPLATES = [
  {
    id: "brief-approval",
    name: "Brief Approval",
    description: "Standard workflow for getting briefs reviewed and approved",
    category: "Agency",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    steps: 4,
    avgDuration: "2-3 days",
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding",
    description: "Structured process for onboarding new clients",
    category: "Agency",
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    steps: 8,
    avgDuration: "1-2 weeks",
  },
  {
    id: "content-production",
    name: "Content Production",
    description: "End-to-end workflow for content creation and delivery",
    category: "Creative",
    icon: Megaphone,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    steps: 6,
    avgDuration: "3-5 days",
  },
  {
    id: "campaign-launch",
    name: "Campaign Launch",
    description: "Checklist-driven workflow for launching campaigns",
    category: "Marketing",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    steps: 10,
    avgDuration: "1-2 weeks",
  },
  {
    id: "monthly-reporting",
    name: "Monthly Reporting",
    description: "Recurring workflow for client monthly reports",
    category: "Agency",
    icon: Calendar,
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    steps: 5,
    avgDuration: "2-3 days",
  },
  {
    id: "team-review",
    name: "Team Review",
    description: "Performance review and feedback collection workflow",
    category: "HR",
    icon: Users,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    steps: 4,
    avgDuration: "1 week",
  },
];

const CATEGORIES = ["All", "Agency", "Creative", "Marketing", "HR"];

export default async function WorkflowTemplatesPage() {
  try {
    const user = await getStudioUser();

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
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
              Start with pre-built templates for common agency processes
            </p>
          </div>
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
          {WORKFLOW_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
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
                    <span>~{template.avgDuration}</span>
                  </div>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Template CTA */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <LayoutTemplate className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold">Need a custom workflow?</h3>
                <p className="text-sm text-muted-foreground">
                  Build your own from scratch with our visual workflow builder
                </p>
              </div>
            </div>
            <Button variant="outline">Create Custom Workflow</Button>
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
