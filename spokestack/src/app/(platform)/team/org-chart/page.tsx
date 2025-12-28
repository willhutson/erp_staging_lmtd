"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  Mail,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

// Mock org data - hierarchical structure
const orgData = {
  id: "will",
  name: "Will Hutson",
  role: "Managing Director",
  department: "Leadership",
  email: "will@teamlmtd.com",
  avatar: null,
  children: [
    {
      id: "cj",
      name: "CJ Ocampo",
      role: "Creative Director",
      department: "Creative",
      email: "cj@teamlmtd.com",
      avatar: null,
      children: [
        {
          id: "haidy",
          name: "Haidy Mohammed",
          role: "Senior Designer",
          department: "Creative",
          email: "haidy@teamlmtd.com",
          avatar: null,
          children: [
            { id: "ahmed", name: "Ahmed Hassan", role: "Designer", department: "Creative", email: "ahmed@teamlmtd.com", avatar: null, children: [] },
            { id: "fatima", name: "Fatima Al-Rashid", role: "Junior Designer", department: "Creative", email: "fatima@teamlmtd.com", avatar: null, children: [] },
          ],
        },
        {
          id: "omar",
          name: "Omar Khalil",
          role: "Motion Designer",
          department: "Creative",
          email: "omar@teamlmtd.com",
          avatar: null,
          children: [],
        },
      ],
    },
    {
      id: "ted",
      name: "Ted Vicencio",
      role: "Head of Production",
      department: "Production",
      email: "ted@teamlmtd.com",
      avatar: null,
      children: [
        {
          id: "marco",
          name: "Marco Santos",
          role: "Video Producer",
          department: "Production",
          email: "marco@teamlmtd.com",
          avatar: null,
          children: [
            { id: "ali", name: "Ali Mahmoud", role: "Video Editor", department: "Production", email: "ali@teamlmtd.com", avatar: null, children: [] },
          ],
        },
        {
          id: "sarah",
          name: "Sarah Chen",
          role: "Production Coordinator",
          department: "Production",
          email: "sarah@teamlmtd.com",
          avatar: null,
          children: [],
        },
      ],
    },
    {
      id: "salma",
      name: "Salma Hassan",
      role: "Account Director",
      department: "Account Management",
      email: "salma@teamlmtd.com",
      avatar: null,
      children: [
        {
          id: "nour",
          name: "Nour El-Din",
          role: "Senior Account Manager",
          department: "Account Management",
          email: "nour@teamlmtd.com",
          avatar: null,
          children: [
            { id: "layla", name: "Layla Farouk", role: "Account Executive", department: "Account Management", email: "layla@teamlmtd.com", avatar: null, children: [] },
          ],
        },
      ],
    },
    {
      id: "afaq",
      name: "Afaq Ahmed",
      role: "Head of Technology",
      department: "Technology",
      email: "afaq@teamlmtd.com",
      avatar: null,
      children: [
        { id: "dev1", name: "Rashed Al-Maktoum", role: "Full Stack Developer", department: "Technology", email: "rashed@teamlmtd.com", avatar: null, children: [] },
        { id: "dev2", name: "Priya Sharma", role: "Frontend Developer", department: "Technology", email: "priya@teamlmtd.com", avatar: null, children: [] },
      ],
    },
  ],
};

interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string | null;
  children: OrgNode[];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getDepartmentColor(department: string) {
  const colors: Record<string, string> = {
    Leadership: "border-purple-500 bg-purple-50",
    Creative: "border-pink-500 bg-pink-50",
    Production: "border-blue-500 bg-blue-50",
    "Account Management": "border-green-500 bg-green-50",
    Technology: "border-orange-500 bg-orange-50",
    Strategy: "border-cyan-500 bg-cyan-50",
    Operations: "border-gray-500 bg-gray-50",
  };
  return colors[department] || "border-gray-300 bg-gray-50";
}

function OrgNodeCard({ node, isExpanded, onToggle }: { node: OrgNode; isExpanded: boolean; onToggle: () => void }) {
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative p-4 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow min-w-[200px] ${getDepartmentColor(node.department)}`}
      >
        {hasChildren && (
          <button
            onClick={onToggle}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 p-1 rounded-full bg-white border shadow-sm hover:bg-gray-50"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow">
            <AvatarImage src={node.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(node.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <h4 className="font-semibold text-sm">{node.name}</h4>
            <p className="text-xs text-muted-foreground">{node.role}</p>
            <Badge variant="outline" className="text-[10px] mt-1">
              {node.department}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgTree({ node, expandedNodes, toggleNode }: { node: OrgNode; expandedNodes: Set<string>; toggleNode: (id: string) => void }) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.id)}
      />

      {hasChildren && isExpanded && (
        <>
          {/* Connector line */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div
              className="h-px bg-gray-300"
              style={{ width: `${(node.children.length - 1) * 240}px` }}
            />
          )}

          {/* Children */}
          <div className="flex gap-8 pt-2">
            {node.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="w-px h-4 bg-gray-300" />
                <OrgTree
                  node={child}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["will", "cj", "ted", "salma", "afaq"]) // Expand top levels by default
  );
  const [zoom, setZoom] = useState(100);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const traverse = (node: OrgNode) => {
      allIds.add(node.id);
      node.children.forEach(traverse);
    };
    traverse(orgData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(["will"]));
  };

  // Count team members
  const countMembers = (node: OrgNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + countMembers(child), 0);
  };
  const totalMembers = countMembers(orgData);

  // Get unique departments
  const getDepartments = (node: OrgNode): string[] => {
    const depts = [node.department];
    node.children.forEach((child) => {
      depts.push(...getDepartments(child));
    });
    return depts;
  };
  const departments = Array.from(new Set(getDepartments(orgData)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Organization Chart</h1>
            <p className="text-muted-foreground">
              {totalMembers} team members across {departments.length} departments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground min-w-[50px] justify-center">
              {zoom}%
            </span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(150, zoom + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" onClick={collapseAll}>
            Collapse
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {departments.map((dept) => (
          <div key={dept} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border-2 ${getDepartmentColor(dept)}`} />
            <span className="text-sm text-muted-foreground">{dept}</span>
          </div>
        ))}
      </div>

      {/* Org Chart */}
      <Card>
        <CardContent className="p-8 overflow-auto">
          <div
            className="flex justify-center min-w-max transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <OrgTree
              node={orgData}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {departments.map((dept) => {
          const countInDept = (node: OrgNode): number => {
            let count = node.department === dept ? 1 : 0;
            node.children.forEach((child) => {
              count += countInDept(child);
            });
            return count;
          };
          const deptCount = countInDept(orgData);

          return (
            <Card key={dept}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dept}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{deptCount}</span>
                  <span className="text-sm text-muted-foreground">members</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
