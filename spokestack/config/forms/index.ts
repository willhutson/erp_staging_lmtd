import type { FormConfig, BriefType } from "@/types/forms";

// Re-export BriefType for use in pages
export type { BriefType } from "@/types/forms";

import { videoShootForm } from "./video-shoot.form";
import { videoEditForm } from "./video-edit.form";
import { designForm } from "./design.form";
import { copywritingEnForm } from "./copywriting-en.form";
import { copywritingArForm } from "./copywriting-ar.form";
import { paidMediaForm } from "./paid-media.form";
import { reportForm } from "./report.form";

export const formConfigs: Record<BriefType, FormConfig> = {
  VIDEO_SHOOT: videoShootForm,
  VIDEO_EDIT: videoEditForm,
  DESIGN: designForm,
  COPYWRITING_EN: copywritingEnForm,
  COPYWRITING_AR: copywritingArForm,
  PAID_MEDIA: paidMediaForm,
  REPORT: reportForm,
};

// Project field to inject into all form configs
const projectField = {
  id: "projectId",
  label: "Project",
  type: "project-select" as const,
  required: false,
  helpText: "Optional: Link this brief to a project for better organization",
};

// Backup Assignee field to inject after assigneeId
const backupAssigneeField = {
  id: "backupAssigneeId",
  label: "Backup Assignee",
  type: "user-select" as const,
  required: false,
  helpText: "Optional: Backup will be notified if primary is unavailable",
  placeholder: "Select backup assignee",
};

export function getFormConfig(type: BriefType): FormConfig {
  const config = formConfigs[type];

  // Inject project field and backup assignee field into the first section
  const enhancedSections = config.sections.map((section, sectionIndex) => {
    if (sectionIndex !== 0) return section;

    let enhancedFields = [...section.fields];

    // Insert projectId field after clientId
    const clientIdIndex = enhancedFields.findIndex((f) => f.id === "clientId");
    if (clientIdIndex !== -1) {
      enhancedFields = [
        ...enhancedFields.slice(0, clientIdIndex + 1),
        projectField,
        ...enhancedFields.slice(clientIdIndex + 1),
      ];
    }

    // Insert backupAssigneeId field after assigneeId
    const assigneeIdIndex = enhancedFields.findIndex((f) => f.id === "assigneeId");
    if (assigneeIdIndex !== -1) {
      enhancedFields = [
        ...enhancedFields.slice(0, assigneeIdIndex + 1),
        backupAssigneeField,
        ...enhancedFields.slice(assigneeIdIndex + 1),
      ];
    }

    return { ...section, fields: enhancedFields };
  });

  return { ...config, sections: enhancedSections };
}

export function getAllFormConfigs(): FormConfig[] {
  return Object.values(formConfigs);
}

export const briefTypeLabels: Record<BriefType, string> = {
  VIDEO_SHOOT: "Video Shoot",
  VIDEO_EDIT: "Video Edit",
  DESIGN: "Design",
  COPYWRITING_EN: "English Copywriting",
  COPYWRITING_AR: "Arabic Copywriting",
  PAID_MEDIA: "Paid Media",
  REPORT: "Report",
};

export const briefTypeIcons: Record<BriefType, string> = {
  VIDEO_SHOOT: "Video",
  VIDEO_EDIT: "Film",
  DESIGN: "Palette",
  COPYWRITING_EN: "FileText",
  COPYWRITING_AR: "Languages",
  PAID_MEDIA: "Target",
  REPORT: "BarChart3",
};
