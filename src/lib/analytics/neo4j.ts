/**
 * Neo4j Graph Analytics Service
 * Handles relationship-based analytics and graph visualizations
 * Provides multi-party/multi-factor relationship insights
 */

import neo4j, { Driver, Session, Node, Relationship } from "neo4j-driver";
import { db } from "@/lib/db";

// Graph node types
export interface GraphNode {
  id: string;
  type: "user" | "client" | "brief" | "department" | "skill";
  label: string;
  properties: Record<string, unknown>;
  metrics?: {
    degree: number;
    betweenness?: number;
    pageRank?: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    clusters: number;
  };
}

// Relationship insights
export interface CollaborationNetwork {
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities: CommunityData[];
  keyConnectors: ConnectorData[];
  isolatedNodes: string[];
}

export interface CommunityData {
  id: number;
  members: string[];
  name?: string;
  avgCollaboration: number;
}

export interface ConnectorData {
  userId: string;
  userName: string;
  connectionCount: number;
  bridgeScore: number; // How much they connect different groups
  influenceScore: number;
}

// Client relationship graph
export interface ClientRelationshipGraph {
  clientId: string;
  clientName: string;
  teamMembers: GraphNode[];
  briefFlow: GraphEdge[];
  primaryContacts: string[];
  collaborationStrength: number;
  riskIndicators: RiskIndicator[];
}

export interface RiskIndicator {
  type: "concentration" | "dependency" | "capacity" | "communication";
  severity: "low" | "medium" | "high";
  description: string;
  affectedEntities: string[];
}

// Skill/capability network
export interface SkillNetwork {
  skills: GraphNode[];
  users: GraphNode[];
  edges: GraphEdge[];
  skillGaps: SkillGapData[];
  skillClusters: SkillCluster[];
}

export interface SkillGapData {
  skill: string;
  demand: number; // briefs requiring this skill
  supply: number; // team members with this skill
  gap: number;
  trend: "growing" | "shrinking" | "stable";
}

export interface SkillCluster {
  name: string;
  skills: string[];
  experts: string[];
  avgProficiency: number;
}

// Path analysis
export interface WorkflowPath {
  briefId: string;
  stages: PathStage[];
  totalDuration: number;
  bottlenecks: string[];
  efficiency: number;
}

export interface PathStage {
  stage: string;
  duration: number;
  actor?: string;
  action?: string;
}

class Neo4jService {
  private driver: Driver | null = null;

  constructor() {
    this.initializeDriver();
  }

