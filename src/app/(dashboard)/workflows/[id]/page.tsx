import { getWorkflowDetail } from "@/modules/workflows/actions";
import { WorkflowDetailView } from "./WorkflowDetailView";
import { notFound } from "next/navigation";

export default async function WorkflowDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const workflow = await getWorkflowDetail(params.id);

  if (!workflow) {
    notFound();
  }

  return <WorkflowDetailView workflow={workflow} />;
}
