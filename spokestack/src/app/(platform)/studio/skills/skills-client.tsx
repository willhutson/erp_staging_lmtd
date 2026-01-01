"use client";

import { useState } from "react";
import {
  Sparkles,
  Settings,
  FileText,
  Video,
  Presentation,
  Image,
  Wand2,
  X,
  Play,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioSkill } from "@/modules/studio/actions/skill-actions";
import { executeSkill } from "@/modules/studio/actions/skill-actions";

interface SkillsClientProps {
  skills: StudioSkill[];
}

const categoryConfig = {
  copy: { name: "Copywriting", icon: FileText },
  video: { name: "Video Production", icon: Video },
  presentation: { name: "Presentations", icon: Presentation },
  visual: { name: "Visual Design", icon: Image },
};

const colorConfig: Record<string, string> = {
  "social-copy-writer": "from-blue-500 to-blue-600",
  "ad-copy-writer": "from-indigo-500 to-indigo-600",
  "arabic-localizer": "from-emerald-500 to-emerald-600",
  "script-writer": "from-purple-500 to-purple-600",
  "storyboard-describer": "from-pink-500 to-pink-600",
  "deck-outliner": "from-orange-500 to-orange-600",
  "slide-content-writer": "from-red-500 to-red-600",
  "image-prompt-generator": "from-cyan-500 to-cyan-600",
  "moodboard-curator": "from-ltd-primary to-[#7B61FF]",
};

export function SkillsClient({ skills: initialSkills }: SkillsClientProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [selectedSkill, setSelectedSkill] = useState<StudioSkill | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Execution form state
  const [prompt, setPrompt] = useState("");
  const [parameters, setParameters] = useState<Record<string, string>>({});

  const categories = ["copy", "video", "presentation", "visual"] as const;

  const handleToggleSkill = async (skillId: string) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleOpenSkill = (skill: StudioSkill) => {
    setSelectedSkill(skill);
    setPrompt("");
    setParameters({});
    setResult(null);
  };

  const handleCloseSkill = () => {
    setSelectedSkill(null);
    setPrompt("");
    setParameters({});
    setResult(null);
  };

  const handleExecute = async () => {
    if (!selectedSkill || !prompt.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      const response = await executeSkill({
        skillId: selectedSkill.id,
        prompt,
        parameters,
      });
      setResult(response.result);
    } catch (error) {
      console.error("Skill execution failed:", error);
      setResult("Error: Failed to execute skill. Please try again.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          const categorySkills = skills.filter((s) => s.category === category);
          const config = categoryConfig[category];
          const CategoryIcon = config.icon;

          return (
            <div key={category}>
              <h2 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CategoryIcon className="w-4 h-4" />
                {config.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => {
                  const color = colorConfig[skill.id] || "from-gray-500 to-gray-600";

                  return (
                    <div
                      key={skill.id}
                      className="p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-[var(--ltd-radius-md)] bg-gradient-to-br ${color}`}>
                            <Wand2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-ltd-text-1 text-sm">{skill.name}</h3>
                            <p className="text-xs text-ltd-text-2 mt-0.5 line-clamp-2">
                              {skill.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenSkill(skill)}
                          disabled={!skill.enabled}
                          className="p-1.5 rounded-[var(--ltd-radius-sm)] hover:bg-ltd-surface-3 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 text-ltd-primary" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ltd-border-1">
                        <span className={`text-xs font-medium ${skill.enabled ? "text-green-500" : "text-ltd-text-3"}`}>
                          {skill.enabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          onClick={() => handleToggleSkill(skill.id)}
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

      {/* Skill Execution Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseSkill} />
          <div className="relative w-full max-w-2xl bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-[var(--ltd-radius-md)] bg-gradient-to-br ${colorConfig[selectedSkill.id] || "from-gray-500 to-gray-600"}`}>
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ltd-text-1">{selectedSkill.name}</h2>
                  <p className="text-xs text-ltd-text-2">{selectedSkill.description}</p>
                </div>
              </div>
              <button
                onClick={handleCloseSkill}
                className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
              >
                <X className="w-4 h-4 text-ltd-text-2" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Parameters */}
              {selectedSkill.parameters && selectedSkill.parameters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-ltd-text-1">Parameters</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSkill.parameters.map((param) => (
                      <div key={param.name}>
                        <label className="block text-xs font-medium text-ltd-text-2 mb-1">
                          {param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, " $1")}
                          {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.type === "select" ? (
                          <select
                            value={parameters[param.name] || ""}
                            onChange={(e) => setParameters({ ...parameters, [param.name]: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                          >
                            <option value="">Select...</option>
                            {param.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type === "number" ? "number" : "text"}
                            value={parameters[param.name] || ""}
                            onChange={(e) => setParameters({ ...parameters, [param.name]: e.target.value })}
                            placeholder={param.placeholder}
                            className="w-full px-3 py-2 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  What do you need?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  rows={4}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={isExecuting || !prompt.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>

              {/* Result */}
              {result && (
                <div className="mt-4 p-4 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 border border-ltd-border-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-ltd-text-1">Result</h3>
                    <button
                      onClick={handleCopyResult}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-ltd-text-2 hover:text-ltd-primary transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-ltd-text-2 whitespace-pre-wrap font-mono">
                    {result}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
