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
import { CreateBoardButton } from "./create-board-button";
import { getBoardTemplates } from "@/modules/boards/actions";

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
  FileText,
  Building2,
  Megaphone,
  Target,
  Calendar,
  Users,
  LayoutTemplate,
};

// Pre-built board templates (fallback if no DB templates)
const DEFAULT_TEMPLATES = [
  {
    id: "content-production",
    name: "Content Production",
    description: "End-to-end workflow for content creation and delivery",
    category: "Creative",
    icon: "Megaphone",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    steps: 6,
    avgDuration: "3-5 days",
  },
  {
    id: "project-management",
    name: "Project Management",
    description: "Standard project board with To Do, In Progress, Review, Done",
    category: "Agency",
    icon: "FileText",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    steps: 4,
    avgDuration: "Varies",
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding",
    description: "Structured process for onboarding new clients",
    category: "Agency",
    icon: "Building2",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    steps: 8,
    avgDuration: "1-2 weeks",
  },
  {
    id: "campaign-launch",
    name: "Campaign Launch",
    description: "Checklist-driven board for launching campaigns",
    category: "Marketing",
    icon: "Target",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    steps: 10,
    avgDuration: "1-2 weeks",
  },
  {
    id: "monthly-reporting",
    name: "Monthly Reporting",
    description: "Recurring board for client monthly reports",
    category: "Agency",
    icon: "Calendar",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    steps: 5,
    avgDuration: "2-3 days",
  },
  {
    id: "team-review",
    name: "Team Review",
    description: "Performance review and feedback collection board",
    category: "HR",
    icon: "Users",
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    steps: 4,
    avgDuration: "1 week",
  },
];

const CATEGORIES = ["All", "Agency", "Creative", "Marketing", "HR"];

export default async function BoardTemplatesPage() {
  try {
    const user = await getStudioUser();

    // Try to get templates from DB, fall back to defaults
    let templates = await getBoardTemplates();

    // If no DB templates, use defaults
    const displayTemplates = templates.length > 0
      ? templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || "",
          category: t.category,
          icon: t.icon || "LayoutTemplate",
          color: t.color || "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-900/20",
          steps: Array.isArray(t.columns) ? (t.columns as unknown[]).length : 4,
          avgDuration: "Varies",
          isDbTemplate: true,
        }))
      : DEFAULT_TEMPLATES.map(t => ({ ...t, isDbTemplate: false }));

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/boards"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Board Templates</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Start with pre-built templates for common agency processes
              </p>
            </div>
          </div>
          <CreateBoardButton templateName="Custom Board" className="opacity-100" />
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
            const Icon = ICON_MAP[template.icon] || LayoutTemplate;
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
                    <span>{template.steps} columns</span>
                    <span>~{template.avgDuration}</span>
                  </div>
                  <CreateBoardButton
                    templateId={template.isDbTemplate ? template.id : undefined}
                    templateName={template.name}
                    className="w-full group-hover:bg-primary/90 transition-colors"
                  />
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
                <h3 className="font-semibold">Start from scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Create a blank board and customize it your way
                </p>
              </div>
            </div>
            <CreateBoardButton templateName="New Board" />
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
