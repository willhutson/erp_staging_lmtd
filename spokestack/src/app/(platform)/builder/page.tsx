import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Grid3X3, LayoutDashboard, Plus, Eye, Settings } from "lucide-react";
import Link from "next/link";

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Builder</h1>
          <p className="text-muted-foreground">
            Create custom dashboards and client views
          </p>
        </div>
        <Button asChild>
          <Link href="/builder/dashboards/new">
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dashboards
            </CardTitle>
            <Grid3X3 className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Widgets
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              Across all dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client Instances
            </CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Active portals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <Palette className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-pink-500" />
              Dashboards
            </CardTitle>
            <CardDescription>
              Create and manage custom dashboards with drag-and-drop widgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/builder/dashboards">View Dashboards</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-blue-500" />
              Widget Library
            </CardTitle>
            <CardDescription>
              Browse available widgets: charts, KPIs, tables, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/builder/widgets">Browse Widgets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              Templates
            </CardTitle>
            <CardDescription>
              Start from pre-built templates for common use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/builder/templates">View Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Widget Type Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Widget Types</CardTitle>
          <CardDescription>
            25+ widget types available for building dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "KPI Card", icon: "📊" },
              { name: "Line Chart", icon: "📈" },
              { name: "Bar Chart", icon: "📊" },
              { name: "Pie Chart", icon: "🥧" },
              { name: "Data Table", icon: "📋" },
              { name: "Heatmap", icon: "🗺️" },
              { name: "Funnel", icon: "🔻" },
              { name: "Leaderboard", icon: "🏆" },
              { name: "Activity Feed", icon: "📰" },
              { name: "Spend Tracker", icon: "💰" },
              { name: "Creator Roster", icon: "⭐" },
              { name: "Platform Compare", icon: "🔄" },
            ].map((widget) => (
              <div
                key={widget.name}
                className="p-3 rounded-lg border bg-muted/50 text-center hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="text-2xl mb-1">{widget.icon}</div>
                <div className="text-xs font-medium">{widget.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
