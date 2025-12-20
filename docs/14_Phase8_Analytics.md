# Phase 8: Reporting & Analytics - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Phases 5, 6, 7

---

## Overview

Analytics and reporting provide visibility into agency operations - utilization, profitability, efficiency, and trends. Designed for different stakeholder views.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DATA SOURCES              PROCESSING              DELIVERY                  │
│                                                                              │
│  ┌─────────────┐          ┌─────────────┐        ┌─────────────┐            │
│  │ Briefs      │──┐       │             │        │ Dashboards  │            │
│  └─────────────┘  │       │ Aggregation │   ┌───▶│ (Real-time) │            │
│                   │       │ Engine      │   │    └─────────────┘            │
│  ┌─────────────┐  │       │             │   │                               │
│  │ Time Entries│──┼──────▶│ • Daily     │───┤    ┌─────────────┐            │
│  └─────────────┘  │       │ • Weekly    │   │    │ Reports     │            │
│                   │       │ • Monthly   │   ├───▶│ (Scheduled) │            │
│  ┌─────────────┐  │       │             │   │    └─────────────┘            │
│  │ Clients     │──┤       └─────────────┘   │                               │
│  └─────────────┘  │                         │    ┌─────────────┐            │
│                   │       ┌─────────────┐   │    │ Exports     │            │
│  ┌─────────────┐  │       │ Cache       │   └───▶│ (On-demand) │            │
│  │ Pipeline    │──┘       │ (Redis/KV)  │        └─────────────┘            │
│  └─────────────┘          └─────────────┘                                   │
│                                                                              │
│  STAKEHOLDER VIEWS                                                           │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Leadership  │  │ Team Lead   │  │ Account Mgr │  │ Individual  │        │
│  │             │  │             │  │             │  │             │        │
│  │ • Revenue   │  │ • Team      │  │ • Client    │  │ • My time   │        │
│  │ • Pipeline  │  │   capacity  │  │   reports   │  │ • My briefs │        │
│  │ • Margins   │  │ • Workload  │  │ • Hours     │  │ • My stats  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
// Pre-aggregated metrics for fast queries
model DailyMetrics {
  id              String   @id @default(cuid())
  organizationId  String
  date            DateTime @db.Date

  // Dimensions
  userId          String?
  clientId        String?
  departmentId    String?
  briefType       String?

  // Time metrics
  hoursLogged     Decimal  @default(0) @db.Decimal(8, 2)
  hoursBillable   Decimal  @default(0) @db.Decimal(8, 2)
  hoursNonBillable Decimal @default(0) @db.Decimal(8, 2)

  // Brief metrics
  briefsCreated   Int      @default(0)
  briefsCompleted Int      @default(0)
  briefsOverdue   Int      @default(0)

  // Revenue metrics (if applicable)
  revenue         Decimal? @db.Decimal(12, 2)
  cost            Decimal? @db.Decimal(12, 2)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, date, userId, clientId, departmentId, briefType])
  @@index([organizationId, date])
  @@index([userId, date])
  @@index([clientId, date])
  @@map("daily_metrics")
}

// Saved report configurations
model Report {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?
  type            ReportType

  // Configuration
  config          Json     // Filters, groupings, columns, date range
  // Structure:
  // {
  //   dateRange: { type: 'last_30_days' | 'this_month' | 'custom', start?: Date, end?: Date },
  //   filters: { clientIds?: string[], userIds?: string[], departments?: string[] },
  //   groupBy: string[],  // ['client', 'user', 'briefType']
  //   metrics: string[],  // ['hours', 'briefs', 'utilization']
  //   sortBy: string,
  //   sortOrder: 'asc' | 'desc',
  // }

  // Scheduling
  schedule        String?  // Cron expression
  recipients      String[] // Email addresses
  format          String   @default("pdf")  // pdf, excel, csv
  lastRunAt       DateTime?
  nextRunAt       DateTime?

  // Ownership
  createdById     String
  isPublic        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  createdBy       User     @relation(fields: [createdById], references: [id])

  @@index([organizationId])
  @@map("reports")
}