  private initializeDriver(): void {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (uri && user && password) {
      try {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
        });
      } catch (error) {
        console.warn("Neo4j driver initialization failed:", error);
      }
    }
  }

  private async getSession(): Promise<Session | null> {
    if (!this.driver) {
      return null;
    }
    return this.driver.session();
  }

  /**
   * Check if Neo4j is available
   */
  async isAvailable(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    try {
      await session.run("RETURN 1");
      return true;
    } catch {
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Sync organization data to Neo4j
   */
  async syncOrganizationData(organizationId: string): Promise<void> {
    const session = await this.getSession();
    if (!session) {
      console.warn("Neo4j not available, skipping sync");
      return;
    }

    try {
      // Start transaction
      const tx = session.beginTransaction();

      // Sync users
      const users = await db.user.findMany({
        where: { organizationId, isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          permissionLevel: true,
        },
      });

      for (const user of users) {
        await tx.run(
          `
          MERGE (u:User {id: $id})
          SET u.name = $name,
              u.email = $email,
              u.department = $department,
              u.permissionLevel = $permissionLevel,
              u.organizationId = $organizationId
          `,
          { ...user, organizationId }
        );
      }

      // Sync clients
      const clients = await db.client.findMany({
        where: { organizationId },
        select: { id: true, name: true, industry: true },
      });

      for (const client of clients) {
        await tx.run(
          `
          MERGE (c:Client {id: $id})
          SET c.name = $name,
              c.industry = $industry,
              c.organizationId = $organizationId
          `,
          { ...client, organizationId }
        );
      }

      // Sync briefs and relationships
      const briefs = await db.brief.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          clientId: true,
          assigneeId: true,
          createdById: true,
        },
      });

      for (const brief of briefs) {
        await tx.run(
          `
          MERGE (b:Brief {id: $id})
          SET b.title = $title,
              b.type = $type,
              b.status = $status,
              b.organizationId = $organizationId
          `,
          { ...brief, organizationId }
        );

        // Client relationship
        if (brief.clientId) {
          await tx.run(
            `
            MATCH (b:Brief {id: $briefId}), (c:Client {id: $clientId})
            MERGE (b)-[:FOR_CLIENT]->(c)
            `,
            { briefId: brief.id, clientId: brief.clientId }
          );
        }

        // Assignee relationship
        if (brief.assigneeId) {
          await tx.run(
            `
            MATCH (b:Brief {id: $briefId}), (u:User {id: $userId})
            MERGE (u)-[:ASSIGNED_TO]->(b)
            `,
            { briefId: brief.id, userId: brief.assigneeId }
          );
        }

        // Creator relationship
        if (brief.createdById) {
          await tx.run(
            `
            MATCH (b:Brief {id: $briefId}), (u:User {id: $userId})
            MERGE (u)-[:CREATED]->(b)
            `,
            { briefId: brief.id, userId: brief.createdById }
          );
        }
      }

      // Sync collaboration from time entries
      const collaborations = await db.$queryRaw<
        Array<{ user1: string; user2: string; briefCount: number }>
      >`
        SELECT
          t1."userId" as user1,
          t2."userId" as user2,
          COUNT(DISTINCT t1."briefId") as "briefCount"
        FROM "TimeEntry" t1
        JOIN "TimeEntry" t2 ON t1."briefId" = t2."briefId" AND t1."userId" < t2."userId"
        JOIN "Brief" b ON t1."briefId" = b.id
        WHERE b."organizationId" = ${organizationId}
        GROUP BY t1."userId", t2."userId"
        HAVING COUNT(DISTINCT t1."briefId") > 0
      `;

      for (const collab of collaborations) {
        await tx.run(
          `
          MATCH (u1:User {id: $user1}), (u2:User {id: $user2})
          MERGE (u1)-[r:COLLABORATES_WITH]-(u2)
          SET r.briefCount = $briefCount,
              r.weight = $briefCount
          `,
          collab
        );
      }

      await tx.commit();

      // Log sync
      await db.graphSyncLog.create({
        data: {
          organizationId,
          entityType: "FULL_SYNC",
          recordCount:
            users.length + clients.length + briefs.length + collaborations.length,
          status: "SUCCESS",
        },
      });
    } catch (error) {
      console.error("Neo4j sync failed:", error);
      await db.graphSyncLog.create({
        data: {
          organizationId,
          entityType: "FULL_SYNC",
          recordCount: 0,
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get collaboration network for the organization
   */
  async getCollaborationNetwork(
    organizationId: string
  ): Promise<CollaborationNetwork | null> {
    // Fallback to SQL-based analysis if Neo4j unavailable
    const session = await this.getSession();

    if (!session) {
      return this.getCollaborationNetworkSQL(organizationId);
    }

    try {
      // Get all collaboration relationships
      const result = await session.run(
        `
        MATCH (u1:User {organizationId: $organizationId})-[r:COLLABORATES_WITH]-(u2:User)
        RETURN u1, u2, r
        `,
        { organizationId }
      );

      const nodesMap = new Map<string, GraphNode>();
      const edges: GraphEdge[] = [];

      result.records.forEach((record) => {
        const u1 = record.get("u1") as Node;
        const u2 = record.get("u2") as Node;
        const r = record.get("r") as Relationship;

        // Add nodes
        if (!nodesMap.has(u1.properties.id as string)) {
          nodesMap.set(u1.properties.id as string, {
            id: u1.properties.id as string,
            type: "user",
            label: u1.properties.name as string,
            properties: u1.properties as Record<string, unknown>,
            metrics: { degree: 0 },
          });
        }
        if (!nodesMap.has(u2.properties.id as string)) {
          nodesMap.set(u2.properties.id as string, {
            id: u2.properties.id as string,
            type: "user",
            label: u2.properties.name as string,
            properties: u2.properties as Record<string, unknown>,
            metrics: { degree: 0 },
          });
        }

        // Add edge
        edges.push({
          id: r.identity.toString(),
          source: u1.properties.id as string,
          target: u2.properties.id as string,
          type: "COLLABORATES_WITH",
          weight: r.properties.weight as number,
        });

        // Update degrees
        nodesMap.get(u1.properties.id as string)!.metrics!.degree++;
        nodesMap.get(u2.properties.id as string)!.metrics!.degree++;
      });

      const nodes = Array.from(nodesMap.values());

      // Get key connectors (highest degree)
      const keyConnectors: ConnectorData[] = nodes
        .sort((a, b) => (b.metrics?.degree || 0) - (a.metrics?.degree || 0))
        .slice(0, 5)
        .map((node) => ({
          userId: node.id,
          userName: node.label,
          connectionCount: node.metrics?.degree || 0,
          bridgeScore: 0, // Would need betweenness centrality
          influenceScore: (node.metrics?.degree || 0) / nodes.length,
        }));

      // Find isolated nodes
      const connectedIds = new Set(nodes.map((n) => n.id));
      const allUsers = await db.user.findMany({
        where: { organizationId, isActive: true },
        select: { id: true, name: true },
      });
      const isolatedNodes = allUsers
        .filter((u) => !connectedIds.has(u.id))
        .map((u) => u.name);

      return {
        nodes,
        edges,
        communities: [], // Would need community detection algorithm
        keyConnectors,
        isolatedNodes,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * SQL fallback for collaboration network
   */
  private async getCollaborationNetworkSQL(
    organizationId: string
  ): Promise<CollaborationNetwork> {
    const users = await db.user.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, department: true },
    });

    // Get collaboration counts from shared briefs
    const collaborations = await db.$queryRaw<
      Array<{ user1: string; user2: string; briefCount: number }>
    >`
      SELECT
        t1."userId" as user1,
        t2."userId" as user2,
        COUNT(DISTINCT t1."briefId")::int as "briefCount"
      FROM "TimeEntry" t1
      JOIN "TimeEntry" t2 ON t1."briefId" = t2."briefId" AND t1."userId" < t2."userId"
      JOIN "Brief" b ON t1."briefId" = b.id
      WHERE b."organizationId" = ${organizationId}
      GROUP BY t1."userId", t2."userId"
    `;

    const nodes: GraphNode[] = users.map((u) => ({
      id: u.id,
      type: "user",
      label: u.name,
      properties: { department: u.department },
      metrics: { degree: 0 },
    }));

    const nodesMap = new Map(nodes.map((n) => [n.id, n]));

    const edges: GraphEdge[] = collaborations.map((c, i) => {
      // Update degrees
      if (nodesMap.has(c.user1)) nodesMap.get(c.user1)!.metrics!.degree++;
      if (nodesMap.has(c.user2)) nodesMap.get(c.user2)!.metrics!.degree++;

      return {
        id: `e${i}`,
        source: c.user1,
        target: c.user2,
        type: "COLLABORATES_WITH",
        weight: c.briefCount,
      };
    });

    const connectedIds = new Set([
      ...edges.map((e) => e.source),
      ...edges.map((e) => e.target),
    ]);

    const keyConnectors = Array.from(nodesMap.values())
      .sort((a, b) => (b.metrics?.degree || 0) - (a.metrics?.degree || 0))
      .slice(0, 5)
      .map((node) => ({
        userId: node.id,
        userName: node.label,
        connectionCount: node.metrics?.degree || 0,
        bridgeScore: 0,
        influenceScore: nodes.length > 0 ? (node.metrics?.degree || 0) / nodes.length : 0,
      }));

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
      communities: [],
      keyConnectors,
      isolatedNodes: users
        .filter((u) => !connectedIds.has(u.id))
        .map((u) => u.name),
    };
  }

  /**
   * Get client relationship graph
   */
  async getClientRelationshipGraph(
    organizationId: string,
    clientId: string
  ): Promise<ClientRelationshipGraph> {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Get team members who have worked on this client
    const teamData = await db.timeEntry.findMany({
      where: {
        organizationId,
        brief: { clientId },
      },
      select: {
        user: {
          select: { id: true, name: true, department: true },
        },
        hours: true,
      },
    });

    // Aggregate by user
    const userHours = new Map<
      string,
      { id: string; name: string; department: string; hours: number }
    >();
    teamData.forEach((entry) => {
      const key = entry.user.id;
      if (!userHours.has(key)) {
        userHours.set(key, {
          id: entry.user.id,
          name: entry.user.name,
          department: entry.user.department || "Other",
          hours: 0,
        });
      }
      userHours.get(key)!.hours += Number(entry.hours);
    });

    const teamMembers: GraphNode[] = Array.from(userHours.values()).map((u) => ({
      id: u.id,
      type: "user",
      label: u.name,
      properties: { department: u.department, hoursOnClient: u.hours },
      metrics: { degree: 1 },
    }));

    // Get brief flow (simplified)
    const briefs = await db.brief.findMany({
      where: { organizationId, clientId },
      select: {
        id: true,
        title: true,
        type: true,
        createdById: true,
        assigneeId: true,
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    const briefFlow: GraphEdge[] = briefs
      .filter((b) => b.createdById && b.assigneeId)
      .map((b, i) => ({
        id: `bf${i}`,
        source: b.createdById!,
        target: b.assigneeId!,
        type: "BRIEF_HANDOFF",
        properties: { briefType: b.type },
      }));

    // Identify primary contacts (most hours)
    const primaryContacts = Array.from(userHours.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 3)
      .map((u) => u.name);

    // Calculate collaboration strength
    const totalHours = Array.from(userHours.values()).reduce(
      (s, u) => s + u.hours,
      0
    );
    const collaborationStrength = Math.min(
      100,
      Math.round((teamMembers.length / 10) * 50 + (totalHours / 1000) * 50)
    );

    // Risk indicators
    const riskIndicators: RiskIndicator[] = [];

    // Concentration risk - if >70% work is with top 2 people
    const topTwo = Array.from(userHours.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 2);
    const topTwoHours = topTwo.reduce((s, u) => s + u.hours, 0);
    if (totalHours > 0 && topTwoHours / totalHours > 0.7) {
      riskIndicators.push({
        type: "concentration",
        severity: "high",
        description: "High concentration of work with few team members",
        affectedEntities: topTwo.map((u) => u.name),
      });
    }

    // Capacity risk - single person handling >50% of briefs
    const briefsByAssignee = new Map<string, number>();
    briefs.forEach((b) => {
      if (b.assigneeId) {
        briefsByAssignee.set(
          b.assigneeId,
          (briefsByAssignee.get(b.assigneeId) || 0) + 1
        );
      }
    });
    const maxBriefsPerPerson = Math.max(...Array.from(briefsByAssignee.values()));
    if (briefs.length > 5 && maxBriefsPerPerson / briefs.length > 0.5) {
      riskIndicators.push({
        type: "capacity",
        severity: "medium",
        description: "Single team member handling majority of briefs",
        affectedEntities: [],
      });
    }

    return {
      clientId,
      clientName: client.name,
      teamMembers,
      briefFlow,
      primaryContacts,
      collaborationStrength,
      riskIndicators,
    };
  }

  /**
   * Get skill network analysis
   */
  async getSkillNetwork(organizationId: string): Promise<SkillNetwork> {
    // Get users with their departments/skills (using department as proxy for skill)
    const users = await db.user.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, department: true },
    });

    // Get brief types as skill demand
    const briefDemand = await db.brief.groupBy({
      by: ["type"],
      where: { organizationId },
      _count: true,
    });

    // Map department to skills
    const departmentToSkills: Record<string, string[]> = {
      Video: ["VIDEO_SHOOT", "VIDEO_EDIT"],
      Design: ["DESIGN"],
      Copy: ["COPYWRITING_EN", "COPYWRITING_AR"],
      "Paid Media": ["PAID_MEDIA"],
      Production: ["VIDEO_SHOOT", "VIDEO_EDIT", "DESIGN"],
    };

    // Build skill nodes
    const skillNodes: GraphNode[] = briefDemand.map((bd) => ({
      id: `skill_${bd.type}`,
      type: "skill",
      label: bd.type.replace(/_/g, " "),
      properties: { demand: bd._count },
      metrics: { degree: 0 },
    }));

    // Build user nodes
    const userNodes: GraphNode[] = users.map((u) => ({
      id: u.id,
      type: "user",
      label: u.name,
      properties: { department: u.department },
      metrics: { degree: 0 },
    }));

    // Build edges (user has skill based on department)
    const edges: GraphEdge[] = [];
    users.forEach((user) => {
      const skills = departmentToSkills[user.department || ""] || [];
      skills.forEach((skill, i) => {
        edges.push({
          id: `${user.id}_${skill}_${i}`,
          source: user.id,
          target: `skill_${skill}`,
          type: "HAS_SKILL",
        });
      });
    });

    // Calculate skill gaps
    const skillGaps: SkillGapData[] = briefDemand.map((bd) => {
      const skills = Object.entries(departmentToSkills)
        .filter(([, skills]) => skills.includes(bd.type))
        .map(([dept]) => dept);
      const supply = users.filter((u) => skills.includes(u.department || ""))
        .length;

      return {
        skill: bd.type.replace(/_/g, " "),
        demand: bd._count,
        supply,
        gap: bd._count > 0 ? Math.max(0, (bd._count / 10) - supply) : 0,
        trend: "stable",
      };
    });

    // Build skill clusters
    const skillClusters: SkillCluster[] = Object.entries(departmentToSkills).map(
      ([dept, skills]) => ({
        name: dept,
        skills: skills.map((s) => s.replace(/_/g, " ")),
        experts: users.filter((u) => u.department === dept).map((u) => u.name),
        avgProficiency: 75, // Placeholder
      })
    );

    return {
      skills: skillNodes,
      users: userNodes,
      edges,
      skillGaps: skillGaps.filter((g) => g.gap > 0),
      skillClusters,
    };
  }

  /**
   * Analyze workflow paths for briefs
   */
  async analyzeWorkflowPaths(
    organizationId: string,
    briefType?: string
  ): Promise<WorkflowPath[]> {
    const briefs = await db.brief.findMany({
      where: {
        organizationId,
        status: "COMPLETED",
        ...(briefType ? { type: briefType } : {}),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        completedAt: true,
        statusHistory: true, // Assuming this exists or using audit trail
      },
      take: 20,
      orderBy: { completedAt: "desc" },
    });

    // Simplified path analysis
    return briefs
      .filter((b) => b.completedAt)
      .map((brief) => {
        const totalDuration =
          (brief.completedAt!.getTime() - brief.createdAt.getTime()) / 3600000;

        // Estimate stages (simplified)
        const stages: PathStage[] = [
          { stage: "Created", duration: 0 },
          { stage: "In Progress", duration: totalDuration * 0.4 },
          { stage: "Review", duration: totalDuration * 0.3 },
          { stage: "Client Approval", duration: totalDuration * 0.2 },
          { stage: "Completed", duration: totalDuration * 0.1 },
        ];

        // Identify bottlenecks (stages taking >40% of time)
        const bottlenecks = stages
          .filter((s) => s.duration / totalDuration > 0.4)
          .map((s) => s.stage);

        return {
          briefId: brief.id,
          stages,
          totalDuration: Math.round(totalDuration),
          bottlenecks,
          efficiency: bottlenecks.length === 0 ? 100 : Math.max(50, 100 - bottlenecks.length * 20),
        };
      });
  }

  /**
   * Get multi-party analysis for cross-functional insights
   */
  async getMultiPartyAnalysis(
    organizationId: string
  ): Promise<GraphData> {
    const [users, clients, briefs] = await Promise.all([
      db.user.findMany({
        where: { organizationId, isActive: true },
        select: { id: true, name: true, department: true },
      }),
      db.client.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      }),
      db.brief.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
          type: true,
          clientId: true,
          assigneeId: true,
        },
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const nodes: GraphNode[] = [
      ...users.map((u) => ({
        id: u.id,
        type: "user" as const,
        label: u.name,
        properties: { department: u.department },
        metrics: { degree: 0 },
      })),
      ...clients.map((c) => ({
        id: c.id,
        type: "client" as const,
        label: c.name,
        properties: {},
        metrics: { degree: 0 },
      })),
    ];

    const nodesMap = new Map(nodes.map((n) => [n.id, n]));

    const edges: GraphEdge[] = [];

    // User-Client edges based on briefs
    const userClientWork = new Map<string, Set<string>>();
    briefs.forEach((brief) => {
      if (brief.assigneeId && brief.clientId) {
        const key = `${brief.assigneeId}_${brief.clientId}`;
        if (!userClientWork.has(key)) {
          userClientWork.set(key, new Set());
        }
        userClientWork.get(key)!.add(brief.id);

        // Update degrees
        if (nodesMap.has(brief.assigneeId)) {
          nodesMap.get(brief.assigneeId)!.metrics!.degree++;
        }
        if (nodesMap.has(brief.clientId)) {
          nodesMap.get(brief.clientId)!.metrics!.degree++;
        }
      }
    });

    userClientWork.forEach((briefIds, key) => {
      const [userId, clientId] = key.split("_");
      edges.push({
        id: key,
        source: userId,
        target: clientId,
        type: "WORKS_FOR",
        weight: briefIds.size,
        properties: { briefCount: briefIds.size },
      });
    });

    // Calculate graph density
    const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
    const density = maxEdges > 0 ? edges.length / maxEdges : 0;

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
      summary: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        density: Math.round(density * 1000) / 1000,
        clusters: new Set(users.map((u) => u.department)).size,
      },
    };
  }

  /**
   * Close Neo4j connection
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
    }
  }
}

export const neo4jService = new Neo4jService();
