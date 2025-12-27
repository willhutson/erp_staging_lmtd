/**
 * SpokeStack Resource Registry
 *
 * Central registry for all admin resources.
 * Resources are config-driven and render dynamically in Refine.
 */

import type { ResourceConfig, ResourceRegistry, SpokeStackModule, ModuleConfig } from "./types";
import { SPOKESTACK_MODULES } from "./types";

// Import all resource configs
import { usersResource } from "./users.resource";
import { clientsResource } from "./clients.resource";
import { projectsResource } from "./projects.resource";
import { auditLogsResource } from "./audit-logs.resource";
import { skillsResource } from "./skills.resource";
import { docTemplatesResource } from "./doc-templates.resource";
import { analyticsDashboardsResource } from "./analytics-dashboards.resource";
import { analyticsWidgetsResource } from "./analytics-widgets.resource";
// New resources extracted from LMTD
import { contactsResource } from "./contacts.resource";
import { leaveTypesResource } from "./leave-types.resource";
import { integrationsResource } from "./integrations.resource";

// ============================================
// RESOURCE REGISTRY
// ============================================

const allResources: ResourceConfig[] = [
  // CORE
  usersResource,
  clientsResource,
  projectsResource,
  contactsResource,      // CRM contacts
  leaveTypesResource,    // Leave management config
  auditLogsResource,

  // CONTENT_ENGINE
  skillsResource,
  docTemplatesResource,

  // ANALYTICS
  analyticsDashboardsResource,
  analyticsWidgetsResource,

  // MESSAGING (to be added)
  // notificationRulesResource - already exists but needs migration
  // emailTemplatesResource,

  // ACCESS_CONTROL (to be added)
  // accessPoliciesResource - already exists but needs migration

  // INTEGRATIONS
  integrationsResource,
];

// ============================================
// REGISTRY FUNCTIONS
// ============================================

export function getResource(name: string): ResourceConfig | undefined {
  return allResources.find((r) => r.name === name);
}

export function getResourcesByModule(module: SpokeStackModule): ResourceConfig[] {
  return allResources.filter((r) => r.module === module);
}

export function getAllResources(): ResourceConfig[] {
  return allResources;
}

export function getModules(): ModuleConfig[] {
  return SPOKESTACK_MODULES;
}

export function getModuleWithResources(): Array<ModuleConfig & { resources: ResourceConfig[] }> {
  return SPOKESTACK_MODULES.map((module) => ({
    ...module,
    resources: getResourcesByModule(module.name),
  }));
}

// ============================================
// EXPORTS
// ============================================

export const resourceRegistry: ResourceRegistry = {
  resources: allResources,
  modules: SPOKESTACK_MODULES,
  getResource,
  getResourcesByModule,
};

// Re-export types
export type { ResourceConfig, FieldDefinition, FieldType, SpokeStackModule } from "./types";

// Re-export individual resources for direct import
export {
  usersResource,
  clientsResource,
  projectsResource,
  auditLogsResource,
  skillsResource,
  docTemplatesResource,
  analyticsDashboardsResource,
  analyticsWidgetsResource,
  // New resources
  contactsResource,
  leaveTypesResource,
  integrationsResource,
};
