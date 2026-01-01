"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Unlink
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
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
          f
        </div>
      );
    case "GOOGLE":
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
          G
        </div>
      );
    case "TIKTOK":
      return (
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs">
          TT
        </div>
      );
    case "SNAPCHAT":
      return (
        <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
      );
    case "LINKEDIN":
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
          in
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center text-white font-bold text-sm">
          ?
        </div>
      );
  }
};

// Mock ad accounts data
const mockAdAccounts = [
  {
    id: "1",
    platform: "META",
    accountId: "act_123456789",
    accountName: "LMTD Agency - Meta Business",
    isAgencyAccount: true,
    connected: true,
    syncStatus: "SUCCESS",
    lastSyncAt: "2024-12-28T10:30:00Z",
    dailyBudgetLimit: 5000,
    monthlyBudgetLimit: 100000,
    currentSpend: 45000,
    activeCampaigns: 12,
  },
  {
    id: "2",
    platform: "GOOGLE",
    accountId: "123-456-7890",
    accountName: "LMTD Agency - Google Ads",
    isAgencyAccount: true,
    connected: true,
    syncStatus: "SUCCESS",
    lastSyncAt: "2024-12-28T10:25:00Z",
    dailyBudgetLimit: 3000,
    monthlyBudgetLimit: 75000,
    currentSpend: 32000,
    activeCampaigns: 8,
  },
  {
    id: "3",
    platform: "TIKTOK",
    accountId: "7890123456",
    accountName: "LMTD - TikTok For Business",
    isAgencyAccount: false,
    connected: true,
    syncStatus: "SUCCESS",
    lastSyncAt: "2024-12-28T10:20:00Z",
    dailyBudgetLimit: 2000,
    monthlyBudgetLimit: 40000,
    currentSpend: 18500,
    activeCampaigns: 5,
  },
  {
    id: "4",
    platform: "SNAPCHAT",
    accountId: "snap_abc123",
    accountName: "LMTD Snapchat Ads",
    isAgencyAccount: false,
    connected: true,
    syncStatus: "ERROR",
    syncError: "Token expired",
    lastSyncAt: "2024-12-27T14:00:00Z",
    dailyBudgetLimit: 1000,
    monthlyBudgetLimit: 20000,
    currentSpend: 8200,
    activeCampaigns: 3,
  },
  {
    id: "5",
    platform: "LINKEDIN",
    accountId: "ln_987654321",
    accountName: "LMTD LinkedIn Campaigns",
    isAgencyAccount: false,
    connected: false,
    syncStatus: "PENDING",
    lastSyncAt: null,
    dailyBudgetLimit: null,
    monthlyBudgetLimit: null,
    currentSpend: 0,
    activeCampaigns: 0,
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function AdAccountsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

  const filteredAccounts = mockAdAccounts.filter((account) => {
    const matchesSearch =
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || account.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getSyncStatusBadge = (status: string, error?: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Synced
          </Badge>
        );
      case "SYNCING":
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant="destructive" title={error}>
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const connectedAccounts = mockAdAccounts.filter((a) => a.connected);
  const totalSpend = mockAdAccounts.reduce((sum, a) => sum + a.currentSpend, 0);
  const totalCampaigns = mockAdAccounts.reduce((sum, a) => sum + a.activeCampaigns, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Accounts</h1>
          <p className="text-muted-foreground">
            Manage connected advertising platform accounts
          </p>
        </div>
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Connect Ad Account</DialogTitle>
              <DialogDescription>
                Connect a new advertising platform account to track performance and manage budgets.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Platform</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "META", name: "Meta" },
                    { id: "GOOGLE", name: "Google" },
                    { id: "TIKTOK", name: "TikTok" },
                    { id: "SNAPCHAT", name: "Snapchat" },
                    { id: "LINKEDIN", name: "LinkedIn" },
                    { id: "TWITTER", name: "Twitter" },
                  ].map((platform) => (
                    <Button
                      key={platform.id}
                      variant="outline"
                      className="h-16 flex flex-col items-center gap-1"
                    >
                      {getPlatformIcon(platform.id)}
                      <span className="text-xs">{platform.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agency">Agency Account (MCC/BM)</SelectItem>
                    <SelectItem value="direct">Direct Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the platform to authorize access.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConnectDialogOpen(false)}>
                <Link2 className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected Accounts
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockAdAccounts.length} total accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spend (MTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sync Status
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAdAccounts.filter((a) => a.syncStatus === "SUCCESS").length}/{connectedAccounts.length}
            </div>
            <p className="text-xs text-muted-foreground">Accounts synced</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Ad Accounts</CardTitle>
              <CardDescription>
                View and manage your connected ad accounts
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="META">Meta</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="SNAPCHAT">Snapchat</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search accounts..."
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
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spend (MTD)</TableHead>
                <TableHead>Budget Limit</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <div className="font-medium">{account.accountName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {account.accountId}
                          {account.isAgencyAccount && (
                            <Badge variant="outline" className="text-xs">
                              Agency
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.connected ? (
                      getSyncStatusBadge(account.syncStatus, account.syncError)
                    ) : (
                      <Badge variant="outline">
                        <Unlink className="mr-1 h-3 w-3" />
                        Disconnected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.currentSpend > 0 ? (
                      <div>
                        <div className="font-medium">{formatCurrency(account.currentSpend)}</div>
                        {account.monthlyBudgetLimit && (
                          <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                            <div
                              className={`h-full rounded-full ${
                                (account.currentSpend / account.monthlyBudgetLimit) > 0.9
                                  ? "bg-red-500"
                                  : (account.currentSpend / account.monthlyBudgetLimit) > 0.7
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (account.currentSpend / account.monthlyBudgetLimit) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.monthlyBudgetLimit ? (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(account.monthlyBudgetLimit)}/mo
                        </div>
                        {account.dailyBudgetLimit && (
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(account.dailyBudgetLimit)}/day
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No limit</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.activeCampaigns > 0 ? (
                      <Badge variant="secondary">{account.activeCampaigns} active</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastSync(account.lastSyncAt)}
                    </div>
                  </TableCell>
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
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {account.connected ? (
                          <DropdownMenuItem className="text-orange-600">
                            <Unlink className="mr-2 h-4 w-4" />
                            Disconnect
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <Link2 className="mr-2 h-4 w-4" />
                            Reconnect
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
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
