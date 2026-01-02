"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  BarChart2,
  Copy,
  Pause,
  Play,
  Archive,
  Mail,
  Link2,
  Users,
} from "lucide-react";
import type { SurveyListItem, SurveyStatus } from "../types";
import { format, formatDistanceToNow } from "date-fns";

interface SurveyListProps {
  surveys: SurveyListItem[];
  onCreateNew: () => void;
}

const STATUS_COLORS: Record<SurveyStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<SurveyStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export function SurveyList({ surveys, onCreateNew }: SurveyListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "cards">("table");

  const filteredSurveys = surveys.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && s.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Stats
  const activeCount = surveys.filter((s) => s.status === "ACTIVE").length;
  const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Surveys</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active • {totalResponses} total responses
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Survey
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredSurveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">No surveys found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first survey to start collecting responses"}
            </p>
            {!search && statusFilter === "all" && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Survey Table */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survey</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {survey.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {survey.template.name}
                        {survey.targetClient && (
                          <span className="ml-2">
                            • {survey.targetClient.name}
                          </span>
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[survey.status]}
                    >
                      {STATUS_LABELS[survey.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{survey.responseCount}</span>
                      {survey.maxResponses && (
                        <>
                          <span className="text-muted-foreground">
                            / {survey.maxResponses}
                          </span>
                          <Progress
                            value={(survey.responseCount / survey.maxResponses) * 100}
                            className="w-16 h-1.5"
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {survey.channels.includes("WEB_LINK") && (
                        <span title="Web Link">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      {survey.channels.includes("EMAIL") && (
                        <span title="Email">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      {survey.channels.includes("IN_APP") && (
                        <span title="In-App">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {survey.startsAt ? (
                        <span>
                          {format(survey.startsAt, "MMM d, yyyy")}
                          {survey.endsAt && (
                            <span className="text-muted-foreground">
                              {" → "}{format(survey.endsAt, "MMM d")}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No schedule</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/surveys/${survey.id}`}>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            View Results
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/s/${survey.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Survey
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {survey.status === "ACTIVE" ? (
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        ) : survey.status === "PAUSED" ? (
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
