/**
 * Brief Approval Workflow Template
 *
 * Extracted from TeamLMTD's brief approval process.
 * A 5-stage workflow for creative brief management.
 */

import type { WorkflowTemplate } from "../../types";

export const briefApprovalWorkflow: WorkflowTemplate = {
  category: "workflow",
  metadata: {
    id: "lmtd-brief-approval-v1",
    name: "Brief Approval Workflow",
    description: "A 5-stage approval workflow for creative briefs with team lead review and client approval stages.",
    category: "workflow",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "approval", "creative", "agency"],
    icon: "FileCheck",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    stages: [
      {
        id: "draft",
        name: "Draft",
        description: "Initial brief creation and refinement",
        order: 1,
        color: "gray",
        permissions: {
          canEdit: ["STAFF", "TEAM_LEAD", "LEADERSHIP", "ADMIN"],
        },
      },
      {
        id: "pending_review",
        name: "Pending Review",
        description: "Waiting for team lead review",
        order: 2,
        color: "yellow",
        requiredFields: ["title", "description", "clientId", "dueDate", "assigneeId"],
        permissions: {
          canApprove: ["TEAM_LEAD", "LEADERSHIP", "ADMIN"],
          canReject: ["TEAM_LEAD", "LEADERSHIP", "ADMIN"],
        },
        autoTransitions: [
          {
            condition: "submittedAt != null && teamLeadId != null",
            targetStage: "pending_review",
            notify: ["TEAM_LEAD"],
          },
        ],
      },
      {
        id: "in_progress",
        name: "In Progress",
        description: "Actively being worked on",
        order: 3,
        color: "blue",
        permissions: {
          canEdit: ["STAFF", "TEAM_LEAD", "LEADERSHIP", "ADMIN"],
        },
      },
      {
        id: "pending_approval",
        name: "Pending Approval",
        description: "Work complete, waiting for client/leadership approval",
        order: 4,
        color: "orange",
        requiredFields: ["deliverables"],
        permissions: {
          canApprove: ["LEADERSHIP", "ADMIN"],
          canReject: ["LEADERSHIP", "ADMIN"],
        },
      },
      {
        id: "completed",
        name: "Completed",
        description: "Brief has been approved and closed",
        order: 5,
        color: "green",
        permissions: {
          canEdit: ["ADMIN"], // Only admin can edit completed briefs
        },
      },
      {
        id: "archived",
        name: "Archived",
        description: "Archived for reference",
        order: 6,
        color: "gray",
        permissions: {
          canEdit: [],
        },
      },
    ],
    initialStage: "draft",
    finalStages: ["completed", "archived"],
    hooks: {
      onStageChange: "notifyStakeholders",
      onComplete: "generateReport",
    },
  },
};

export default briefApprovalWorkflow;
