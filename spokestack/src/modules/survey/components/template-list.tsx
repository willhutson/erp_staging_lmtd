"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Copy,
  Archive,
  ExternalLink,
} from "lucide-react";
import type { TemplateListItem, TemplateKind, TemplateCategory } from "../types";
import { formatDistanceToNow } from "date-fns";

interface TemplateListProps {
  templates: TemplateListItem[];
  onCreateNew: () => void;
}

const KIND_LABELS: Record<string, string> = {
  SURVEY: "Survey",
  FORM: "Form",
  QUIZ: "Quiz",
  POLL: "Poll",
  FEEDBACK: "Feedback",
};

const KIND_COLORS: Record<string, string> = {
  SURVEY: "bg-blue-100 text-blue-700",
  FORM: "bg-green-100 text-green-700",
  QUIZ: "bg-purple-100 text-purple-700",
  POLL: "bg-orange-100 text-orange-700",
  FEEDBACK: "bg-pink-100 text-pink-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
  CLIENT_SATISFACTION: "Client Satisfaction",
  EVENT_FEEDBACK: "Event Feedback",
  ONBOARDING: "Onboarding",
  ASSESSMENT: "Assessment",
  APPLICATION: "Application",
  RESEARCH: "Research",
  INTERNAL_PROCESS: "Internal Process",
  CUSTOM: "Custom",
};

export function TemplateList({ templates, onCreateNew }: TemplateListProps) {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredTemplates = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (kindFilter !== "all" && t.kind !== kindFilter) {
      return false;
    }
    if (categoryFilter !== "all" && t.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage survey templates
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={kindFilter} onValueChange={setKindFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">No templates found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || kindFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first template to get started"}
            </p>
            {!search && kindFilter === "all" && categoryFilter === "all" && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      <Link
                        href={`/surveys/templates/${template.id}`}
                        className="hover:text-primary"
                      >
                        {template.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={KIND_COLORS[template.kind]}
                      >
                        {KIND_LABELS[template.kind]}
                      </Badge>
                      {template.isPublished && (
                        <Badge variant="outline" className="text-green-600">
                          Published
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/surveys/templates/${template.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/surveys/templates/${template.id}/preview`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {template.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{template.usageCount} uses</span>
                  <span>
                    Updated {formatDistanceToNow(template.createdAt, { addSuffix: true })}
                  </span>
                </div>
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
