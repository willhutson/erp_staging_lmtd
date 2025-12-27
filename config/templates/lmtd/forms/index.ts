/**
 * LMTD Form Templates Index
 *
 * Exports all form templates extracted from TeamLMTD.
 */

export { videoShootFormTemplate } from "./video-shoot.form";
export { designFormTemplate } from "./design.form";
export { copywritingFormTemplate } from "./copywriting.form";

import { videoShootFormTemplate } from "./video-shoot.form";
import { designFormTemplate } from "./design.form";
import { copywritingFormTemplate } from "./copywriting.form";
import type { FormTemplate } from "../../types";

// All LMTD form templates
export const lmtdFormTemplates: FormTemplate[] = [
  videoShootFormTemplate,
  designFormTemplate,
  copywritingFormTemplate,
];

// Get form template by ID
export function getFormTemplateById(id: string): FormTemplate | undefined {
  return lmtdFormTemplates.find((t) => t.metadata.id === id);
}

// Get form templates by tag
export function getFormTemplatesByTag(tag: string): FormTemplate[] {
  return lmtdFormTemplates.filter((t) => t.metadata.tags.includes(tag));
}

export default lmtdFormTemplates;
