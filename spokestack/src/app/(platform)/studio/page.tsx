import Link from "next/link";
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
  Zap,
  Upload,
  Wand2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const studioModules = [
  {
    title: "Documents",
    description: "AI-powered documents with real-time collaboration",
    href: "/studio/docs",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    stats: { count: 24, label: "docs" },
  },
  {
    title: "Pitch Decks",
    description: "Beautiful presentations with AI content generation",
    href: "/studio/decks",
    icon: Presentation,
    color: "from-orange-500 to-red-500",
    stats: { count: 8, label: "decks" },
  },
  {
    title: "Video Studio",
    description: "Scripts, storyboards, and shot lists",
    href: "/studio/video",
    icon: Video,
    color: "from-purple-500 to-pink-500",
    stats: { count: 12, label: "projects" },
  },
  {
    title: "Moodboard Lab",
    description: "Visual inspiration with AI-indexed references",
    href: "/studio/moodboard",
    icon: ImageIcon,
    color: "from-primary to-violet-500",
    stats: { count: 15, label: "boards" },
    featured: true,
  },
  {
    title: "Content Calendar",
    description: "AI-powered social content planning",
    href: "/studio/calendar",
    icon: Calendar,
    color: "from-green-500 to-emerald-600",
    stats: { count: 4, label: "clients" },
    aiPowered: true,
  },
  {
    title: "AI Skills",
    description: "Custom AI assistants for your workflows",
    href: "/studio/skills",
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
    stats: { count: 6, label: "active" },
  },
];

const recentItems = [
  { title: "ADEK Q1 Content Strategy", type: "Document", client: "ADEK", updated: "2 hours ago" },
  { title: "Ramadan Campaign Deck", type: "Pitch Deck", client: "DET", updated: "5 hours ago" },
  { title: "Product Launch Moodboard", type: "Moodboard", client: "CCAD", updated: "Yesterday" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function StudioDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section - AI Content Engine */}
      <div className="relative overflow-hidden rounded-2xl gradient-brand-subtle p-8 border border-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Content Engine</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            What would you like to create?
          </h1>
          <p className="text-muted-foreground max-w-xl mb-6">
            Studio is your AI-powered content engine. Describe what you need and let AI help structure it,
            or dive into a specific module to start creating.
          </p>

          {/* AI Input Prompt */}
          <div className="flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Describe what you want to create... (e.g., 'Social content calendar for ADEK')"
                className="w-full px-4 py-3 pr-12 rounded-xl border bg-background/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Quick Create Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 interactive-lift" asChild>
          <Link href="/studio/docs/new">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>New Document</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 interactive-lift" asChild>
          <Link href="/studio/moodboard/new">
            <ImageIcon className="h-5 w-5 text-violet-500" />
            <span>New Moodboard</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 interactive-lift" asChild>
          <Link href="/studio/calendar">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <span>AI Calendar</span>
            <Badge variant="secondary" className="text-[10px]">AI</Badge>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 interactive-lift" asChild>
          <Link href="/studio/video/new">
            <Video className="h-5 w-5 text-purple-500" />
            <span>Video Project</span>
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Module Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Studio Modules</h2>
            <span className="text-sm text-muted-foreground">6 modules</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 stagger-children">
            {studioModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group"
                >
                  <Card className={`h-full interactive-lift overflow-hidden ${
                    module.featured ? "ring-2 ring-primary/20" : ""
                  }`}>
                    <div className={`h-1.5 bg-gradient-to-r ${module.color}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {module.title}
                            </h3>
                            {module.aiPowered && (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                AI
                              </Badge>
                            )}
                            {module.featured && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {module.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium">
                              {module.stats.count} {module.stats.label}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="p-2 rounded-lg bg-muted">
                    {item.type === "Document" && <FileText className="h-4 w-4" />}
                    {item.type === "Pitch Deck" && <Presentation className="h-4 w-4" />}
                    {item.type === "Moodboard" && <ImageIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.client}</span>
                      <span>•</span>
                      <span>{item.updated}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full">
                View all activity
              </Button>
            </CardContent>
          </Card>

          {/* Upload Zone */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Quick Upload</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Drop files here to add to a moodboard or document
                </p>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Content Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Your team created 23% more content this week. Top performing: Video content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
