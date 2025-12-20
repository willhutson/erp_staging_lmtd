"use server";

import { internalAnalytics } from "@/lib/analytics/internal";
import { externalAnalytics } from "@/lib/analytics/external";
import { neo4jService } from "@/lib/analytics/neo4j";
import { db } from "@/lib/db";

interface DateRange {
  start: Date;
  end: Date;
}

// Internal Analytics Actions

export async function getInternalAnalytics(
  organizationId: string,
  dateRange: DateRange
) {
  const [overview, teamPerformance, departments, throughput, heatmap] =
    await Promise.all([
      internalAnalytics.getOverviewMetrics(organizationId, dateRange),
      internalAnalytics.getTeamPerformance(organizationId, dateRange),
      internalAnalytics.getDepartmentMetrics(organizationId, dateRange),
      internalAnalytics.getBriefThroughput(organizationId, dateRange, "week"),
      internalAnalytics.getCapacityHeatmap(organizationId, dateRange),
    ]);

  return {
    overview,
    teamPerformance,
    departments,
    throughput,
    heatmap,
  };
}

// External Analytics Actions

export async function getClientList(organizationId: string) {
  const clients = await db.client.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return clients;
}

export async function getRealTimeMetrics(
  organizationId: string,
  clientId?: string
) {
  return externalAnalytics.getRealTimeMetrics(organizationId, clientId);
}

export async function getExternalAnalytics(
  organizationId: string,
  clientId: string,
  dateRange: DateRange
) {
  return externalAnalytics.getClientAnalytics(organizationId, clientId, dateRange);
}

export async function getPeriodComparison(
  organizationId: string,
  dateRange: DateRange,
  clientId?: string
) {
  return externalAnalytics.getPeriodMetrics(organizationId, dateRange, clientId);
}

export async function getMultiFactorAnalysis(
  organizationId: string,
  dateRange: DateRange
) {
  return externalAnalytics.getMultiFactorAnalysis(organizationId, dateRange);
}

// Graph Analytics Actions

export async function getCollaborationNetwork(organizationId: string) {
  return neo4jService.getCollaborationNetwork(organizationId);
}

export async function getClientRelationships(organizationId: string) {
  const clients = await db.client.findMany({
    where: { organizationId },
    select: { id: true },
  });

  const relationships = await Promise.all(
    clients.map((client) =>
      neo4jService.getClientRelationshipGraph(organizationId, client.id)
    )
  );

  return relationships;
}

export async function getSkillNetwork(organizationId: string) {
  return neo4jService.getSkillNetwork(organizationId);
}

export async function syncGraphData(organizationId: string) {
  await neo4jService.syncOrganizationData(organizationId);
  return { success: true };
}

export async function getWorkflowAnalysis(
  organizationId: string,
  briefType?: string
) {
  return neo4jService.analyzeWorkflowPaths(organizationId, briefType);
}

export async function getMultiPartyGraph(organizationId: string) {
  return neo4jService.getMultiPartyAnalysis(organizationId);
}
