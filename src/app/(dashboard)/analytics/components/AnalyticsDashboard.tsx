"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { InternalDashboard } from "./InternalDashboard";
import { ExternalDashboard } from "./ExternalDashboard";
import { GraphDashboard } from "./GraphDashboard";

interface AnalyticsDashboardProps {
  organizationId: string;
  userLevel: string;
}

type DateRangePreset = "7d" | "30d" | "90d" | "year" | "custom";

export function AnalyticsDashboard({
  organizationId,
  userLevel,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("internal");
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }

    return { start, end };
  };

  const isAdmin = userLevel === "ADMIN" || userLevel === "LEADERSHIP";

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="internal">Internal</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="graph">Relationships</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as DateRangePreset)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="min-h-[600px]">
        {activeTab === "internal" && (
          <InternalDashboard
            organizationId={organizationId}
            dateRange={getDateRange()}
          />
        )}
        {activeTab === "external" && (
          <ExternalDashboard
            organizationId={organizationId}
            dateRange={getDateRange()}
          />
        )}
        {activeTab === "graph" && isAdmin && (
          <GraphDashboard organizationId={organizationId} />
        )}
      </div>
    </div>
  );
}
