"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen,
  Search,
  Filter,
  Download,
  Eye,
  FileImage,
  FileVideo,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Grid3X3,
  List,
  Calendar,
  SortAsc,
} from "lucide-react";

// Mock deliverables data
const DELIVERABLES = [
  {
    id: "1",
    title: "Q1 Campaign - Hero Banner",
    type: "Design",
    format: "PSD, PNG",
    project: "Brand Campaign Q1",
    date: "Dec 28, 2025",
    status: "approved",
    thumbnail: "/thumbnails/hero-banner.jpg",
  },
  {
    id: "2",
    title: "Product Launch Video - 60s",
    type: "Video",
    format: "MP4, MOV",
    project: "Product Launch",
    date: "Dec 27, 2025",
    status: "approved",
    thumbnail: "/thumbnails/product-video.jpg",
  },
  {
    id: "3",
    title: "Instagram Story Templates (Set of 10)",
    type: "Design",
    format: "PSD, PNG",
    project: "Social Media Assets",
    date: "Dec 26, 2025",
    status: "approved",
    thumbnail: "/thumbnails/story-templates.jpg",
  },
  {
    id: "4",
    title: "Brand Video - 30s Cut",
    type: "Video",
    format: "MP4",
    project: "Brand Campaign Q1",
    date: "Dec 25, 2025",
    status: "approved",
    thumbnail: "/thumbnails/brand-video.jpg",
  },
  {
    id: "5",
    title: "LinkedIn Article - Industry Trends",
    type: "Copy",
    format: "DOCX, PDF",
    project: "Thought Leadership",
    date: "Dec 24, 2025",
    status: "approved",
    thumbnail: null,
  },
  {
    id: "6",
    title: "Social Media Copy - December Pack",
    type: "Copy",
    format: "DOCX",
    project: "Social Media Assets",
    date: "Dec 23, 2025",
    status: "approved",
    thumbnail: null,
  },
  {
    id: "7",
    title: "Email Newsletter Template",
    type: "Design",
    format: "HTML, PSD",
    project: "Email Marketing",
    date: "Dec 22, 2025",
    status: "approved",
    thumbnail: "/thumbnails/email-template.jpg",
  },
  {
    id: "8",
    title: "Behind the Scenes Reel",
    type: "Video",
    format: "MP4",
    project: "Social Media Assets",
    date: "Dec 21, 2025",
    status: "approved",
    thumbnail: "/thumbnails/bts-reel.jpg",
  },
  {
    id: "9",
    title: "Website Hero Section Copy",
    type: "Copy",
    format: "DOCX",
    project: "Website Refresh",
    date: "Dec 31, 2025",
    status: "pending",
    thumbnail: null,
  },
  {
    id: "10",
    title: "Print Ad - Magazine Full Page",
    type: "Design",
    format: "PDF, AI",
    project: "Print Campaign",
    date: "Jan 2, 2026",
    status: "pending",
    thumbnail: "/thumbnails/print-ad.jpg",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Design":
      return <FileImage className="h-5 w-5 text-pink-500" />;
    case "Video":
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    case "Copy":
      return <FileText className="h-5 w-5 text-blue-500" />;
    default:
      return <FolderOpen className="h-5 w-5 text-slate-500" />;
  }
};

const getStatusBadge = (status: string) => {
  if (status === "approved") {
    return (
      <Badge className="bg-green-500">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
};

export default function DeliverablesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredDeliverables = DELIVERABLES.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliverables</h1>
        <p className="text-muted-foreground mt-1">
          Browse and download all project deliverables
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliverables..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Copy">Copy</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[130px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredDeliverables.length} of {DELIVERABLES.length} deliverables
      </p>

      {/* Deliverables List */}
      {viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredDeliverables.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <span>{item.project}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {item.format}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeliverables.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {item.thumbnail ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                ) : (
                  getTypeIcon(item.type)
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="truncate">{item.project}</span>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">{item.format}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredDeliverables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">No deliverables found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
