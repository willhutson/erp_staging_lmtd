"use client";

import { useMemo } from "react";

interface NetworkGraphProps {
  nodes: Array<{
    id: string;
    label: string;
    type: "user" | "skill" | "client";
    size?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  height?: number;
}

const TYPE_COLORS = {
  user: "#52EDC7",
  skill: "#3B82F6",
  client: "#F59E0B",
};

export function NetworkGraph({ nodes, edges, height = 400 }: NetworkGraphProps) {
  const { positions } = useMemo(() => {
    // Simple circular layout with type grouping
    const byType: Record<string, typeof nodes> = {
      user: [],
      skill: [],
      client: [],
    };

    nodes.forEach((node) => {
      if (byType[node.type]) {
        byType[node.type].push(node);
      }
    });

    const pos: Record<string, { x: number; y: number }> = {};
    const centerX = 50;
    const centerY = 50;

    // Position skills in center
    byType.skill.forEach((node, i) => {
      const angle = (i / byType.skill.length) * Math.PI * 2;
      const r = 15;
      pos[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    });

    // Position users around skills
    byType.user.forEach((node, i) => {
      const angle = (i / byType.user.length) * Math.PI * 2;
      const r = 35;
      pos[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    });

    // Position clients on outer ring
    byType.client.forEach((node, i) => {
      const angle = (i / byType.client.length) * Math.PI * 2 + 0.2;
      const r = 45;
      pos[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    });

    const map = new Map(nodes.map((n) => [n.id, n]));

    return { positions: pos, nodeMap: map };
  }, [nodes]);

  return (
    <div style={{ height }} className="relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Edges */}
        {edges.map((edge) => {
          const source = positions[edge.source];
          const target = positions[edge.target];
          if (!source || !target) return null;

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="0.2"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const size = (node.size || 12) / 10;

          return (
            <g key={node.id} className="cursor-pointer">
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size}
                fill={TYPE_COLORS[node.type]}
                className="hover:opacity-80 transition-opacity"
              >
                <title>{node.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-4 text-xs">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize text-muted-foreground">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
