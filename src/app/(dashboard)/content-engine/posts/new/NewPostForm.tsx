"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  Image,
  Video,
  FileText,
  Type,
  Loader2,
  Calendar,
  Hash,
  AtSign,
  Link as LinkIcon,
  MapPin,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createContentPost } from "@/modules/content/actions/content-actions";
import type { SocialPlatform, ContentType } from "@prisma/client";

interface Client {
  id: string;
  name: string;
  code: string;
  socialAccounts: Array<{
    id: string;
    platform: SocialPlatform;
    accountName: string;
    avatarUrl: string | null;
  }>;
}

interface Brief {
  id: string;
  title: string;
  briefNumber: string;
  client: { id: string; name: string };
}

interface NewPostFormProps {
  clients: Client[];
  briefs: Brief[];
  organizationId: string;
  userId: string;
}

const platforms: Array<{
  value: SocialPlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { value: "INSTAGRAM_FEED", label: "Instagram Feed", icon: <Instagram className="w-5 h-5" />, color: "#E4405F" },
  { value: "INSTAGRAM_STORY", label: "Instagram Story", icon: <Instagram className="w-5 h-5" />, color: "#E4405F" },
  { value: "INSTAGRAM_REEL", label: "Instagram Reel", icon: <Instagram className="w-5 h-5" />, color: "#E4405F" },
  { value: "FACEBOOK_PAGE", label: "Facebook", icon: <Facebook className="w-5 h-5" />, color: "#1877F2" },
  { value: "TIKTOK", label: "TikTok", icon: <Music2 className="w-5 h-5" />, color: "#000000" },
  { value: "LINKEDIN_PAGE", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, color: "#0A66C2" },
  { value: "X_TWEET", label: "X (Tweet)", icon: <Twitter className="w-5 h-5" />, color: "#000000" },
  { value: "YOUTUBE_VIDEO", label: "YouTube", icon: <Youtube className="w-5 h-5" />, color: "#FF0000" },
  { value: "YOUTUBE_SHORT", label: "YouTube Short", icon: <Youtube className="w-5 h-5" />, color: "#FF0000" },
  { value: "THREADS", label: "Threads", icon: <Globe className="w-5 h-5" />, color: "#000000" },
  { value: "WORDPRESS", label: "WordPress", icon: <Globe className="w-5 h-5" />, color: "#21759B" },
];

const contentTypes: Array<{
  value: ContentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  { value: "SINGLE_IMAGE", label: "Single Image", icon: <Image className="w-5 h-5" />, description: "One static image" },
  { value: "CAROUSEL", label: "Carousel", icon: <Image className="w-5 h-5" />, description: "Multiple images" },
  { value: "VIDEO", label: "Video", icon: <Video className="w-5 h-5" />, description: "Standard video" },
  { value: "SHORT_VIDEO", label: "Short Video", icon: <Video className="w-5 h-5" />, description: "Reel, Short, TikTok" },
  { value: "STORY", label: "Story", icon: <Image className="w-5 h-5" />, description: "24hr ephemeral" },
  { value: "TEXT_ONLY", label: "Text Only", icon: <Type className="w-5 h-5" />, description: "No media" },
  { value: "ARTICLE", label: "Article", icon: <FileText className="w-5 h-5" />, description: "Long-form content" },
];

export function NewPostForm({ clients, briefs, organizationId, userId }: NewPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("SINGLE_IMAGE");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mentions, setMentions] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [locationName, setLocationName] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<string>("");

  const selectedClientData = clients.find((c) => c.id === selectedClient);
  const clientBriefs = briefs.filter((b) => b.client.id === selectedClient);

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || selectedPlatforms.length === 0 || !title || !caption) {
      return;
    }

    startTransition(async () => {
      try {
        const post = await createContentPost({
          organizationId,
          clientId: selectedClient,
          title,
          platforms: selectedPlatforms,
          contentType: selectedContentType,
          caption,
          captionAr: captionAr || undefined,
          hashtags: hashtags.split(/[,\s]+/).filter(Boolean).map((h) => h.startsWith("#") ? h : `#${h}`),
          mentions: mentions.split(/[,\s]+/).filter(Boolean).map((m) => m.startsWith("@") ? m : `@${m}`),
          linkUrl: linkUrl || undefined,
          linkText: linkText || undefined,
          locationName: locationName || undefined,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          briefId: selectedBrief || undefined,
          createdById: userId,
        });

        router.push(`/content-engine/posts/${post.id}`);
      } catch (error) {
        console.error("Failed to create post:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client & Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Related Brief (optional)</Label>
                  <Select
                    value={selectedBrief}
                    onValueChange={setSelectedBrief}
                    disabled={!selectedClient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Link to brief" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No brief</SelectItem>
                      {clientBriefs.map((brief) => (
                        <SelectItem key={brief.id} value={brief.id}>
                          {brief.briefNumber} - {brief.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Platforms *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.value);
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => togglePlatform(platform.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-[#52EDC7] bg-[#52EDC7]/10"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: isSelected ? platform.color : "#F3F4F6", color: isSelected ? "#fff" : "#6B7280" }}
                      >
                        {platform.icon}
                      </div>
                      <span className="text-xs text-center font-medium">
                        {platform.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#52EDC7] absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Type *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedContentType(type.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                      selectedContentType === type.value
                        ? "border-[#52EDC7] bg-[#52EDC7]/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-xs text-gray-500">{type.description}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Internal Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q1 Product Launch Announcement"
                />
              </div>

              <div>
                <Label>Caption (English) *</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your post caption..."
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {caption.length} characters
                </p>
              </div>

              <div>
                <Label>Caption (Arabic)</Label>
                <Textarea
                  value={captionAr}
                  onChange={(e) => setCaptionAr(e.target.value)}
                  placeholder="اكتب وصف المنشور بالعربية..."
                  rows={5}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Hashtags
                  </Label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#marketing #social"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <AtSign className="w-4 h-4" /> Mentions
                  </Label>
                  <Input
                    value={mentions}
                    onChange={(e) => setMentions(e.target.value)}
                    placeholder="@brand @partner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Link URL
                  </Label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Link Text (CTA)</Label>
                  <Input
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </Label>
                <Input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Dubai, UAE"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Scheduled Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to save as draft
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Accounts */}
          {selectedClientData && selectedClientData.socialAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedClientData.socialAccounts.map((account) => {
                    const platformData = platforms.find(
                      (p) => p.value === account.platform
                    );
                    return (
                      <div
                        key={account.id}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        {platformData?.icon}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {account.accountName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {platformData?.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button
                type="submit"
                className="w-full bg-[#52EDC7] hover:bg-[#3dd9b3] text-gray-900"
                disabled={
                  isPending ||
                  !selectedClient ||
                  selectedPlatforms.length === 0 ||
                  !title ||
                  !caption
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
