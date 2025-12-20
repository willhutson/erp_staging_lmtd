"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Network,
  Users,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  getCollaborationNetwork,
  getClientRelationships,
  getSkillNetwork,
  syncGraphData,
} from "../actions";
import { NetworkGraph } from "./charts/NetworkGraph";
import { ForceGraph } from "./charts/ForceGraph";

interface GraphDashboardProps {
  organizationId: string;
}

interface CollaborationData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    metrics?: { degree: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    weight?: number;
  }>;
  keyConnectors: Array<{
    userId: string;
    userName: string;
    connectionCount: number;
    influenceScore: number;
  }>;
  isolatedNodes: string[];
}

interface ClientRelationship {
  clientId: string;
  clientName: string;
  teamMembers: Array<{
    id: string;
    label: string;
    properties: { hoursOnClient?: number };
  }>;
  primaryContacts: string[];
  collaborationStrength: number;
  riskIndicators: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
}

interface SkillData {
  skills: Array<{ id: string; label: string; properties: { demand?: number } }>;
  users: Array<{ id: string; label: string }>;
  edges: Array<{ source: string; target: string }>;
  skillGaps: Array<{
    skill: string;
    demand: number;
    supply: number;
    gap: number;
  }>;
  skillClusters: Array<{
    name: string;
    skills: string[];
    experts: string[];
  }>;
}

export function GraphDashboard({ organizationId }: GraphDashboardProps) {
  const [view, setView] = useState<"collaboration" | "clients" | "skills">(
    "collaboration"
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [collaborationData, setCollaborationData] =
    useState<CollaborationData | null>(null);
  const [clientData, setClientData] = useState<ClientRelationship[]>([]);
  const [skillData, setSkillData] = useState<SkillData | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (view === "collaboration") {
          const data = await getCollaborationNetwork(organizationId);
          setCollaborationData(data);
        } else if (view === "clients") {
          const data = await getClientRelationships(organizationId);
          setClientData(data);
        } else {
          const data = await getSkillNetwork(organizationId);
          setSkillData(data);
        }
      } catch (error) {
        console.error("Failed to load graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [organizationId, view]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncGraphData(organizationId);
      // Reload current view
      if (view === "collaboration") {
        const data = await getCollaborationNetwork(organizationId);
        setCollaborationData(data);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Toggle & Sync */}
      <div className="flex items-center justify-between">
        <Tabs
          value={view}
          onValueChange={(v) =>
            setView(v as "collaboration" | "clients" | "skills")
          }
        >
          <TabsList>
            <TabsTrigger value="collaboration" className="gap-2">
              <Network className="h-4 w-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Client Teams
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Zap className="h-4 w-4" />
              Skills
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          Sync Data
        </Button>
      </div>

      {loading ? (
        <Card className="h-[500px] animate-pulse bg-muted/30" />
      ) : (
        <>
          {view === "collaboration" && collaborationData && (
            <CollaborationView data={collaborationData} />
          )}
          {view === "clients" && <ClientTeamsView data={clientData} />}
          {view === "skills" && skillData && <SkillsView data={skillData} />}
        </>
      )}
    </div>
  );
}

function CollaborationView({ data }: { data: CollaborationData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Key Connectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Key Connectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.keyConnectors.map((connector, i) => (
                <div
                  key={connector.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{i + 1}
                    </span>
                    <span className="font-medium">{connector.userName}</span>
                  </div>
                  <Badge variant="secondary">
                    {connector.connectionCount} connections
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Network Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nodes</span>
                <span className="font-medium">{data.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections</span>
                <span className="font-medium">{data.edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Isolated Members</span>
                <span className="font-medium">{data.isolatedNodes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Isolated Nodes Warning */}
        {data.isolatedNodes.length > 0 && (
          <Card className="border-yellow-500/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Isolated Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                These team members have no collaboration connections:
              </p>
              <div className="flex flex-wrap gap-1">
                {data.isolatedNodes.slice(0, 5).map((name) => (
                  <Badge key={name} variant="outline">
                    {name}
                  </Badge>
                ))}
                {data.isolatedNodes.length > 5 && (
                  <Badge variant="outline">
                    +{data.isolatedNodes.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Network Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Network</CardTitle>
        </CardHeader>
        <CardContent>
          <ForceGraph
            nodes={data.nodes.map((n) => ({
              id: n.id,
              label: n.label,
              size: (n.metrics?.degree || 1) * 5 + 10,
              color: n.type === "user" ? "#52EDC7" : "#1BA098",
            }))}
            edges={data.edges.map((e) => ({
              source: e.source,
              target: e.target,
              width: Math.min((e.weight || 1) * 0.5, 5),
            }))}
            height={450}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ClientTeamsView({ data }: { data: ClientRelationship[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((client) => (
        <Card key={client.clientId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{client.clientName}</CardTitle>
              <Badge
                variant={
                  client.collaborationStrength > 70
                    ? "default"
                    : client.collaborationStrength > 40
                    ? "secondary"
                    : "outline"
                }
              >
                {client.collaborationStrength}% strength
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Contacts */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Primary Contacts
              </p>
              <div className="flex flex-wrap gap-1">
                {client.primaryContacts.map((contact) => (
                  <Badge key={contact} variant="secondary">
                    {contact}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Team Members</span>
              <span className="font-medium">{client.teamMembers.length}</span>
            </div>

            {/* Risk Indicators */}
            {client.riskIndicators.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Risk Indicators
                </p>
                {client.riskIndicators.map((risk, i) => (
                  <div
                    key={i}
                    className={`text-sm p-2 rounded mb-1 ${
                      risk.severity === "high"
                        ? "bg-red-50 text-red-700"
                        : risk.severity === "medium"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {risk.description}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkillsView({ data }: { data: SkillData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Skill Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.skillGaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No significant skill gaps detected
              </p>
            ) : (
              <div className="space-y-3">
                {data.skillGaps.map((gap) => (
                  <div key={gap.skill} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{gap.skill}</span>
                      <span className="text-muted-foreground">
                        {gap.supply} / {gap.demand} needed
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (gap.supply / gap.demand) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Clusters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skill Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.skillClusters.map((cluster) => (
                <div key={cluster.name} className="space-y-2">
                  <p className="font-medium">{cluster.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {cluster.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Experts: {cluster.experts.slice(0, 3).join(", ")}
                    {cluster.experts.length > 3 &&
                      ` +${cluster.experts.length - 3} more`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Network */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Network</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkGraph
            nodes={[
              ...data.skills.map((s) => ({
                id: s.id,
                label: s.label,
                type: "skill" as const,
                size: (s.properties.demand || 1) * 2 + 15,
              })),
              ...data.users.map((u) => ({
                id: u.id,
                label: u.label,
                type: "user" as const,
                size: 12,
              })),
            ]}
            edges={data.edges.map((e, i) => ({
              id: `e${i}`,
              source: e.source,
              target: e.target,
            }))}
            height={400}
          />
        </CardContent>
      </Card>
    </div>
  );
}