enum ReportType {
  // Time reports
  TIMESHEET_SUMMARY
  UTILIZATION
  BILLABLE_VS_NONBILLABLE

  // Brief reports
  BRIEF_STATUS
  BRIEF_TURNAROUND
  BRIEF_BY_TYPE
  BRIEF_BY_CLIENT

  // Client reports
  CLIENT_ACTIVITY
  CLIENT_HOURS
  CLIENT_PROFITABILITY

  // Pipeline reports
  PIPELINE_SUMMARY
  WIN_LOSS_ANALYSIS
  FORECAST

  // Team reports
  TEAM_CAPACITY
  TEAM_WORKLOAD
  INDIVIDUAL_PERFORMANCE

  // Custom
  CUSTOM
}

// Dashboard widget configurations (per-user)
model DashboardWidget {
  id              String   @id @default(cuid())
  userId          String

  widgetType      String   // 'utilization', 'briefs_by_status', etc.
  position        Json     // { x: 0, y: 0, w: 2, h: 1 }
  config          Json     // Widget-specific configuration

  @@index([userId])
  @@map("dashboard_widgets")
}
```

---

## Analytics Queries

```typescript
// src/modules/analytics/queries/index.ts

import { db } from '@/lib/db';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

// ============================================
// UTILIZATION METRICS
// ============================================

interface UtilizationResult {
  userId: string;
  userName: string;
  department: string;
  capacity: number;     // Weekly hours
  logged: number;       // Total logged
  billable: number;     // Billable logged
  utilization: number;  // Percentage (billable / capacity)
}

export async function getTeamUtilization(options: {
  organizationId: string;
  dateRange: { start: Date; end: Date };
  departmentId?: string;
  userId?: string;
}): Promise<UtilizationResult[]> {
  const { organizationId, dateRange, departmentId, userId } = options;

  // Get users and their capacity
  const users = await db.user.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(departmentId && { department: departmentId }),
      ...(userId && { id: userId }),
      permissionLevel: { notIn: ['CLIENT'] },
    },
    select: {
      id: true,
      name: true,
      department: true,
      weeklyCapacity: true,
    },
  });

  // Get time entries for date range
  const timeEntries = await db.timeEntry.groupBy({
    by: ['userId'],
    where: {
      organizationId,
      date: { gte: dateRange.start, lte: dateRange.end },
      userId: { in: users.map((u) => u.id) },
    },
    _sum: {
      hours: true,
    },
  });

  // Get billable time entries
  const billableEntries = await db.timeEntry.groupBy({
    by: ['userId'],
    where: {
      organizationId,
      date: { gte: dateRange.start, lte: dateRange.end },
      userId: { in: users.map((u) => u.id) },
      isBillable: true,
    },
    _sum: {
      hours: true,
    },
  });

  // Calculate weeks in range
  const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = Math.max(1, days / 7);

  // Build results
  const timeMap = new Map(timeEntries.map((t) => [t.userId, Number(t._sum.hours) || 0]));
  const billableMap = new Map(billableEntries.map((t) => [t.userId, Number(t._sum.hours) || 0]));

  return users.map((user) => {
    const capacity = user.weeklyCapacity * weeks;
    const logged = timeMap.get(user.id) || 0;
    const billable = billableMap.get(user.id) || 0;
    const utilization = capacity > 0 ? Math.round((billable / capacity) * 100) : 0;

    return {
      userId: user.id,
      userName: user.name,
      department: user.department,
      capacity,
      logged,
      billable,
      utilization,
    };
  });
}

// ============================================
// BRIEF METRICS
// ============================================

interface BriefMetrics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  completed: number;
  inProgress: number;
  overdue: number;
  avgTurnaroundDays: number;
}

