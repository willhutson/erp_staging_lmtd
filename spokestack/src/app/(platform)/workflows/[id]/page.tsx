import { notFound } from "next/navigation";
import { getWorkflowDefinition } from "@/modules/workflow-builder/actions";
import { WorkflowEditorClient } from "./workflow-editor-client";

export const dynamic = "force-dynamic";

interface WorkflowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { id } = await params;
  const workflow = await getWorkflowDefinition(id);

  if (!workflow) {
    notFound();
  }

  return <WorkflowEditorClient workflow={workflow} />;
}
