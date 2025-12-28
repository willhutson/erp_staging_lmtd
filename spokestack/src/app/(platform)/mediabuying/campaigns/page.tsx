"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Search,
  MoreHorizontal,
  Pencil,
  ExternalLink,
  Play,
  Pause,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter
} from "lucide-react";
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
  TableRow
} from "@/components/ui/table";

// Platform icons
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "META":
      return (
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
          f
        </div>
      );
    case "GOOGLE":
      return (
        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xs">
          G
        </div>
      );
    case "TIKTOK":
      return (
        <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white font-bold text-[10px]">
          TT
        </div>
      );
    default:
      return null;
  }
};

// Mock campaigns data
const mockCampaigns = [
  {
    id: "1",
    name: "CCAD - Brand Awareness Q4",
    platform: "META",
    accountName: "LMTD Agency - Meta Business",
    status: "ACTIVE",
    objective: "AWARENESS",
    budget: 15000,
    spent: 8750,
    impressions: 2450000,
    clicks: 18500,
    conversions: 245,
    ctr: 0.76,
    cpm: 3.57,
    cpc: 0.47,
    roas: 4.2,
    trend: "up",
  },
  {
    id: "2",
    name: "DET - Visit Dubai Campaign",
    platform: "META",
    accountName: "LMTD Agency - Meta Business",
    status: "ACTIVE",
    objective: "TRAFFIC",
    budget: 25000,
    spent: 18200,
    impressions: 4800000,
    clicks: 42000,
    conversions: 890,
    ctr: 0.88,
    cpm: 3.79,
    cpc: 0.43,
    roas: 5.8,
    trend: "up",
  },
  {
    id: "3",
    name: "ADEK - Education Week",
    platform: "GOOGLE",
    accountName: "LMTD Agency - Google Ads",
    status: "ACTIVE",
    objective: "CONVERSIONS",
    budget: 12000,
    spent: 5600,
    impressions: 890000,
    clicks: 12500,
    conversions: 156,
    ctr: 1.40,
    cpm: 6.29,
    cpc: 0.45,
    roas: 3.1,
    trend: "stable",
  },
  {
    id: "4",
    name: "ECD - Tech Launch",
    platform: "TIKTOK",
    accountName: "LMTD - TikTok For Business",
    status: "ACTIVE",
    objective: "VIDEO_VIEWS",
    budget: 8000,
    spent: 4200,
    impressions: 1200000,
    clicks: 8900,
    conversions: 0,
    videoViews: 450000,
    ctr: 0.74,
    cpm: 3.50,
    cpc: 0.47,
    roas: 0,
    trend: "up",
  },
  {
    id: "5",
    name: "CCAD - Holiday Promo",
    platform: "META",
    accountName: "LMTD Agency - Meta Business",
    status: "PAUSED",
    objective: "CONVERSIONS",
    budget: 10000,
    spent: 3200,
    impressions: 680000,
    clicks: 5400,
    conversions: 78,
    ctr: 0.79,
    cpm: 4.71,
    cpc: 0.59,
    roas: 2.8,
    trend: "down",
  },
  {
    id: "6",
    name: "DET - Search Campaigns",
    platform: "GOOGLE",
    accountName: "LMTD Agency - Google Ads",
    status: "ACTIVE",
    objective: "TRAFFIC",
    budget: 20000,
    spent: 14800,
    impressions: 450000,
    clicks: 28000,
    conversions: 420,
    ctr: 6.22,
    cpm: 32.89,
    cpc: 0.53,
    roas: 4.5,
    trend: "up",
  },
];

export default function MediaCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || campaign.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <Play className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="bg-yellow-500">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 border-t-2 border-gray-400" />;
    }
  };

  const activeCampaigns = mockCampaigns.filter((c) => c.status === "ACTIVE");
  const totalSpend = mockCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = mockCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCtr = (totalClicks / totalImpressions) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your paid media campaigns
          </p>
        </div>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Performance Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockCampaigns.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impressions
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalImpressions)}</div>
            <p className="text-xs text-muted-foreground">Total reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clicks
            </CardTitle>
            <MousePointer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalClicks)}</div>
            <p className="text-xs text-muted-foreground">
              {avgCtr.toFixed(2)}% CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg ROAS
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                mockCampaigns.filter((c) => c.roas > 0).reduce((sum, c) => sum + c.roas, 0) /
                mockCampaigns.filter((c) => c.roas > 0).length
              ).toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">Return on ad spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>
                View performance metrics for all campaigns
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="META">Meta</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search campaigns..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spend / Budget</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>CPC</TableHead>
                <TableHead>ROAS</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(campaign.platform)}
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {campaign.objective}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(campaign.spent)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(campaign.budget)}
                      </div>
                      <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${
                            (campaign.spent / campaign.budget) > 0.9
                              ? "bg-red-500"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatNumber(campaign.impressions)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatNumber(campaign.clicks)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={campaign.ctr >= 1 ? "border-green-500 text-green-500" : ""}
                    >
                      {campaign.ctr.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${campaign.cpc.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {campaign.roas > 0 ? (
                      <Badge
                        variant="outline"
                        className={
                          campaign.roas >= 4
                            ? "border-green-500 text-green-500"
                            : campaign.roas >= 2
                            ? "border-blue-500 text-blue-500"
                            : ""
                        }
                      >
                        {campaign.roas.toFixed(1)}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getTrendIcon(campaign.trend)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "ACTIVE" ? (
                          <DropdownMenuItem className="text-yellow-600">
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
