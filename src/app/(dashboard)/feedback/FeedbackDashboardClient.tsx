"use client";

import Link from "next/link";
import {
  Star,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  MessageSquare,
  Mail,
  Phone,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface NPSStats {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  avgScore: number;
}

interface IssueStats {
  total: number;
  open: number;
  closed: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  bySource: Record<string, number>;
  avgResolutionDays: number | null;
}

interface Issue {
  id: string;
  title: string;
  severity: string;
  status: string;
  source: string;
  createdAt: Date;
  client: { id: string; name: string; code: string };
  npsResponse: { score: number; category: string } | null;
}

interface NPSResponse {
  id: string;
  score: number;
  category: string;
  whatWeDoWell: string | null;
  whatToImprove: string | null;
  submittedAt: Date;
  survey: {
    client: { id: string; name: string; code: string };
  };
  contact: { name: string } | null;
}

interface FeedbackDashboardClientProps {
  npsStats: NPSStats;
  issueStats: IssueStats;
  recentIssues: Issue[];
  recentNPSResponses: NPSResponse[];
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageSquare className="h-4 w-4" />,
  PHONE_CALL: <Phone className="h-4 w-4" />,
  NPS_SURVEY: <Star className="h-4 w-4" />,
  OTHER: <AlertTriangle className="h-4 w-4" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const CATEGORY_COLORS: Record<string, string> = {
  PROMOTER: "bg-green-100 text-green-700",
  PASSIVE: "bg-yellow-100 text-yellow-700",
  DETRACTOR: "bg-red-100 text-red-700",
};

function NPSScoreGauge({ score }: { score: number }) {
  // NPS ranges from -100 to +100
  const percentage = (score + 100) / 2;
  const color = score >= 50 ? "text-green-600" : score >= 0 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 rounded-t-full" />
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-t-full transition-all"
          style={{ height: `${percentage}%` }}
        />
      </div>
      <p className={cn("text-3xl font-bold mt-2", color)}>
        {score > 0 ? "+" : ""}{score}
      </p>
      <p className="text-sm text-gray-500">NPS Score</p>
    </div>
  );
}

export function FeedbackDashboardClient({
  npsStats,
  issueStats,
  recentIssues,
  recentNPSResponses,
}: FeedbackDashboardClientProps) {
  const sentimentHealth = npsStats.npsScore >= 50 ? "Excellent" :
    npsStats.npsScore >= 20 ? "Good" :
    npsStats.npsScore >= 0 ? "Needs Attention" : "Critical";

  const sentimentColor = npsStats.npsScore >= 50 ? "text-green-600" :
    npsStats.npsScore >= 20 ? "text-[#52EDC7]" :
    npsStats.npsScore >= 0 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <Link href="/feedback">
          <Button variant="default" className="bg-[#52EDC7] text-gray-900 hover:bg-[#1BA098] hover:text-white">
            Overview
          </Button>
        </Link>
        <Link href="/feedback/nps">
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            NPS Surveys
          </Button>
        </Link>
        <Link href="/feedback/issues">
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Issues
          </Button>
        </Link>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* NPS Score Card */}
        <Card className="lg:row-span-2">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <NPSScoreGauge score={npsStats.npsScore} />
            <p className={cn("text-lg font-semibold mt-4", sentimentColor)}>
              {sentimentHealth}
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-green-600">{npsStats.promoters}</p>
                <p className="text-gray-500">Promoters</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-yellow-600">{npsStats.passives}</p>
                <p className="text-gray-500">Passives</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-red-600">{npsStats.detractors}</p>
                <p className="text-gray-500">Detractors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Responses</p>
                <p className="text-2xl font-bold">{npsStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Open Issues</p>
                <p className="text-2xl font-bold">{issueStats.open}</p>
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
                <p className="text-2xl font-bold">{issueStats.closed}</p>
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
                  {issueStats.avgResolutionDays ? `${Math.round(issueStats.avgResolutionDays)}d` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#52EDC7]/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[#1BA098]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold">{npsStats.avgScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent NPS Responses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent NPS Responses</CardTitle>
            <Link href="/feedback/nps">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentNPSResponses.length > 0 ? (
              <div className="space-y-3">
                {recentNPSResponses.slice(0, 5).map((response) => (
                  <div
                    key={response.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={CATEGORY_COLORS[response.category]}>
                          {response.score}
                        </Badge>
                        <span className="font-medium text-sm">{response.survey.client.code}</span>
                        {response.contact && (
                          <span className="text-sm text-gray-500">- {response.contact.name}</span>
                        )}
                      </div>
                      {response.whatToImprove && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {response.whatToImprove}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No responses yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Issues</CardTitle>
            <Link href="/feedback/issues">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentIssues.length > 0 ? (
              <div className="space-y-3">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", SEVERITY_COLORS[issue.severity])}>
                          {SOURCE_ICONS[issue.source] || <AlertTriangle className="h-3 w-3" />}
                        </div>
                        <span className="font-medium text-sm truncate">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {issue.client.code}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", SEVERITY_COLORS[issue.severity])}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No issues logged</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Sources Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issues by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(issueStats.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                {SOURCE_ICONS[source] || <AlertTriangle className="h-4 w-4" />}
                <span className="text-sm text-gray-600">{source.replace("_", " ")}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {Object.keys(issueStats.bySource).length === 0 && (
              <p className="text-sm text-gray-500">No issues recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
