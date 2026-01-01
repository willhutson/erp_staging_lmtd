import { getWorkflowInstances } from "@/modules/workflows/actions";
import { WorkflowsView } from "./WorkflowsView";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workflows = await getWorkflowInstances();

  return <WorkflowsView initialWorkflows={workflows} />;
}