export async function getBriefMetrics(options: {
  organizationId: string;
  dateRange: { start: Date; end: Date };
  clientId?: string;
  userId?: string;
}): Promise<BriefMetrics> {
  const { organizationId, dateRange, clientId, userId } = options;

  const where: Prisma.BriefWhereInput = {
    organizationId,
    createdAt: { gte: dateRange.start, lte: dateRange.end },
    ...(clientId && { clientId }),
    ...(userId && { assigneeId: userId }),
  };

  // Get totals by status
  const statusCounts = await db.brief.groupBy({
    by: ['status'],
    where,
    _count: { id: true },
  });

  // Get totals by type
  const typeCounts = await db.brief.groupBy({
    by: ['type'],
    where,
    _count: { id: true },
  });

  // Count overdue
  const overdueCount = await db.brief.count({
    where: {
      ...where,
      deadline: { lt: new Date() },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
    },
  });

  // Calculate average turnaround
  const completedBriefs = await db.brief.findMany({
    where: {
      ...where,
      status: 'COMPLETED',
      completedAt: { not: null },
    },
    select: {
      createdAt: true,
      completedAt: true,
    },
  });

  const turnaroundDays = completedBriefs.map((b) =>
    Math.ceil((b.completedAt!.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avgTurnaroundDays = turnaroundDays.length > 0
    ? Math.round(turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length)
    : 0;

  const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id]));
  const byType = Object.fromEntries(typeCounts.map((t) => [t.type, t._count.id]));

  return {
    total: statusCounts.reduce((sum, s) => sum + s._count.id, 0),
    byStatus,
    byType,
    completed: byStatus['COMPLETED'] || 0,
    inProgress: (byStatus['IN_PROGRESS'] || 0) + (byStatus['IN_REVIEW'] || 0),
    overdue: overdueCount,
    avgTurnaroundDays,
  };
}

// ============================================
// CLIENT METRICS
// ============================================

interface ClientMetrics {
  clientId: string;
  clientName: string;
  hoursLogged: number;
  hoursBillable: number;
  briefCount: number;
  briefsCompleted: number;
  activeProjects: number;
  revenue?: number;
  margin?: number;
}

