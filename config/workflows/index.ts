/**
 * Workflow Template Configurations
 *
 * These are the default workflow templates that can be seeded into
 * new organizations or used as starting points for custom workflows.
 */

export { rfpSubmissionWorkflow } from "./rfp-submission.workflow";
export { monthlyContentCalendarWorkflow } from "./monthly-content-calendar.workflow";
export { contentSeriesWorkflow } from "./content-series.workflow";

import { rfpSubmissionWorkflow } from "./rfp-submission.workflow";
import { monthlyContentCalendarWorkflow } from "./monthly-content-calendar.workflow";
import { contentSeriesWorkflow } from "./content-series.workflow";
import type { WorkflowDefinition } from "@/modules/builder/types";

export interface WorkflowTemplateConfig {
  id: string;
  name: string;
  description: string;
  module: "crm" | "agency" | "content";
  definition: WorkflowDefinition;
}

export const defaultWorkflowTemplates: WorkflowTemplateConfig[] = [
  {
    id: "rfp-submission",
    name: "RFP Submission Process",
    description:
      "Comprehensive workflow for responding to RFPs, from initial research through final submission. Includes strategic planning, creative development, and pitch rehearsal.",
    module: "crm",
    definition: rfpSubmissionWorkflow,
  },
  {
    id: "monthly-content-calendar",
    name: "Monthly Content Calendar",
    description:
      "Recurring workflow for planning, creating, and scheduling a month's worth of social content. Covers strategy, production, approvals, and publishing.",
    module: "content",
    definition: monthlyContentCalendarWorkflow,
  },
  {
    id: "content-series",
    name: "Content Series Production",
    description:
      "End-to-end workflow for producing multi-episode content series (video, podcast, blog). Includes pre-production, production, post-production, and delivery.",
    module: "agency",
    definition: contentSeriesWorkflow,
  },
];
