import { notFound } from "next/navigation";
import { getFormTemplate } from "@/modules/forms/actions/form-template-actions";
import { FormEditor } from "@/modules/forms/components/FormEditor";
import type { FormTemplateConfig } from "@/modules/forms/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const template = await getFormTemplate(id);

  if (!template) {
    notFound();
  }

  const initialData = {
    id: template.id,
    type: template.type,
    name: template.name,
    description: template.description || "",
    namingConvention: template.namingConvention || "",
    namingPrefix: template.namingPrefix || "",
    icon: template.icon || "",
    isActive: template.isActive,
    isSystem: template.isSystem,
    config: template.config as unknown as FormTemplateConfig,
  };

  return <FormEditor initialData={initialData} />;
}
