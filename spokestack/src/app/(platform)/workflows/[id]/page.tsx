import { notFound } from "next/navigation";
import { getWorkflowBoard } from "@/modules/workflows/actions";
import { WorkflowBoardClient } from "./board-client";

export const dynamic = "force-dynamic";

interface WorkflowBoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowBoardPage({ params }: WorkflowBoardPageProps) {
  const { id } = await params;
  const board = await getWorkflowBoard(id);

  if (!board) {
    notFound();
  }

  return <WorkflowBoardClient board={board} />;
}