export async function getClientMetrics(options: {
  organizationId: string;
  dateRange: { start: Date; end: Date };
  clientId?: string;
}): Promise<ClientMetrics[]> {
  const { organizationId, dateRange, clientId } = options;

  // Get clients
  const clients = await db.client.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(clientId && { id: clientId }),
    },
    select: {
      id: true,
      name: true,
    },
  });

  const results: ClientMetrics[] = [];

  for (const client of clients) {
    // Get time entries
    const timeAgg = await db.timeEntry.aggregate({
      where: {
        organizationId,
        brief: { clientId: client.id },
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { hours: true },
    });

    const billableAgg = await db.timeEntry.aggregate({
      where: {
        organizationId,
        brief: { clientId: client.id },
        date: { gte: dateRange.start, lte: dateRange.end },
        isBillable: true,
      },
      _sum: { hours: true },
    });

    // Get brief counts
    const briefCounts = await db.brief.groupBy({
      by: ['status'],
      where: {
        organizationId,
        clientId: client.id,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _count: { id: true },
    });

    // Get active projects
    const activeProjects = await db.project.count({
      where: {
        organizationId,
        clientId: client.id,
        status: 'ACTIVE',
      },
    });

    results.push({
      clientId: client.id,
      clientName: client.name,
      hoursLogged: Number(timeAgg._sum.hours) || 0,
      hoursBillable: Number(billableAgg._sum.hours) || 0,
      briefCount: briefCounts.reduce((sum, b) => sum + b._count.id, 0),
      briefsCompleted: briefCounts.find((b) => b.status === 'COMPLETED')?._count.id || 0,
      activeProjects,
    });
  }

  return results;
}

// ============================================
// PIPELINE METRICS
// ============================================

interface PipelineMetrics {
  total: number;
  totalValue: number;
  weightedValue: number;
  byStage: { stage: string; count: number; value: number }[];
  winRate: number;
  avgDealSize: number;
}

export async function getPipelineMetrics(options: {
  organizationId: string;
  dateRange?: { start: Date; end: Date };
}): Promise<PipelineMetrics> {
  const { organizationId, dateRange } = options;

  const where: Prisma.RFPWhereInput = {
    organizationId,
    ...(dateRange && {
      createdAt: { gte: dateRange.start, lte: dateRange.end },
    }),
  };

  // Get RFPs by status
  const rfps = await db.rFP.findMany({
    where,
    select: {
      status: true,
      estimatedValue: true,
      winProbability: true,
      outcome: true,
    },
  });

  const byStage: Record<string, { count: number; value: number }> = {};
  let totalValue = 0;
  let weightedValue = 0;
  let wonCount = 0;
  let decidedCount = 0;

  for (const rfp of rfps) {
    const value = Number(rfp.estimatedValue) || 0;
    totalValue += value;

    // Probability weights
    const probWeight = rfp.winProbability === 'HIGH' ? 0.75 : rfp.winProbability === 'MEDIUM' ? 0.5 : 0.25;
    weightedValue += value * probWeight;

    // Stage aggregation
    if (!byStage[rfp.status]) {
      byStage[rfp.status] = { count: 0, value: 0 };
    }
    byStage[rfp.status].count++;
    byStage[rfp.status].value += value;

    // Win rate calculation
    if (rfp.outcome === 'WON') wonCount++;
    if (rfp.outcome) decidedCount++;
  }

  const winRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0;
  const avgDealSize = rfps.length > 0 ? Math.round(totalValue / rfps.length) : 0;

  return {
    total: rfps.length,
    totalValue,
    weightedValue: Math.round(weightedValue),
    byStage: Object.entries(byStage).map(([stage, data]) => ({
      stage,
      ...data,
    })),
    winRate,
    avgDealSize,
  };
}

// ============================================
// TIME SERIES DATA
// ============================================

interface TimeSeriesPoint {
  date: string;
  value: number;
}

export async function getTimeSeriesData(options: {
  organizationId: string;
  metric: 'hours' | 'briefs' | 'revenue';
  dateRange: { start: Date; end: Date };
  groupBy: 'day' | 'week' | 'month';
  filters?: {
    clientId?: string;
    userId?: string;
    department?: string;
  };
}): Promise<TimeSeriesPoint[]> {
  const { organizationId, metric, dateRange, groupBy, filters } = options;

  // Use pre-aggregated daily metrics for performance
  const dailyData = await db.dailyMetrics.findMany({
    where: {
      organizationId,
      date: { gte: dateRange.start, lte: dateRange.end },
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.department && { departmentId: filters.department }),
    },
    orderBy: { date: 'asc' },
  });

  // Aggregate by period
  const aggregated = new Map<string, number>();

  for (const row of dailyData) {
    const key = formatDateKey(row.date, groupBy);
    const value = metric === 'hours' ? Number(row.hoursLogged) :
                  metric === 'briefs' ? row.briefsCompleted :
                  Number(row.revenue) || 0;

    aggregated.set(key, (aggregated.get(key) || 0) + value);
  }

  return Array.from(aggregated.entries()).map(([date, value]) => ({
    date,
    value,
  }));
}

function formatDateKey(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      return weekStart.toISOString().split('T')[0];
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default:
      return date.toISOString().split('T')[0];
  }
}
```

---

## Dashboard Widgets

```typescript
// src/modules/analytics/widgets/registry.ts

import type { PermissionLevel } from '@prisma/client';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: string;  // Component path
  dataFetcher: string; // Query function name
  sizes: ('1x1' | '2x1' | '2x2' | '3x1' | '3x2')[];
  defaultSize: string;
  refreshInterval?: number;  // Minutes
  permissions: PermissionLevel[];
  defaultConfig?: Record<string, unknown>;
}

