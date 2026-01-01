import { getWorkflowDetail } from "@/modules/workflows/actions";
import { WorkflowDetailView } from "./WorkflowDetailView";
import { notFound } from "next/navigation";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

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
