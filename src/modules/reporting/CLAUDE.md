# Reporting Module

## Overview

The Reporting module provides comprehensive analytics and insights across all platform modules:
- Executive KPIs and dashboard
- Client performance reports
- Team productivity analytics
- Content metrics
- Retainer health tracking

## Architecture

```
/src/modules/reporting
├── actions/
│   └── analytics-actions.ts    # Server actions for data aggregation
└── CLAUDE.md                   # This file

/src/app/(dashboard)/reports
├── page.tsx                    # Executive dashboard
├── ReportsDashboardClient.tsx  # KPI cards and overview
├── clients/
│   ├── page.tsx               # Client reports list
│   └── ClientReportsClient.tsx
├── team/
│   ├── page.tsx               # Team productivity
│   └── TeamReportsClient.tsx
├── content/
│   ├── page.tsx               # Content metrics
│   └── ContentReportsClient.tsx
└── retainers/
    ├── page.tsx               # Retainer health
    └── RetainerReportsClient.tsx
```

## Data Types

### ExecutiveKPIs
High-level metrics for the executive dashboard:
- Brief statistics (total, completed, in-progress, completion rate)
- Time statistics (hours logged, billable, utilization)
- Client metrics (active, at-risk, NPS score)
- Content metrics (published, scheduled, approval time)

### ClientReport
Per-client performance summary:
- Brief breakdown by status and type
- Hours logged and by department
- Retainer usage and burn rate
- Content volume and status
- Health indicators (NPS, open issues)

### TeamProductivity
Individual team member metrics:
- Hours logged and billable
- Utilization rate
- Briefs assigned and completed
- Current workload and capacity

### ContentMetrics
Content publishing analytics:
- Volume by platform, type, client
- Pipeline status distribution
- Performance rates (approval time, revision rate, success rate)

### RetainerHealth
Retainer client health tracking:
- Monthly allocation vs usage
- Burn rate and projections
- Usage trends (up/down/stable)
- Scope changes and additional hours
- Status (healthy/warning/critical)

## Usage Examples

### Get Executive KPIs

```typescript
import { getExecutiveKPIs } from "@/modules/reporting/actions/analytics-actions";

const kpis = await getExecutiveKPIs(organizationId, {
  from: new Date("2024-01-01"),
  to: new Date("2024-01-31"),
});

console.log(kpis.briefCompletionRate); // 85.5
console.log(kpis.utilizationRate);     // 72.3
```

### Get Client Reports

```typescript
import {
  getClientReport,
  getAllClientReports
} from "@/modules/reporting/actions/analytics-actions";

// Single client
const report = await getClientReport("client-id", { from, to });

// All clients
const reports = await getAllClientReports(organizationId, { from, to });
```

### Get Team Productivity

```typescript
import { getTeamProductivity } from "@/modules/reporting/actions/analytics-actions";

const productivity = await getTeamProductivity(organizationId, { from, to });

// Find overloaded team members
const overloaded = productivity.filter(p => p.loadPercentage > 100);
```

### Get Retainer Health

```typescript
import { getRetainerHealth } from "@/modules/reporting/actions/analytics-actions";

const health = await getRetainerHealth(organizationId);

// Find critical retainers
const critical = health.filter(h => h.status === "critical");
```

## Access Control

Reports are restricted to:
- ADMIN
- LEADERSHIP

Implemented via session check in each page:
```typescript
if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
  redirect("/dashboard");
}
```

## Date Ranges

All report functions accept an optional `DateRange`:

```typescript
interface DateRange {
  from: Date;
  to: Date;
}
```

If not provided, defaults to current month:
- `from`: First day of current month
- `to`: Current date

## Calculated Metrics

### Burn Rate
```
burnRate = (hoursUsed / monthlyAllocation) * 100
```

Status thresholds:
- **Healthy**: < 80%
- **Warning**: 80-100%
- **Critical**: > 100%

### Utilization Rate
```
utilizationRate = (hoursLogged / availableCapacity) * 100
```

Where `availableCapacity = weeklyCapacity × weeksInPeriod`

### Projected Overage
```
dailyRate = hoursUsed / daysElapsed
projectedTotal = dailyRate × totalDaysInMonth
projectedOverage = max(0, projectedTotal - monthlyAllocation)
```

### Usage Trend
Compares current month to previous month:
- **Up**: ratio > 1.1
- **Down**: ratio < 0.9
- **Stable**: 0.9 ≤ ratio ≤ 1.1

## Performance Considerations

- Reports use parallel queries where possible (`Promise.all`)
- Raw SQL used for complex aggregations (platform unnesting, time calculations)
- Pagination not currently implemented for reports (designed for executive summaries)
- Consider caching for frequently accessed reports

## Future Enhancements

1. **Export Functionality**
   - CSV export for all reports
   - PDF generation for client reports
   - Scheduled email reports

2. **Custom Date Ranges**
   - Date picker UI for custom ranges
   - Preset ranges (this week, last quarter, YTD)

3. **Trend Analysis**
   - Historical comparisons
   - Growth metrics
   - Forecasting

4. **Additional Metrics**
   - Revenue tracking
   - Profitability by client
   - Cost center analysis

5. **Visualizations**
   - Charts and graphs (using Recharts or similar)
   - Interactive dashboards
   - Real-time updates
