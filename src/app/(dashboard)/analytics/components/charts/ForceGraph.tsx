"use client";

import { useEffect, useRef, useMemo, useState } from "react";

interface ForceGraphProps {
  nodes: Array<{
    id: string;
    label: string;
    size?: number;
    color?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    width?: number;
  }>;
  height?: number;
}

interface SimNode {
  id: string;
  label: string;
  size: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function ForceGraph({ nodes, edges, height = 400 }: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height });
  const animationRef = useRef<number>();
  const nodesRef = useRef<SimNode[]>([]);

  // Initialize simulation nodes
  useEffect(() => {
    nodesRef.current = nodes.map((node, i) => ({
      ...node,
      size: node.size || 15,
      color: node.color || "#52EDC7",
      x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    }));
  }, [nodes, dimensions.width, height]);

  // Build adjacency map
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edges.forEach((edge) => {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    });
    return map;
  }, [edges]);

  // Edge lookup - reserved for future edge weight features
  const _edgeMap = useMemo(() => {
    const map = new Map<string, number>();
    edges.forEach((edge) => {
      map.set(`${edge.source}-${edge.target}`, edge.width || 1);
      map.set(`${edge.target}-${edge.source}`, edge.width || 1);
    });
    return map;
  }, [edges]);
  void _edgeMap;

  // Force simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodeById = new Map(nodesRef.current.map((n) => [n.id, n]));

    const simulate = () => {
      const simNodes = nodesRef.current;
      const centerX = dimensions.width / 2;
      const centerY = height / 2;

      // Apply forces
      simNodes.forEach((node) => {
        // Center gravity
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Repulsion from other nodes
        simNodes.forEach((other) => {
          if (node.id === other.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 500 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        });

        // Attraction to connected nodes
        const connected = adjacency.get(node.id);
        if (connected) {
          connected.forEach((otherId) => {
            const other = nodeById.get(otherId);
            if (!other) return;
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * 0.01;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          });
        }
      });

      // Update positions
      simNodes.forEach((node) => {
        node.vx *= 0.9; // Damping
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Bounds
        node.x = Math.max(30, Math.min(dimensions.width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      });

      // Draw
      ctx.clearRect(0, 0, dimensions.width, height);

      // Draw edges
      ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
      edges.forEach((edge) => {
        const source = nodeById.get(edge.source);
        const target = nodeById.get(edge.target);
        if (!source || !target) return;

        ctx.lineWidth = edge.width || 1;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw nodes
      simNodes.forEach((node) => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "#666";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.size / 2 + 12);
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, height, edges, adjacency]);

  // Handle resize
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div style={{ height }} className="w-full">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={height}
        className="w-full"
      />
    </div>
  );
}
