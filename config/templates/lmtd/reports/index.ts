/**
 * LMTD Report Widget Templates
 *
 * Pre-configured report and analytics widgets extracted from TeamLMTD.
 */

import type { DashboardWidgetTemplate } from "../../types";

// ============================================
// TEAM METRICS
// ============================================

export const teamUtilizationWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-team-utilization-v1",
    name: "Team Utilization Report",
    description: "Shows billable vs non-billable hours breakdown for the team",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["team", "utilization", "time-tracking", "report"],
    icon: "Users",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["timeEntries", "users"],
  },
  data: {
    name: "Team Utilization",
    type: "chart",
    size: "large",
    dataSource: {
      resource: "timeEntries",
      aggregation: "sum",
      groupBy: "userId",
      query: {
        dateRange: "thisMonth",
      },
    },
    display: {
      title: "Team Utilization",
      icon: "Users",
      color: "#52EDC7",
      chart: {
        type: "bar",
        xAxis: "userName",
        yAxis: "hours",
      },
    },
    refresh: 300,
  },
};

export const departmentWorkloadWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-dept-workload-v1",
    name: "Department Workload",
    description: "Active briefs distribution across departments",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["department", "workload", "briefs", "report"],
    icon: "BarChart",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    name: "Department Workload",
    type: "chart",
    size: "medium",
    dataSource: {
      resource: "briefs",
      aggregation: "count",
      groupBy: "department",
      query: {
        status: { in: ["IN_PROGRESS", "IN_REVIEW"] },
      },
    },
    display: {
      title: "Workload by Department",
      icon: "BarChart",
      color: "#7B61FF",
      chart: {
        type: "donut",
      },
    },
    refresh: 600,
  },
};

// ============================================
// CLIENT METRICS
// ============================================

export const clientRevenueWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-client-revenue-v1",
    name: "Client Revenue Breakdown",
    description: "Revenue distribution across clients",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["client", "revenue", "financial", "report"],
    icon: "DollarSign",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["clients", "briefs", "timeEntries"],
  },
  data: {
    name: "Client Revenue",
    type: "chart",
    size: "large",
    dataSource: {
      resource: "timeEntries",
      aggregation: "sum",
      groupBy: "clientId",
      query: {
        dateRange: "thisQuarter",
        billable: true,
      },
    },
    display: {
      title: "Revenue by Client",
      icon: "DollarSign",
      color: "#52EDC7",
      format: "currency",
      chart: {
        type: "pie",
      },
    },
    refresh: 900,
  },
};

export const retainerHealthWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-retainer-health-v1",
    name: "Retainer Health",
    description: "Monthly retainer utilization vs allocation",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["retainer", "client", "utilization", "report"],
    icon: "Gauge",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["clients", "timeEntries"],
  },
  data: {
    name: "Retainer Health",
    type: "table",
    size: "large",
    dataSource: {
      resource: "clients",
      query: {
        hasRetainer: true,
      },
    },
    display: {
      title: "Retainer Health Overview",
      icon: "Gauge",
      color: "#1BA098",
    },
    refresh: 600,
  },
};

// ============================================
// BRIEF METRICS
// ============================================

export const briefTurnaroundWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-brief-turnaround-v1",
    name: "Brief Turnaround Time",
    description: "Average time from submission to completion by brief type",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "turnaround", "performance", "report"],
    icon: "Timer",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs"],
  },
  data: {
    name: "Brief Turnaround",
    type: "chart",
    size: "medium",
    dataSource: {
      resource: "briefs",
      aggregation: "avg",
      groupBy: "type",
      query: {
        status: "COMPLETED",
        dateRange: "last30days",
      },
    },
    display: {
      title: "Avg Turnaround by Brief Type",
      icon: "Timer",
      color: "#7B61FF",
      format: "days",
      chart: {
        type: "bar",
        xAxis: "briefType",
        yAxis: "avgDays",
      },
    },
    refresh: 1800,
  },
};

export const briefStatusDistributionWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-brief-status-v1",
    name: "Brief Status Distribution",
    description: "Current brief counts by status",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "status", "overview", "report"],
    icon: "PieChart",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs"],
  },
  data: {
    name: "Brief Status",
    type: "chart",
    size: "medium",
    dataSource: {
      resource: "briefs",
      aggregation: "count",
      groupBy: "status",
    },
    display: {
      title: "Briefs by Status",
      icon: "PieChart",
      color: "#52EDC7",
      chart: {
        type: "donut",
      },
    },
    refresh: 300,
  },
};

