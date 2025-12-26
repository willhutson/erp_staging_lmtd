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

export function getFormConfig(type: BriefType): FormConfig {
  return formConfigs[type];
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
