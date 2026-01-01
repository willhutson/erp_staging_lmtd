import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Settings, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const defaultSkills = [
  {
    id: "copywriter",
    name: "Copywriter",
    description: "Generate marketing copy, taglines, and brand messaging",
    status: "active",
  },
  {
    id: "social-caption",
    name: "Social Caption Writer",
    description: "Create engaging captions for social media posts",
    status: "active",
  },
  {
    id: "script-writer",
    name: "Script Writer",
    description: "Write video scripts and dialogue",
    status: "active",
  },
  {
    id: "brief-analyzer",
    name: "Brief Analyzer",
    description: "Analyze briefs and suggest creative directions",
    status: "inactive",
  },
];

export default function StudioSkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Skills</h1>
            <p className="text-sm text-muted-foreground">Configure AI assistants for your workflows</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Skill
        </Button>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultSkills.map((skill) => (
          <Card key={skill.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{skill.name}</CardTitle>
                    <Badge
                      variant={skill.status === "active" ? "default" : "secondary"}
                      className="mt-1 text-[10px]"
                    >
                      {skill.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{skill.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">About AI Skills</h3>
              <p className="text-sm text-muted-foreground">
                AI Skills are specialized assistants that help with creative tasks.
                Each skill is trained for specific use cases like copywriting, script development, or brief analysis.
                Configure skills to match your brand voice and creative standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
