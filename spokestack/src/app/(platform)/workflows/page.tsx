import { AlertTriangle } from "lucide-react";
import { getWorkflowBoards, getMyWorkflowCards } from "@/modules/workflows/actions";
import { WorkflowsClient } from "./workflows-client";

export const dynamic = "force-dynamic";

function WorkflowsError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Workflows Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load workflows. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function WorkflowsPage() {
  try {
    const [boards, myCards] = await Promise.all([
      getWorkflowBoards(),
      getMyWorkflowCards(),
    ]);

    return <WorkflowsClient initialBoards={boards} myCards={myCards} />;
  } catch (error) {
    console.error("Workflows page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <WorkflowsError message={message} />;
  }
}
