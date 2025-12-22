"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  User,
  Building2,
  Mic,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Volume2,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  waPhoneNumber: string;
  waDisplayName: string | null;
  status: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  client: { id: string; name: string; code: string } | null;
  contact: { id: string; name: string; email: string | null } | null;
  assignedTo: { id: string; name: string } | null;
  brief: { id: string; title: string; briefNumber: string } | null;
}

interface Stats {
  totalConversations: number;
  activeConversations: number;
  totalUnread: number;
  voiceNotesReceived: number;
  messagesByDirection: Record<string, number>;
}

interface WhatsAppDashboardClientProps {
  conversations: Conversation[];
  stats: Stats;
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const displayName = conversation.waDisplayName || conversation.waPhoneNumber;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Link
      href={`/whatsapp/${conversation.id}`}
      className={cn(
        "block p-4 border rounded-lg hover:border-[#52EDC7] transition-colors",
        hasUnread ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            conversation.client ? "bg-[#52EDC7]/20 text-[#1BA098]" : "bg-gray-100 text-gray-500"
          )}>
            {conversation.client ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("font-medium truncate", hasUnread && "text-gray-900")}>
                {displayName}
              </p>
              {hasUnread && (
                <Badge className="bg-green-500 text-white text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conversation.waPhoneNumber}
            </p>
            {conversation.lastMessagePreview && (
              <p className={cn(
                "text-sm mt-1 truncate",
                hasUnread ? "text-gray-700 font-medium" : "text-gray-500"
              )}>
                {conversation.lastMessagePreview}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {conversation.lastMessageAt && (
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
            </p>
          )}
          <ChevronRight className="h-4 w-4 text-gray-300" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {conversation.client && (
          <Badge variant="outline" className="text-xs">
            {conversation.client.code}
          </Badge>
        )}
        {conversation.brief && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {conversation.brief.briefNumber}
          </Badge>
        )}
        {conversation.assignedTo && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            {conversation.assignedTo.name}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export function WhatsAppDashboardClient({
  conversations,
  stats,
}: WhatsAppDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      !searchQuery ||
      conv.waPhoneNumber.includes(searchQuery) ||
      conv.waDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.client?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && conv.unreadCount > 0) ||
      conv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{stats.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="text-2xl font-bold">{stats.totalUnread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mic className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Voice Notes</p>
                <p className="text-2xl font-bold">{stats.voiceNotesReceived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by phone, name, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              statusFilter === "all"
                ? "bg-[#52EDC7] text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("unread")}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              statusFilter === "unread"
                ? "bg-[#52EDC7] text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setStatusFilter("ARCHIVED")}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              statusFilter === "ARCHIVED"
                ? "bg-[#52EDC7] text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Conversation List */}
      {filteredConversations.length > 0 ? (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No conversations match your filters."
                : "WhatsApp conversations will appear here once connected."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Setup Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">WhatsApp Business Integration</p>
              <p className="text-sm text-blue-700 mt-1">
                Connect your WhatsApp Business account to receive and send messages.
                Voice notes are automatically transcribed in Arabic and English.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
