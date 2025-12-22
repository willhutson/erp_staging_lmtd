"use client";

/**
 * Notification Settings Component
 *
 * User interface for managing chat notification preferences.
 *
 * @module chat/components/NotificationSettings
 */

import { useState, useTransition } from "react";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Moon,
  Hash,
  AtSign,
  MessageSquare,
  Reply,
  Heart,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  updateNotificationPreferences,
  resetNotificationPreferences,
  addKeyword,
  removeKeyword,
  type NotificationPreferences,
} from "../actions/notification-preferences";

// ============================================
// TYPES
// ============================================

interface NotificationSettingsProps {
  userId: string;
  initialPreferences: NotificationPreferences;
  channels?: Array<{ id: string; name: string }>;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NotificationSettings({
  userId,
  initialPreferences,
  channels = [],
}: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();
  const [newKeyword, setNewKeyword] = useState("");

  // Update preference
  const updatePref = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    startTransition(async () => {
      await updateNotificationPreferences(userId, { [key]: value });
    });
  };

  // Reset to defaults
  const handleReset = () => {
    startTransition(async () => {
      const defaults = await resetNotificationPreferences(userId);
      setPrefs(defaults);
    });
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const keyword = newKeyword.trim().toLowerCase();
    if (!prefs.keywords.includes(keyword)) {
      setPrefs((p) => ({ ...p, keywords: [...p.keywords, keyword] }));
      startTransition(async () => {
        await addKeyword(userId, keyword);
      });
    }
    setNewKeyword("");
  };

  // Remove keyword
  const handleRemoveKeyword = (keyword: string) => {
    setPrefs((p) => ({
      ...p,
      keywords: p.keywords.filter((k) => k !== keyword),
    }));
    startTransition(async () => {
      await removeKeyword(userId, keyword);
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how and when you receive chat notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for chat activity
              </p>
            </div>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={(v) => updatePref("enabled", v)}
              disabled={isPending}
            />
          </div>

          <Separator />

          {/* Sound & Desktop */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prefs.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label>Sound</Label>
              </div>
              <Switch
                checked={prefs.soundEnabled}
                onCheckedChange={(v) => updatePref("soundEnabled", v)}
                disabled={isPending || !prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label>Desktop notifications</Label>
              </div>
              <Switch
                checked={prefs.desktopEnabled}
                onCheckedChange={(v) => updatePref("desktopEnabled", v)}
                disabled={isPending || !prefs.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notify me about</CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Direct messages</Label>
            </div>
            <Switch
              checked={prefs.notifyOnDirectMessage}
              onCheckedChange={(v) => updatePref("notifyOnDirectMessage", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground" />
              <Label>@mentions</Label>
            </div>
            <Switch
              checked={prefs.notifyOnMention}
              onCheckedChange={(v) => updatePref("notifyOnMention", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Label>All channel messages</Label>
            </div>
            <Switch
              checked={prefs.notifyOnChannelMessage}
              onCheckedChange={(v) => updatePref("notifyOnChannelMessage", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <Label>Thread replies</Label>
            </div>
            <Switch
              checked={prefs.notifyOnThreadReply}
              onCheckedChange={(v) => updatePref("notifyOnThreadReply", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <Label>Reactions to my messages</Label>
            </div>
            <Switch
              checked={prefs.notifyOnReaction}
              onCheckedChange={(v) => updatePref("notifyOnReaction", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specified hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable quiet hours</Label>
            <Switch
              checked={prefs.quietHoursEnabled}
              onCheckedChange={(v) => updatePref("quietHoursEnabled", v)}
              disabled={isPending || !prefs.enabled}
            />
          </div>

          {prefs.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start time</Label>
                <Input
                  id="start"
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) =>
                    updatePref("quietHoursStart", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End time</Label>
                <Input
                  id="end"
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => updatePref("quietHoursEnd", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Keywords</CardTitle>
          <CardDescription>
            Get notified when these words appear in any message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              disabled={isPending || !prefs.enabled}
            />
            <Button
              size="icon"
              onClick={handleAddKeyword}
              disabled={isPending || !prefs.enabled || !newKeyword.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {prefs.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prefs.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="pr-1">
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {prefs.keywords.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No keywords added. Add words like &quot;urgent&quot;, &quot;deadline&quot;, or your
              name.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Channel Overrides */}
      {channels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Channel Settings</CardTitle>
            <CardDescription>
              Override notification settings for specific channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((channel) => {
              const override = prefs.channelOverrides[channel.id];
              return (
                <div
                  key={channel.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>{channel.name}</span>
                    {override?.muted && (
                      <BellOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <Select
                    value={override?.notifyOn || "mentions"}
                    onValueChange={(v: "all" | "mentions" | "none") => {
                      const newOverrides = { ...prefs.channelOverrides };
                      newOverrides[channel.id] = {
                        muted: v === "none",
                        notifyOn: v,
                      };
                      updatePref("channelOverrides", newOverrides);
                    }}
                    disabled={isPending || !prefs.enabled}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All messages</SelectItem>
                      <SelectItem value="mentions">Mentions only</SelectItem>
                      <SelectItem value="none">Muted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Reset */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isPending}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}

export default NotificationSettings;
