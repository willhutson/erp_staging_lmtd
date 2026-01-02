import { notFound } from "next/navigation";
import { getBoard } from "@/modules/boards/actions";
import { BoardDetailClient } from "./board-detail-client";

export const dynamic = "force-dynamic";

interface BoardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { id } = await params;
  const board = await getBoard(id);

  if (!board) {
    notFound();
  }

  return <BoardDetailClient board={board} />;
}
