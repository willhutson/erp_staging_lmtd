import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sparkles, Settings, Wand2, FileText, Video, Presentation, Image } from "lucide-react";

const studioSkills = [
  {
    id: "social-copy-writer",
    name: "Social Copy Writer",
    description: "Platform-specific social media copy with hashtags and CTAs",
    category: "copy",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    enabled: true,
  },
  {
    id: "ad-copy-writer",
    name: "Ad Copy Writer",
    description: "Advertising copy optimized for paid campaigns",
    category: "copy",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    enabled: true,
  },
  {
    id: "arabic-localizer",
    name: "Arabic Localizer",
    description: "English to Arabic localization with cultural context",
    category: "copy",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    enabled: false,
  },
  {
    id: "script-writer",
    name: "Script Writer",
    description: "Video scripts with timing and dialogue formatting",
    category: "video",
    icon: Video,
    color: "from-purple-500 to-purple-600",
    enabled: true,
  },
  {
    id: "storyboard-describer",
    name: "Storyboard Describer",
    description: "Scene descriptions for storyboard frames",
    category: "video",
    icon: Video,
    color: "from-pink-500 to-pink-600",
    enabled: true,
  },
  {
    id: "deck-outliner",
    name: "Deck Outliner",
    description: "Presentation structure and slide outlines",
    category: "presentation",
    icon: Presentation,
    color: "from-orange-500 to-orange-600",
    enabled: true,
  },
  {
    id: "slide-content-writer",
    name: "Slide Content Writer",
    description: "Individual slide content with bullet points and headlines",
    category: "presentation",
    icon: Presentation,
    color: "from-red-500 to-red-600",
    enabled: true,
  },
  {
    id: "image-prompt-generator",
    name: "Image Prompt Generator",
    description: "AI image generation prompts from concepts",
    category: "visual",
    icon: Image,
    color: "from-cyan-500 to-cyan-600",
    enabled: false,
  },
  {
    id: "moodboard-curator",
    name: "Moodboard Curator",
    description: "Visual direction suggestions from references",
    category: "visual",
    icon: Wand2,
    color: "from-ltd-primary to-[#7B61FF]",
    enabled: true,
  },
];

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const categories = [
    { id: "copy", name: "Copywriting" },
    { id: "video", name: "Video Production" },
    { id: "presentation", name: "Presentations" },
    { id: "visual", name: "Visual Design" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">AI Skills</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Configure and customize AI assistants for creative workflows
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-[var(--ltd-radius-lg)] bg-ltd-surface-2 border border-ltd-border-1 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[var(--ltd-radius-md)] bg-ltd-primary/10">
            <Sparkles className="w-4 h-4 text-ltd-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-ltd-text-1 text-sm">Studio-Specific AI Skills</h3>
            <p className="text-sm text-ltd-text-2 mt-0.5">
              These skills are optimized for creative work. They use client context from briefs and moodboard references to generate on-brand content.
            </p>
          </div>
        </div>
      </div>

      {/* Skills by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categorySkills = studioSkills.filter((s) => s.category === category.id);

          return (
            <div key={category.id}>
              <h2 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider mb-4">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <div
                      key={skill.id}
                      className="p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-[var(--ltd-radius-md)] bg-gradient-to-br ${skill.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-ltd-text-1 text-sm">{skill.name}</h3>
                            <p className="text-xs text-ltd-text-2 mt-0.5 line-clamp-2">
                              {skill.description}
                            </p>
                          </div>
                        </div>
                        <button className="p-1.5 rounded-[var(--ltd-radius-sm)] hover:bg-ltd-surface-3 transition-colors">
                          <Settings className="w-4 h-4 text-ltd-text-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ltd-border-1">
                        <span className={`text-xs font-medium ${skill.enabled ? "text-green-500" : "text-ltd-text-3"}`}>
                          {skill.enabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            skill.enabled ? "bg-ltd-primary" : "bg-ltd-surface-4"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              skill.enabled ? "translate-x-4" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
