"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Sparkles,
  Instagram,
  Youtube,
  Twitter,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Platform options
const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "tiktok", name: "TikTok", icon: Sparkles },
  { id: "twitter", name: "X (Twitter)", icon: Twitter },
];

// Categories
const categories = [
  "Fashion & Beauty",
  "Lifestyle",
  "Travel",
  "Food & Dining",
  "Fitness & Health",
  "Tech & Gaming",
  "Entertainment",
  "Business & Finance",
  "Family & Parenting",
  "Art & Design",
];

export default function NewCreatorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    location: "",
    bio: "",
    notes: "",
  });
  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({});

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to creators list
    router.push("/listening/creators");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/listening/creators">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Creator</h1>
          <p className="text-muted-foreground">
            Add a creator to your roster and connect their social platforms
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the creator&apos;s contact details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +971 50 XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Dubai, UAE"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Brief description of the creator..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Social Platforms</CardTitle>
            <CardDescription>
              Select the platforms this creator is active on and enter their handles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {platform.name}
                    {isSelected && <X className="h-3 w-3 ml-1" />}
                  </Button>
                );
              })}
            </div>

            {selectedPlatforms.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    if (!platform) return null;
                    const Icon = platform.icon;
                    return (
                      <div key={platformId} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-32">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                        <Input
                          placeholder={`@username`}
                          value={platformHandles[platformId] || ""}
                          onChange={(e) =>
                            setPlatformHandles({
                              ...platformHandles,
                              [platformId]: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {selectedPlatforms.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select at least one platform to continue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>
              Add any internal notes about this creator (not visible to them)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add notes about rates, past collaborations, etc..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/listening/creators">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={!formData.name || !formData.email || !formData.category || selectedPlatforms.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Creator...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Creator
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
