"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Sparkles,
  Plus,
  ChevronRight,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Video,
  Image,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AICalendarGeneratorModal } from "@/modules/studio/components";
import type { SocialContentType } from "@prisma/client";

interface CalendarEntry {
  id: string;
  title: string;
  contentType: SocialContentType;
  scheduledDate: Date;
  platforms: string[];
  color: string | null;
}

interface ClientCalendar {
  id: string;
  name: string;
  code: string | null;
  entryCount: number;
  recentEntries: CalendarEntry[];
}

interface CalendarGalleryClientProps {
  clients: ClientCalendar[];
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Video,
};

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  POST: Image,
  CAROUSEL: LayoutGrid,
  REEL: Video,
  STORY: Image,
  ARTICLE: FileText,
  THREAD: FileText,
  LIVE: Video,
  AD: Image,
};

export function CalendarGalleryClient({ clients }: CalendarGalleryClientProps) {
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  // Sort clients: those with entries first, then by name
  const sortedClients = [...clients].sort((a, b) => {
    if (a.entryCount > 0 && b.entryCount === 0) return -1;
    if (a.entryCount === 0 && b.entryCount > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  const clientsWithContent = sortedClients.filter((c) => c.entryCount > 0);
  const clientsWithoutContent = sortedClients.filter((c) => c.entryCount === 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Content Calendars</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Build and manage social media calendars for your clients
          </p>
        </div>
      </div>

      {/* AI Generator Hero Card */}
      <div
        onClick={() => setIsAIGeneratorOpen(true)}
        className="mb-8 p-6 rounded-[var(--ltd-radius-xl)] border-2 border-dashed border-ltd-primary/50 bg-gradient-to-br from-ltd-primary/5 to-ltd-primary/10 cursor-pointer hover:border-ltd-primary hover:from-ltd-primary/10 hover:to-ltd-primary/20 transition-all group"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[var(--ltd-radius-lg)] bg-gradient-to-br from-ltd-primary to-ltd-primary-dark flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-8 h-8 text-ltd-primary-text" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-ltd-text-1 mb-1 flex items-center gap-2">
              AI Calendar Generator
              <span className="px-2 py-0.5 text-xs font-medium bg-ltd-primary/20 text-ltd-primary rounded-full">
                New
              </span>
            </h2>
            <p className="text-ltd-text-2">
              Generate a complete content calendar with AI. Set your mood, goals, holidays, and posting cadence — get a month of strategic content ideas instantly.
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-ltd-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Active Calendars */}
      {clientsWithContent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">Active Calendars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientsWithContent.map((client) => (
              <Link
                key={client.id}
                href={`/studio/calendar/${client.id}`}
                className="block p-5 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-ltd-text-1 group-hover:text-ltd-primary transition-colors">
                      {client.name}
                    </h3>
                    {client.code && (
                      <span className="text-xs text-ltd-text-3">{client.code}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ltd-text-3 bg-ltd-surface-3 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {client.entryCount} posts
                  </div>
                </div>

                {/* Recent entries preview */}
                <div className="space-y-2">
                  {client.recentEntries.slice(0, 3).map((entry) => {
                    const ContentIcon = CONTENT_TYPE_ICONS[entry.contentType] || Image;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-1 h-6 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color || "#52EDC7" }}
                        />
                        <ContentIcon className="w-3.5 h-3.5 text-ltd-text-3 shrink-0" />
                        <span className="text-ltd-text-2 truncate flex-1">
                          {entry.title}
                        </span>
                        <span className="text-xs text-ltd-text-3 shrink-0">
                          {format(new Date(entry.scheduledDate), "MMM d")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Platforms */}
                {client.recentEntries.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-ltd-border-1">
                    <span className="text-xs text-ltd-text-3">Platforms:</span>
                    <div className="flex gap-1.5">
                      {[...new Set(client.recentEntries.flatMap((e) => e.platforms))].map(
                        (platform) => {
                          const Icon = PLATFORM_ICONS[platform.toLowerCase()] || Calendar;
                          return (
                            <div
                              key={platform}
                              className="w-6 h-6 rounded-full bg-ltd-surface-3 flex items-center justify-center"
                              title={platform}
                            >
                              <Icon className="w-3.5 h-3.5 text-ltd-text-2" />
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Clients without calendars */}
      {clientsWithoutContent.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">
            Start a Calendar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {clientsWithoutContent.map((client) => (
              <div
                key={client.id}
                onClick={() => setIsAIGeneratorOpen(true)}
                className="p-4 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2/50 hover:border-ltd-primary/50 hover:bg-ltd-surface-2 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--ltd-radius-md)] bg-ltd-surface-3 flex items-center justify-center group-hover:bg-ltd-primary/10 transition-colors">
                    <Plus className="w-5 h-5 text-ltd-text-3 group-hover:text-ltd-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ltd-text-1">{client.name}</h3>
                    <p className="text-xs text-ltd-text-3">Create calendar</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-ltd-surface-3 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-ltd-text-3" />
          </div>
          <h3 className="text-lg font-medium text-ltd-text-1 mb-2">No clients yet</h3>
          <p className="text-ltd-text-2 mb-6">
            Add clients to your organization to start creating content calendars.
          </p>
        </div>
      )}

      {/* AI Generator Modal */}
      <AICalendarGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onComplete={() => {
          setIsAIGeneratorOpen(false);
          // Refresh the page to show new entries
          window.location.reload();
        }}
        clients={clients.map((c) => ({ id: c.id, name: c.name, code: c.code || undefined }))}
      />
    </div>
  );
}