// ============================================
// RFP/SALES METRICS
// ============================================

export const pipelineValueWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-pipeline-value-v1",
    name: "Pipeline Value",
    description: "Total potential value in RFP pipeline by stage",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["rfp", "pipeline", "sales", "report"],
    icon: "TrendingUp",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["rfps"],
  },
  data: {
    name: "Pipeline Value",
    type: "chart",
    size: "large",
    dataSource: {
      resource: "rfps",
      aggregation: "sum",
      groupBy: "status",
      query: {
        status: { notIn: ["WON", "LOST", "ABANDONED"] },
      },
    },
    display: {
      title: "Pipeline Value by Stage",
      icon: "TrendingUp",
      color: "#52EDC7",
      format: "currency",
      chart: {
        type: "bar",
        xAxis: "status",
        yAxis: "totalValue",
      },
    },
    refresh: 600,
  },
};

export const winRateWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-win-rate-v1",
    name: "Win Rate Metric",
    description: "RFP win rate over time",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["rfp", "win-rate", "sales", "metric"],
    icon: "Target",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["rfps"],
  },
  data: {
    name: "Win Rate",
    type: "metric",
    size: "small",
    dataSource: {
      resource: "rfps",
      query: {
        status: { in: ["WON", "LOST"] },
        dateRange: "thisYear",
      },
    },
    display: {
      title: "Win Rate",
      icon: "Target",
      color: "#52EDC7",
      format: "percent",
    },
    refresh: 3600,
  },
};

// ============================================
// NPS/FEEDBACK METRICS
// ============================================

export const npsOverTimeWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-nps-trend-v1",
    name: "NPS Trend",
    description: "Net Promoter Score trend over time",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["nps", "client-health", "trend", "report"],
    icon: "TrendingUp",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["npsResponses"],
  },
  data: {
    name: "NPS Trend",
    type: "chart",
    size: "large",
    dataSource: {
      resource: "npsResponses",
      aggregation: "avg",
      groupBy: "month",
      query: {
        dateRange: "last12months",
      },
    },
    display: {
      title: "NPS Score Over Time",
      icon: "TrendingUp",
      color: "#52EDC7",
      chart: {
        type: "line",
        xAxis: "month",
        yAxis: "score",
      },
    },
    refresh: 3600,
  },
};

export const clientSatisfactionWidget: DashboardWidgetTemplate = {
  category: "dashboard",
  metadata: {
    id: "lmtd-client-satisfaction-v1",
    name: "Client Satisfaction",
    description: "Satisfaction scores by client",
    category: "dashboard",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["satisfaction", "client", "feedback", "report"],
    icon: "Heart",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["npsResponses", "clients"],
  },
  data: {
    name: "Client Satisfaction",
    type: "table",
    size: "medium",
    dataSource: {
      resource: "npsResponses",
      aggregation: "avg",
      groupBy: "clientId",
      query: {
        dateRange: "last90days",
      },
    },
    display: {
      title: "Satisfaction by Client",
      icon: "Heart",
      color: "#7B61FF",
    },
    refresh: 1800,
  },
};

// ============================================
// REGISTRY EXPORT
// ============================================

export const lmtdReportWidgets: DashboardWidgetTemplate[] = [
  // Team metrics
  teamUtilizationWidget,
  departmentWorkloadWidget,
  // Client metrics
  clientRevenueWidget,
  retainerHealthWidget,
  // Brief metrics
  briefTurnaroundWidget,
  briefStatusDistributionWidget,
  // RFP/Sales metrics
  pipelineValueWidget,
  winRateWidget,
  // NPS/Feedback metrics
  npsOverTimeWidget,
  clientSatisfactionWidget,
];

export function getReportWidgetById(id: string): DashboardWidgetTemplate | undefined {
  return lmtdReportWidgets.find((w) => w.metadata.id === id);
}

export function getReportWidgetsByTag(tag: string): DashboardWidgetTemplate[] {
  return lmtdReportWidgets.filter((w) => w.metadata.tags.includes(tag));
}

export default lmtdReportWidgets;
