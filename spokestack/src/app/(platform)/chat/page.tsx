"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Lock,
  Send,
  Plus,
  Search,
  Settings,
  Bell,
  Pin,
  MoreHorizontal,
  Smile,
  Paperclip,
  AtSign,
  MessageSquare,
  Users,
  Circle,
} from "lucide-react";

// Mock data for channels
const CHANNELS = [
  { id: "general", name: "general", isPrivate: false, unread: 0 },
  { id: "announcements", name: "announcements", isPrivate: false, unread: 2 },
  { id: "creative", name: "creative", isPrivate: false, unread: 0 },
  { id: "production", name: "production", isPrivate: false, unread: 5 },
  { id: "leadership", name: "leadership", isPrivate: true, unread: 0 },
  { id: "tech", name: "tech", isPrivate: false, unread: 1 },
  { id: "random", name: "random", isPrivate: false, unread: 0 },
];

// Mock data for direct messages
const DIRECT_MESSAGES = [
  { id: "cj", name: "CJ Ocampo", avatar: null, status: "online", unread: 1 },
  { id: "ted", name: "Ted Vicencio", avatar: null, status: "online", unread: 0 },
  { id: "salma", name: "Salma Hassan", avatar: null, status: "away", unread: 0 },
  { id: "afaq", name: "Afaq Ahmed", avatar: null, status: "offline", unread: 0 },
  { id: "matthew", name: "Matthew Reynolds", avatar: null, status: "online", unread: 3 },
];

// Mock messages
const MOCK_MESSAGES = [
  {
    id: "1",
    user: { name: "CJ Ocampo", avatar: null },
    content: "Hey team, just uploaded the new brand guidelines to the shared drive. Please take a look when you get a chance!",
    timestamp: "9:32 AM",
    reactions: [{ emoji: "thumbsup", count: 3 }],
  },
  {
    id: "2",
    user: { name: "Ted Vicencio", avatar: null },
    content: "Thanks CJ! I'll review them before the client call this afternoon.",
    timestamp: "9:45 AM",
    reactions: [],
  },
  {
    id: "3",
    user: { name: "Salma Hassan", avatar: null },
    content: "Quick reminder: CCAD deliverables are due by EOD tomorrow. Let me know if anyone needs support.",
    timestamp: "10:15 AM",
    reactions: [{ emoji: "check", count: 5 }],
  },
  {
    id: "4",
    user: { name: "Will Hutson", avatar: null },
    content: "Great work on the DET campaign everyone! Client loved the final output.",
    timestamp: "11:00 AM",
    reactions: [{ emoji: "tada", count: 8 }, { emoji: "heart", count: 4 }],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
}

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isChannel = CHANNELS.some((c) => c.id === selectedChannel);
  const currentChannel = CHANNELS.find((c) => c.id === selectedChannel);
  const currentDM = DIRECT_MESSAGES.find((d) => d.id === selectedChannel);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 -m-6">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">SpokeChat</h2>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Channels */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-0.5">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    selectedChannel === channel.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {channel.isPrivate ? (
                    <Lock className="h-4 w-4 shrink-0" />
                  ) : (
                    <Hash className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  {channel.unread > 0 && (
                    <Badge className="ml-auto h-5 px-1.5 text-xs bg-primary">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Direct Messages */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-0.5">
              {DIRECT_MESSAGES.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => setSelectedChannel(dm.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    selectedChannel === dm.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={dm.avatar || undefined} />
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {getInitials(dm.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(
                        dm.status
                      )}`}
                    />
                  </div>
                  <span className="truncate">{dm.name}</span>
                  {dm.unread > 0 && (
                    <Badge className="ml-auto h-5 px-1.5 text-xs bg-primary">
                      {dm.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-14 border-b px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isChannel ? (
              <>
                {currentChannel?.isPrivate ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-semibold">{currentChannel?.name}</span>
              </>
            ) : (
              <>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {currentDM && getInitials(currentDM.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{currentDM?.name}</span>
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(currentDM?.status || "offline")}`}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {MOCK_MESSAGES.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-sm">
                    {getInitials(message.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{message.user.name}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm mt-0.5">{message.content}</p>
                  {message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction, idx) => (
                        <button
                          key={idx}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs hover:bg-muted/80"
                        >
                          <span>
                            {reaction.emoji === "thumbsup" && "👍"}
                            {reaction.emoji === "check" && "✅"}
                            {reaction.emoji === "tada" && "🎉"}
                            {reaction.emoji === "heart" && "❤️"}
                          </span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              placeholder={`Message ${isChannel ? "#" + currentChannel?.name : currentDM?.name}`}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <AtSign className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8" disabled={!messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
