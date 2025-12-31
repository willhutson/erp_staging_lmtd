"use server";

import { auth } from "@/lib/auth";
import { startWorkflow as startWorkflowEngine } from "../services/workflow-engine";
import { revalidatePath } from "next/cache";

interface StartWorkflowParams {
  templateId: string;
  triggerEntityType: string;
  triggerEntityId: string;
  deadline?: Date;
  variables?: Record<string, unknown>;
}

export async function startWorkflowAction(params: StartWorkflowParams) {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const instance = await startWorkflowEngine({
    organizationId: session.user.organizationId,
    templateId: params.templateId,
    triggerEntityType: params.triggerEntityType,
    triggerEntityId: params.triggerEntityId,
    deadline: params.deadline || null,
    ownerId: session.user.id,
    variables: params.variables,
  });

  revalidatePath("/workflows");

  return { success: true, instanceId: instance.id };
}
