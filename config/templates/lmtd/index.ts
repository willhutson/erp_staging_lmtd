/**
 * LMTD Template Registry
 *
 * All templates extracted from TeamLMTD's business logic.
 * These can be installed into new SpokeStack instances.
 */

import { briefApprovalWorkflow } from "./workflows/brief-approval.workflow";
import { videoShootFormTemplate } from "./forms/video-shoot.form";
import type { TemplateConfig, TemplateCategory } from "../types";

// ============================================
// ALL LMTD TEMPLATES
// ============================================

export const lmtdTemplates: TemplateConfig[] = [
  // Workflows
  briefApprovalWorkflow,

  // Forms
  videoShootFormTemplate,

  // TODO: Add more templates as they are extracted:
  // - Video Edit Brief Form
  // - Design Brief Form
  // - Copywriting Brief Form
  // - Paid Media Brief Form
  // - RFP Pipeline Workflow
  // - Client Onboarding Workflow
  // - Retainer Tracking Dashboard
  // - Team Capacity Widget
  // - Client Health Dashboard
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getLmtdTemplatesByCategory(category: TemplateCategory): TemplateConfig[] {
  return lmtdTemplates.filter((t) => t.metadata.category === category);
}

export function getLmtdTemplateById(id: string): TemplateConfig | undefined {
  return lmtdTemplates.find((t) => t.metadata.id === id);
}

export function getLmtdTemplatesByTag(tag: string): TemplateConfig[] {
  return lmtdTemplates.filter((t) => t.metadata.tags.includes(tag));
}

// ============================================
// TEMPLATE CATEGORIES SUMMARY
// ============================================

export const lmtdTemplateSummary = {
  workflows: getLmtdTemplatesByCategory("workflow").length,
  forms: getLmtdTemplatesByCategory("form").length,
  notifications: getLmtdTemplatesByCategory("notification").length,
  dashboards: getLmtdTemplatesByCategory("dashboard").length,
  reports: getLmtdTemplatesByCategory("report").length,
  integrations: getLmtdTemplatesByCategory("integration").length,
  accessPolicies: getLmtdTemplatesByCategory("access").length,
  uiWidgets: getLmtdTemplatesByCategory("ui-widget").length,
  total: lmtdTemplates.length,
};

export default lmtdTemplates;
