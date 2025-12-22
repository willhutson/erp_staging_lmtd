"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  MessageSquare,
  Mail,
  Phone,
  Star,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Building2,
  User,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type ComplaintSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ComplaintStatus = "NEW" | "ACKNOWLEDGED" | "IN_PROGRESS" | "PENDING_CLIENT" | "RESOLVED" | "CLOSED";
type ComplaintSource = "EMAIL" | "WHATSAPP" | "PHONE_CALL" | "NPS_SURVEY" | "MEETING" | "PORTAL" | "OTHER";

interface Complaint {
  id: string;
  title: string;
  description: string;
  source: ComplaintSource;
  category: string | null;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  priority: number;
  createdAt: Date;
  client: { id: string; name: string; code: string };
  contact: { id: string; name: string; email: string | null } | null;
  assignedTo: { id: string; name: string } | null;
  brief: { id: string; title: string; briefNumber: string } | null;
  npsResponse: { id: string; score: number; category: string } | null;
}

interface Stats {
  total: number;
  open: number;
  closed: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  bySource: Record<string, number>;
  avgResolutionDays: number | null;
}

interface ComplaintsDashboardClientProps {
  complaints: Complaint[];
  stats: Stats;
}

const SOURCE_ICONS: Record<ComplaintSource, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageSquare className="h-4 w-4" />,
  PHONE_CALL: <Phone className="h-4 w-4" />,
  NPS_SURVEY: <Star className="h-4 w-4" />,
  MEETING: <Users className="h-4 w-4" />,
  PORTAL: <FileText className="h-4 w-4" />,
  OTHER: <AlertTriangle className="h-4 w-4" />,
};

const SEVERITY_CONFIG: Record<ComplaintSeverity, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-blue-100 text-blue-700" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700" },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700" },
};

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; icon: React.ReactNode }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="h-3 w-3" /> },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-purple-100 text-purple-700", icon: <CheckCircle className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  PENDING_CLIENT: { label: "Pending Client", color: "bg-orange-100 text-orange-700", icon: <User className="h-3 w-3" /> },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: <XCircle className="h-3 w-3" /> },
};

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const severityConfig = SEVERITY_CONFIG[complaint.severity];
  const statusConfig = STATUS_CONFIG[complaint.status];

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#52EDC7] transition-colors bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("p-1 rounded", severityConfig.color)}>
              {SOURCE_ICONS[complaint.source]}
            </div>
            <h3 className="font-medium text-gray-900 truncate">{complaint.title}</h3>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{complaint.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {complaint.client.code}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", severityConfig.color)}>
              {severityConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs flex items-center gap-1", statusConfig.color)}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
            {complaint.npsResponse && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                <Star className="h-3 w-3 mr-1" />
                NPS: {complaint.npsResponse.score}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
          </p>
          {complaint.assignedTo && (
            <Badge variant="outline" className="text-xs">
              {complaint.assignedTo.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComplaintsDashboardClient({
  complaints,
  stats,
}: ComplaintsDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      !searchQuery ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.client.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && !["RESOLVED", "CLOSED"].includes(complaint.status)) ||
      complaint.status === statusFilter;

    const matchesSeverity = severityFilter === "all" || complaint.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{stats.closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {stats.avgResolutionDays ? `${Math.round(stats.avgResolutionDays)}d` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center gap-2">
                {SOURCE_ICONS[source as ComplaintSource]}
                <span className="text-sm text-gray-600">{source.replace("_", " ")}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
            onClick={() => setStatusFilter("open")}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              statusFilter === "open"
                ? "bg-[#52EDC7] text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Open
          </button>
          <button
            onClick={() => setStatusFilter("RESOLVED")}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              statusFilter === "RESOLVED"
                ? "bg-[#52EDC7] text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Resolved
          </button>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white"
          >
            <option value="all">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Complaint List */}
      {filteredComplaints.length > 0 ? (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                ? "No complaints match your filters."
                : "No complaints have been logged yet. Complaints can be created from NPS surveys, WhatsApp, or manually."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
