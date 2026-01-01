"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Radio,
  Eye,
  AlertTriangle,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", color: "bg-pink-500", label: "IG" },
  { id: "tiktok", name: "TikTok", color: "bg-black", label: "TT" },
  { id: "youtube", name: "YouTube", color: "bg-red-600", label: "YT" },
  { id: "twitter", name: "X (Twitter)", color: "bg-black", label: "X" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-600", label: "LI" },
  { id: "facebook", name: "Facebook", color: "bg-blue-500", label: "FB" },
];

// Mock clients
const CLIENTS = [
  { id: "ccad", name: "Culture & Creative Arts Dubai" },
  { id: "det", name: "Dubai Tourism" },
  { id: "adek", name: "Abu Dhabi Education" },
  { id: "ecd", name: "Economy Dubai" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function NewTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [currentExclude, setCurrentExclude] = useState("");
  const [currentHashtag, setCurrentHashtag] = useState("");
  const [currentMention, setCurrentMention] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    description: "",
    platforms: ["instagram", "tiktok"] as string[],
    query: {
      include: [] as string[],
      exclude: [] as string[],
      hashtags: [] as string[],
      mentions: [] as string[],
    },
    settings: {
      sentiment: true,
      alertOnSpike: false,
      alertThreshold: 150,
    },
  });

  const addKeyword = (type: "include" | "exclude" | "hashtags" | "mentions", value: string) => {
    if (!value.trim()) return;

    let cleanValue = value.trim();
    if (type === "hashtags" && !cleanValue.startsWith("#")) {
      cleanValue = "#" + cleanValue;
    }
    if (type === "mentions" && !cleanValue.startsWith("@")) {
      cleanValue = "@" + cleanValue;
    }

    if (!formData.query[type].includes(cleanValue)) {
      setFormData((prev) => ({
        ...prev,
        query: {
          ...prev.query,
          [type]: [...prev.query[type], cleanValue],
        },
      }));
    }

    // Clear the input
    if (type === "include") setCurrentKeyword("");
    if (type === "exclude") setCurrentExclude("");
    if (type === "hashtags") setCurrentHashtag("");
    if (type === "mentions") setCurrentMention("");
  };

  const removeKeyword = (type: "include" | "exclude" | "hashtags" | "mentions", value: string) => {
    setFormData((prev) => ({
      ...prev,
      query: {
        ...prev.query,
        [type]: prev.query[type].filter((k) => k !== value),
      },
    }));
  };

  const togglePlatform = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const generateQueryPreview = () => {
    const parts: string[] = [];

    if (formData.query.include.length > 0) {
      parts.push(`(${formData.query.include.map(k => `"${k}"`).join(" OR ")})`);
    }
    if (formData.query.hashtags.length > 0) {
      parts.push(`(${formData.query.hashtags.join(" OR ")})`);
    }
    if (formData.query.mentions.length > 0) {
      parts.push(`(${formData.query.mentions.join(" OR ")})`);
    }
    if (formData.query.exclude.length > 0) {
      parts.push(`NOT (${formData.query.exclude.map(k => `"${k}"`).join(" OR ")})`);
    }

    return parts.join(" AND ") || "Add keywords to build your query";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.query.include.length === 0 && formData.query.hashtags.length === 0) {
      toast.error("Please add at least one keyword or hashtag to track");
      return;
    }

    if (formData.platforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Tracker created successfully");
    router.push("/listening/trackers");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/listening/trackers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Brand Tracker</h1>
          <p className="text-muted-foreground">
            Set up monitoring for brand mentions across social platforms
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Name your tracker and associate it with a client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tracker Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., CCAD Brand Mentions"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client (Optional)</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENTS.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this tracker monitoring?"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Platforms</CardTitle>
            <CardDescription>
              Select which social platforms to monitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => {
                const isSelected = formData.platforms.includes(platform.id);
                return (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <Checkbox checked={isSelected} />
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${platform.color}`}>
                      {platform.label}
                    </span>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Boolean Query Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Search Query</CardTitle>
            <CardDescription>
              Build your boolean query to track brand mentions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Include Keywords */}
            <div className="space-y-3">
              <Label className="text-green-600 font-medium">Include (OR)</Label>
              <p className="text-sm text-muted-foreground">
                Keywords and phrases to search for. Posts matching ANY of these will be tracked.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder='e.g., "brand name" or keyword'
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword("include", currentKeyword);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword("include", currentKeyword)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.query.include.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1 bg-green-100 text-green-800">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword("include", keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-3">
              <Label className="text-blue-600 font-medium">Hashtags (OR)</Label>
              <p className="text-sm text-muted-foreground">
                Track specific hashtags across platforms.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., #DubaiCulture"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword("hashtags", currentHashtag);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword("hashtags", currentHashtag)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.query.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword("hashtags", tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mentions */}
            <div className="space-y-3">
              <Label className="text-purple-600 font-medium">Mentions (OR)</Label>
              <p className="text-sm text-muted-foreground">
                Track @mentions of specific accounts.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., @brandaccount"
                  value={currentMention}
                  onChange={(e) => setCurrentMention(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword("mentions", currentMention);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword("mentions", currentMention)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.query.mentions.map((mention) => (
                  <Badge key={mention} variant="secondary" className="gap-1 bg-purple-100 text-purple-800">
                    {mention}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword("mentions", mention)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Exclude Keywords */}
            <div className="space-y-3">
              <Label className="text-red-600 font-medium">Exclude (NOT)</Label>
              <p className="text-sm text-muted-foreground">
                Filter out posts containing these keywords.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., jobs, hiring, spam"
                  value={currentExclude}
                  onChange={(e) => setCurrentExclude(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword("exclude", currentExclude);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword("exclude", currentExclude)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.query.exclude.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1 bg-red-100 text-red-800">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword("exclude", keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Query Preview */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Query Preview</span>
              </div>
              <code className="text-sm text-muted-foreground break-all">
                {generateQueryPreview()}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tracker Settings</CardTitle>
            <CardDescription>
              Configure analysis and alerting options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sentiment Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Analyze positive, negative, and neutral sentiment of mentions
                </p>
              </div>
              <Switch
                checked={formData.settings.sentiment}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, sentiment: checked },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  Spike Alerts
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when mention volume exceeds threshold
                </p>
              </div>
              <Switch
                checked={formData.settings.alertOnSpike}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, alertOnSpike: checked },
                  }))
                }
              />
            </div>

            {formData.settings.alertOnSpike && (
              <div className="ml-4 pl-4 border-l-2 space-y-2">
                <Label htmlFor="threshold">Alert Threshold (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="threshold"
                    type="number"
                    min={100}
                    max={500}
                    className="w-24"
                    value={formData.settings.alertThreshold}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, alertThreshold: parseInt(e.target.value) || 150 },
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    % of 7-day average
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/listening/trackers">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Radio className="mr-2 h-4 w-4" />
            )}
            Create Tracker
          </Button>
        </div>
      </form>
    </div>
  );
}
