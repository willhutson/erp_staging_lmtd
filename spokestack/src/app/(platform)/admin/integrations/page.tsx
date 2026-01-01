"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plug,
  Search,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  Database,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Zap
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Integration categories
const categories = [
  { id: "all", name: "All" },
  { id: "social", name: "Social Platforms" },
  { id: "advertising", name: "Advertising" },
  { id: "analytics", name: "Analytics" },
  { id: "communication", name: "Communication" },
  { id: "productivity", name: "Productivity" },
];

// Mock integrations
const mockIntegrations = [
  // Phyllo - Creator data aggregation
  {
    id: "phyllo",
    name: "Phyllo",
    description: "Connect creator accounts across Instagram, TikTok, YouTube, and more to track performance metrics",
    category: "social",
    icon: Users,
    status: "disconnected",
    isRequired: true,
    features: ["Creator profile sync", "Content performance", "Audience demographics", "Engagement tracking"],
    docsUrl: "https://docs.getphyllo.com",
  },
  // BigQuery - Data warehouse
  {
    id: "bigquery",
    name: "Google BigQuery",
    description: "Connect your data warehouse for advanced analytics and custom reporting",
    category: "analytics",
    icon: Database,
    status: "disconnected",
    isRequired: true,
    features: ["Custom queries", "Data warehouse sync", "Advanced analytics", "Export reports"],
    docsUrl: "https://cloud.google.com/bigquery/docs",
  },
  // Meta
  {
    id: "meta",
    name: "Meta Business Suite",
    description: "Connect Facebook and Instagram ad accounts for campaign management",
    category: "advertising",
    icon: DollarSign,
    status: "connected",
    lastSync: "2024-12-28T10:30:00Z",
    accountCount: 3,
    features: ["Ad campaign sync", "Audience insights", "Creative management", "Performance tracking"],
    docsUrl: "https://developers.facebook.com/docs",
  },
  // Google Ads
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Manage Google Ads campaigns and track performance",
    category: "advertising",
    icon: BarChart3,
    status: "connected",
    lastSync: "2024-12-28T09:45:00Z",
    accountCount: 2,
    features: ["Campaign management", "Keyword tracking", "Conversion sync", "Budget optimization"],
    docsUrl: "https://developers.google.com/google-ads/api",
  },
  // TikTok Ads
  {
    id: "tiktok-ads",
    name: "TikTok for Business",
    description: "Connect TikTok ad accounts for campaign management and reporting",
    category: "advertising",
    icon: DollarSign,
    status: "error",
    error: "Token expired - reauthorization required",
    lastSync: "2024-12-25T14:00:00Z",
    accountCount: 1,
    features: ["Ad campaign sync", "Audience targeting", "Creative insights", "Performance metrics"],
    docsUrl: "https://ads.tiktok.com/marketing_api",
  },
  // Slack
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and reports to Slack channels",
    category: "communication",
    icon: MessageSquare,
    status: "connected",
    lastSync: "2024-12-28T11:00:00Z",
    features: ["Campaign alerts", "Performance summaries", "Daily digests", "Team notifications"],
    docsUrl: "https://api.slack.com",
  },
  // Google Analytics
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description: "Import website analytics data for holistic reporting",
    category: "analytics",
    icon: BarChart3,
    status: "disconnected",
    features: ["Website traffic", "Conversion tracking", "User behavior", "Attribution"],
    docsUrl: "https://developers.google.com/analytics",
  },
  // Google Calendar
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync campaign schedules and content calendars",
    category: "productivity",
    icon: Calendar,
    status: "disconnected",
    features: ["Campaign scheduling", "Content calendar", "Team availability", "Deadline reminders"],
    docsUrl: "https://developers.google.com/calendar",
  },
  // Google Drive
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Access and attach files from Google Drive",
    category: "productivity",
    icon: FileText,
    status: "disconnected",
    features: ["File attachments", "Report exports", "Asset library", "Shared folders"],
    docsUrl: "https://developers.google.com/drive",
  },
  // Zapier
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5000+ apps with automated workflows",
    category: "productivity",
    icon: Zap,
    status: "disconnected",
    features: ["Custom automations", "App connections", "Workflow triggers", "Data sync"],
    docsUrl: "https://zapier.com/developer",
  },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof mockIntegrations[0] | null>(null);

  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = mockIntegrations.filter((i) => i.status === "connected").length;
  const errorCount = mockIntegrations.filter((i) => i.status === "error").length;

  const getStatusBadge = (status: string, error?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const openConfigDialog = (integration: typeof mockIntegrations[0]) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect external services to sync data and automate workflows
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Integrations
            </CardTitle>
            <Plug className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockIntegrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Required Setup
            </CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockIntegrations.filter((i) => i.isRequired && i.status === "disconnected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Setup Alert */}
      {mockIntegrations.some((i) => i.isRequired && i.status === "disconnected") && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Required Integrations Need Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The following integrations are required for full platform functionality:
            </p>
            <div className="flex flex-wrap gap-2">
              {mockIntegrations
                .filter((i) => i.isRequired && i.status === "disconnected")
                .map((integration) => (
                  <Button
                    key={integration.id}
                    variant="outline"
                    size="sm"
                    onClick={() => openConfigDialog(integration)}
                  >
                    <integration.icon className="mr-2 h-4 w-4" />
                    Setup {integration.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs and Search */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search integrations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className={`hover:shadow-md transition-shadow ${
                  integration.status === "error" ? "border-destructive/50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <integration.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {integration.name}
                          {integration.isRequired && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </CardTitle>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    {integration.description}
                  </CardDescription>

                  {integration.status === "error" && integration.error && (
                    <div className="text-sm text-destructive mb-3 p-2 bg-destructive/10 rounded">
                      {integration.error}
                    </div>
                  )}

                  {integration.lastSync && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      Last synced: {formatLastSync(integration.lastSync)}
                      {integration.accountCount && (
                        <span className="ml-2">
                          • {integration.accountCount} account{integration.accountCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {integration.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openConfigDialog(integration)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </>
                    ) : integration.status === "error" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => openConfigDialog(integration)}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Fix Connection
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => openConfigDialog(integration)}
                      >
                        <Plug className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && (
                <>
                  <selectedIntegration.icon className="h-5 w-5" />
                  {selectedIntegration.status === "connected" ? "Configure" : "Connect"} {selectedIntegration.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.status === "connected"
                ? "Manage your integration settings and connected accounts."
                : "Enter your credentials to connect this integration."}
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration?.id === "phyllo" && (
            <PhylloConfigForm />
          )}

          {selectedIntegration?.id === "bigquery" && (
            <BigQueryConfigForm />
          )}

          {selectedIntegration?.id !== "phyllo" && selectedIntegration?.id !== "bigquery" && (
            <div className="py-4">
              <div className="grid gap-4">
                {selectedIntegration?.status === "connected" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sync Enabled</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data every hour
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive alerts for sync issues
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      Disconnect Integration
                    </Button>
                  </>
                ) : (
                  <Button className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect with OAuth
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            {selectedIntegration?.status !== "connected" && (
              <Button onClick={() => setConfigDialogOpen(false)}>
                Save & Connect
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhylloConfigForm() {
  return (
    <div className="grid gap-4 py-4">
      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium mb-2">What is Phyllo?</p>
        <p className="text-muted-foreground">
          Phyllo provides a unified API to connect and access data from creator platforms like
          Instagram, TikTok, YouTube, and 100+ more. This enables real-time creator analytics
          and audience insights.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phyllo-client-id">Client ID</Label>
        <Input id="phyllo-client-id" placeholder="Enter your Phyllo Client ID" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phyllo-client-secret">Client Secret</Label>
        <Input id="phyllo-client-secret" type="password" placeholder="Enter your Phyllo Client Secret" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phyllo-env">Environment</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="phyllo-env" value="sandbox" defaultChecked />
            <span className="text-sm">Sandbox</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="phyllo-env" value="production" />
            <span className="text-sm">Production</span>
          </label>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Get your API credentials from the{" "}
        <a href="https://dashboard.getphyllo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Phyllo Dashboard
        </a>
      </div>
    </div>
  );
}

function BigQueryConfigForm() {
  return (
    <div className="grid gap-4 py-4">
      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium mb-2">What is BigQuery?</p>
        <p className="text-muted-foreground">
          Google BigQuery is a serverless data warehouse that enables you to store and query
          large datasets. Connect BigQuery to enable advanced analytics and custom reporting.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bq-project">Project ID</Label>
        <Input id="bq-project" placeholder="your-gcp-project-id" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bq-dataset">Dataset ID</Label>
        <Input id="bq-dataset" placeholder="spokestack_data" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bq-credentials">Service Account JSON</Label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drop your service account JSON file here
          </p>
          <Button variant="outline" size="sm">
            Browse Files
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Create a service account with BigQuery access in the{" "}
        <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Google Cloud Console
        </a>
      </div>
    </div>
  );
}