export const widgetRegistry: WidgetDefinition[] = [
  // Utilization widgets
  {
    id: 'team-utilization',
    name: 'Team Utilization',
    description: 'Billable hours vs capacity across team',
    component: 'widgets/TeamUtilizationWidget',
    dataFetcher: 'getTeamUtilization',
    sizes: ['2x1', '2x2', '3x2'],
    defaultSize: '2x2',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
  {
    id: 'my-utilization',
    name: 'My Utilization',
    description: 'Your personal utilization this week',
    component: 'widgets/MyUtilizationWidget',
    dataFetcher: 'getMyUtilization',
    sizes: ['1x1', '2x1'],
    defaultSize: '1x1',
    refreshInterval: 30,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD', 'STAFF', 'FREELANCER'],
  },

  // Brief widgets
  {
    id: 'briefs-by-status',
    name: 'Briefs by Status',
    description: 'Distribution of briefs across workflow stages',
    component: 'widgets/BriefsByStatusWidget',
    dataFetcher: 'getBriefMetrics',
    sizes: ['2x1', '2x2'],
    defaultSize: '2x1',
    refreshInterval: 15,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
  {
    id: 'my-briefs',
    name: 'My Briefs',
    description: 'Your assigned briefs and their status',
    component: 'widgets/MyBriefsWidget',
    dataFetcher: 'getMyBriefs',
    sizes: ['2x1', '2x2'],
    defaultSize: '2x1',
    refreshInterval: 10,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD', 'STAFF', 'FREELANCER'],
  },
  {
    id: 'overdue-briefs',
    name: 'Overdue Briefs',
    description: 'Briefs past their deadline',
    component: 'widgets/OverdueBriefsWidget',
    dataFetcher: 'getOverdueBriefs',
    sizes: ['2x1', '2x2'],
    defaultSize: '2x1',
    refreshInterval: 15,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },

  // Client widgets
  {
    id: 'client-hours',
    name: 'Hours by Client',
    description: 'Time distribution across clients',
    component: 'widgets/ClientHoursWidget',
    dataFetcher: 'getClientMetrics',
    sizes: ['2x2', '3x2'],
    defaultSize: '2x2',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP'],
  },
  {
    id: 'top-clients',
    name: 'Top Clients',
    description: 'Clients by hours or revenue',
    component: 'widgets/TopClientsWidget',
    dataFetcher: 'getClientMetrics',
    sizes: ['2x1', '2x2'],
    defaultSize: '2x1',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP'],
  },

  // Pipeline widgets
  {
    id: 'pipeline-value',
    name: 'Pipeline Value',
    description: 'Total and weighted pipeline value',
    component: 'widgets/PipelineValueWidget',
    dataFetcher: 'getPipelineMetrics',
    sizes: ['1x1', '2x1'],
    defaultSize: '2x1',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP'],
  },
  {
    id: 'pipeline-funnel',
    name: 'Pipeline Funnel',
    description: 'RFPs by stage',
    component: 'widgets/PipelineFunnelWidget',
    dataFetcher: 'getPipelineMetrics',
    sizes: ['2x2'],
    defaultSize: '2x2',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP'],
  },

  // Trend widgets
  {
    id: 'hours-trend',
    name: 'Hours Trend',
    description: 'Hours logged over time',
    component: 'widgets/HoursTrendWidget',
    dataFetcher: 'getTimeSeriesData',
    sizes: ['2x1', '3x1'],
    defaultSize: '3x1',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
  {
    id: 'briefs-trend',
    name: 'Briefs Trend',
    description: 'Brief completion over time',
    component: 'widgets/BriefsTrendWidget',
    dataFetcher: 'getTimeSeriesData',
    sizes: ['2x1', '3x1'],
    defaultSize: '3x1',
    refreshInterval: 60,
    permissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
];
```

---

## Report Generation

```typescript
// src/lib/reports/report-generator.ts

import { db } from '@/lib/db';
import * as queries from '@/modules/analytics/queries';
import { generatePDF } from './pdf-generator';
import { generateExcel } from './excel-generator';
import { sendEmail } from '@/lib/email';

interface ReportConfig {
  dateRange: {
    type: 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'this_quarter' | 'custom';
    start?: Date;
    end?: Date;
  };
  filters: {
    clientIds?: string[];
    userIds?: string[];
    departments?: string[];
    briefTypes?: string[];
  };
  groupBy?: string[];
  metrics?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ReportGenerator {
  async generate(
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<Buffer> {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { createdBy: true },
    });

    if (!report) throw new Error('Report not found');

    const config = report.config as ReportConfig;
    const dateRange = this.resolveDateRange(config.dateRange);

    // Fetch data based on report type
    const data = await this.fetchReportData(
      report.type,
      report.organizationId,
      dateRange,
      config
    );

    // Generate output
    switch (format) {
      case 'pdf':
        return generatePDF(report.name, data, report.type);
      case 'excel':
        return generateExcel(report.name, data, report.type);
      case 'csv':
        return this.generateCSV(data);
      default:
        throw new Error('Unknown format');
    }
  }

  async generateAndSend(reportId: string): Promise<void> {
    const report = await db.report.findUnique({
      where: { id: reportId },
    });

    if (!report || !report.recipients.length) return;

    const file = await this.generate(reportId, report.format as 'pdf' | 'excel' | 'csv');

    const extension = report.format === 'excel' ? 'xlsx' : report.format;
    const filename = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;

    await sendEmail({
      to: report.recipients,
      subject: `Report: ${report.name}`,
      template: 'scheduled-report',
      data: {
        reportName: report.name,
        generatedAt: new Date().toISOString(),
      },
      attachments: [
        {
          filename,
          content: file,
        },
      ],
    });

    // Update last run time
    await db.report.update({
      where: { id: reportId },
      data: {
        lastRunAt: new Date(),
        nextRunAt: report.schedule ? this.getNextRunTime(report.schedule) : null,
      },
    });
  }

  private async fetchReportData(
    type: string,
    organizationId: string,
    dateRange: { start: Date; end: Date },
    config: ReportConfig
  ): Promise<unknown> {
    switch (type) {
      case 'UTILIZATION':
        return queries.getTeamUtilization({
          organizationId,
          dateRange,
          departmentId: config.filters.departments?.[0],
        });

      case 'BRIEF_STATUS':
      case 'BRIEF_BY_TYPE':
        return queries.getBriefMetrics({
          organizationId,
          dateRange,
          clientId: config.filters.clientIds?.[0],
        });

      case 'CLIENT_HOURS':
      case 'CLIENT_PROFITABILITY':
        return queries.getClientMetrics({
          organizationId,
          dateRange,
          clientId: config.filters.clientIds?.[0],
        });

      case 'PIPELINE_SUMMARY':
        return queries.getPipelineMetrics({ organizationId, dateRange });

      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  private resolveDateRange(config: ReportConfig['dateRange']): { start: Date; end: Date } {
    const now = new Date();

    switch (config.type) {
      case 'last_7_days':
        return { start: subDays(now, 7), end: now };
      case 'last_30_days':
        return { start: subDays(now, 30), end: now };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'custom':
        return { start: config.start!, end: config.end! };
      default:
        return { start: subDays(now, 30), end: now };
    }
  }

  private generateCSV(data: unknown): Buffer {
    // Simple CSV generation
    if (!Array.isArray(data) || data.length === 0) {
      return Buffer.from('');
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    );

    return Buffer.from([headers.join(','), ...rows].join('\n'));
  }

  private getNextRunTime(cronExpression: string): Date {
    // Simple next run calculation
    // In production, use a library like cron-parser
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}

export const reportGenerator = new ReportGenerator();
```

---

## Implementation Checklist

### Phase 8.1: Data Layer
- [ ] Create DailyMetrics aggregation table
- [ ] Implement daily aggregation job
- [ ] Create Report and DashboardWidget models
- [ ] Implement core analytics queries

### Phase 8.2: Dashboard
- [ ] Build widget framework
- [ ] Implement 5-6 core widgets
- [ ] Add widget configuration UI
- [ ] Implement dashboard layout saving

### Phase 8.3: Reports
- [ ] Build report configuration UI
- [ ] Implement PDF generation
- [ ] Implement Excel export
- [ ] Add scheduled report jobs

### Phase 8.4: Visualization
- [ ] Add charts library (Recharts)
- [ ] Build time series charts
- [ ] Build comparison charts
- [ ] Add export/download options

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
