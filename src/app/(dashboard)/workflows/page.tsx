import { getWorkflowInstances } from "@/modules/workflows/actions";
import { WorkflowsView } from "./WorkflowsView";

export default async function WorkflowsPage() {
  const workflows = await getWorkflowInstances();

  return <WorkflowsView initialWorkflows={workflows} />;
}
