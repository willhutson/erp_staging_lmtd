"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  MoreHorizontal,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Music2,
  Calendar,
  Loader2,
  Image,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PublishJobStatus, SocialPlatform } from "@prisma/client";
import {
  cancelJob,
  retryJob,
  markAsManuallyPublished,
  processJob,
} from "@/modules/content/services/publisher-service";

interface QueueJob {
  id: string;
  platform: SocialPlatform;
  status: PublishJobStatus;
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  publishedAt: Date | null;
  platformPostUrl: string | null;
  errorMessage: string | null;
  post: {
    id: string;
    title: string;
    client: { id: string; name: string; code: string };
    assets: Array<{ id: string; type: string; fileUrl: string; thumbnailUrl: string | null }>;
  };
  socialAccount: { id: string; accountName: string; avatarUrl: string | null } | null;
}

interface Stats {
  pending: number;
  processing: number;
  published: number;
  failed: number;
  scheduled: number;
}

interface PublishQueueClientProps {
  initialQueue: QueueJob[];
  stats: Stats;
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM_FEED: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_STORY: <Instagram className="w-4 h-4 text-pink-500" />,
  INSTAGRAM_REEL: <Instagram className="w-4 h-4 text-pink-500" />,
  FACEBOOK_PAGE: <Facebook className="w-4 h-4 text-blue-600" />,
  TIKTOK: <Music2 className="w-4 h-4 text-gray-800" />,
  YOUTUBE_VIDEO: <Youtube className="w-4 h-4 text-red-600" />,
  YOUTUBE_SHORT: <Youtube className="w-4 h-4 text-red-600" />,
  LINKEDIN_PAGE: <Linkedin className="w-4 h-4 text-blue-700" />,
  X_TWEET: <Twitter className="w-4 h-4 text-gray-800" />,
};

const statusConfig: Record<
  PublishJobStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-4 h-4" />,
  },
  QUEUED: {
    label: "Queued",
    color: "bg-blue-100 text-blue-700",
    icon: <Play className="w-4 h-4" />,
  },
  PROCESSING: {
    label: "Publishing",
    color: "bg-purple-100 text-purple-700",
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  PUBLISHED: {
    label: "Published",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-500",
    icon: <Pause className="w-4 h-4" />,
  },
  SKIPPED: {
    label: "Skipped",
    color: "bg-gray-100 text-gray-500",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

export function PublishQueueClient({ initialQueue, stats }: PublishQueueClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualPublishDialog, setManualPublishDialog] = useState<QueueJob | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [filter, setFilter] = useState<PublishJobStatus | "ALL">("ALL");

  const filteredQueue =
    filter === "ALL"
      ? initialQueue
      : initialQueue.filter((job) => job.status === filter);

  const handleRetry = (jobId: string) => {
    startTransition(async () => {
      await retryJob(jobId);
      router.refresh();
    });
  };

  const handleCancel = (jobId: string) => {
    startTransition(async () => {
      await cancelJob(jobId);
      router.refresh();
    });
  };

  const handlePublishNow = (jobId: string) => {
    startTransition(async () => {
      await processJob(jobId);
      router.refresh();
    });
  };

  const handleManualPublish = () => {
    if (!manualPublishDialog) return;
    startTransition(async () => {
      await markAsManuallyPublished(manualPublishDialog.id, manualUrl || undefined);
      setManualPublishDialog(null);
      setManualUrl("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={cn("cursor-pointer", filter === "PENDING" && "ring-2 ring-[#52EDC7]")}
          onClick={() => setFilter(filter === "PENDING" ? "ALL" : "PENDING")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer", filter === "PROCESSING" && "ring-2 ring-[#52EDC7]")}
          onClick={() => setFilter(filter === "PROCESSING" ? "ALL" : "PROCESSING")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-500">Processing</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.processing}</p>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer", filter === "PUBLISHED" && "ring-2 ring-[#52EDC7]")}
          onClick={() => setFilter(filter === "PUBLISHED" ? "ALL" : "PUBLISHED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Published (24h)</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.published}</p>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer", filter === "FAILED" && "ring-2 ring-[#52EDC7]")}
          onClick={() => setFilter(filter === "FAILED" ? "ALL" : "FAILED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-500">Failed (7d)</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.failed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-500">Scheduled</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.scheduled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {filter === "ALL" ? "All Jobs" : statusConfig[filter].label}
          </CardTitle>
          {filter !== "ALL" && (
            <Button variant="ghost" size="sm" onClick={() => setFilter("ALL")}>
              Show All
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs in queue
            </div>
          ) : (
            <div className="divide-y">
              {filteredQueue.map((job) => {
                const status = statusConfig[job.status];
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {job.post.assets[0]?.thumbnailUrl || job.post.assets[0]?.fileUrl ? (
                        <img
                          src={job.post.assets[0].thumbnailUrl || job.post.assets[0].fileUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {platformIcons[job.platform] || <Globe className="w-4 h-4" />}
                        <span className="font-medium truncate">{job.post.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span>{job.post.client.name}</span>
                        <span>•</span>
                        <span>
                          {new Date(job.scheduledFor).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {job.socialAccount && (
                          <>
                            <span>•</span>
                            <span>@{job.socialAccount.accountName}</span>
                          </>
                        )}
                      </div>
                      {job.errorMessage && (
                        <p className="text-sm text-red-600 mt-1 truncate">
                          {job.errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <Badge className={cn("flex items-center gap-1", status.color)}>
                        {status.icon}
                        {status.label}
                      </Badge>

                      {job.platformPostUrl && (
                        <a
                          href={job.platformPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isPending}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {job.status === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => handlePublishNow(job.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Publish Now
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setManualPublishDialog(job)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Published
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancel(job.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          {job.status === "FAILED" && (
                            <>
                              <DropdownMenuItem onClick={() => handleRetry(job.id)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setManualPublishDialog(job)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Published
                              </DropdownMenuItem>
                            </>
                          )}
                          {job.status === "PUBLISHED" && job.platformPostUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={job.platformPostUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Post
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Publish Dialog */}
      <Dialog open={!!manualPublishDialog} onOpenChange={() => setManualPublishDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Published</DialogTitle>
            <DialogDescription>
              Confirm that this content has been manually published.
              Optionally provide the URL to the published post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Post URL (optional)</Label>
              <Input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualPublishDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualPublish}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm Published
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
