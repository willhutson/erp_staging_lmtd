import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Presentation,
  Video,
  ImageIcon,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
} from "lucide-react";

const studioModules = [
  {
    title: "Documents",
    description: "Create and sync documents with Google Docs. Collaborate in real-time with version history.",
    href: "/studio/docs",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
  },
  {
    title: "Pitch Decks",
    description: "Build beautiful presentations with AI-powered content generation and Google Slides export.",
    href: "/studio/decks",
    icon: Presentation,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500",
  },
  {
    title: "Video Studio",
    description: "Script writing, storyboarding, and shot list management for video productions.",
    href: "/studio/video",
    icon: Video,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500",
  },
  {
    title: "Moodboard Lab",
    description: "Upload references, images, and links. AI indexes everything for grounded creative generation.",
    href: "/studio/moodboard",
    icon: ImageIcon,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500",
    featured: true,
  },
  {
    title: "Social Calendar",
    description: "Plan and schedule social content across platforms with drag-and-drop scheduling.",
    href: "/studio/calendar",
    icon: Calendar,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500",
  },
  {
    title: "AI Skills",
    description: "Configure and customize AI assistants for your creative workflows.",
    href: "/studio/skills",
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500",
  },
];

export default function StudioDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SpokeStudio</h1>
            <p className="text-sm text-muted-foreground">AI-powered creative workspace</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/studio/docs">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/studio/moodboard">
              <Plus className="w-4 h-4 mr-2" />
              New Moodboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/studio/video">
              <Plus className="w-4 h-4 mr-2" />
              New Video Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Studio Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studioModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.href}
                className={`group relative overflow-hidden hover:shadow-lg transition-all ${
                  module.featured ? "ring-2 ring-violet-500/20" : ""
                }`}
              >
                {module.featured && (
                  <Badge className="absolute -top-0 -right-0 rounded-none rounded-bl-lg bg-gradient-to-r from-violet-500 to-purple-600">
                    Featured
                  </Badge>
                )}
                <div className={`h-1.5 bg-gradient-to-r ${module.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {module.description}
                  </CardDescription>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href={module.href}>
                      Open module
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Activity
        </h2>
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Clock className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">No recent activity</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your recent documents, moodboards, and projects will appear here once you start creating.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
