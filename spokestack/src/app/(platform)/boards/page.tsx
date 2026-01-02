import { AlertTriangle } from "lucide-react";
import { getBoards, getMyCards } from "@/modules/boards/actions";
import { BoardsClient } from "./boards-client";

export const dynamic = "force-dynamic";

function BoardsError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Boards Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load boards. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function BoardsPage() {
  try {
    const [boards, myCards] = await Promise.all([
      getBoards(),
      getMyCards(),
    ]);

    return <BoardsClient initialBoards={boards} myCards={myCards} />;
  } catch (error) {
    console.error("Boards page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <BoardsError message={message} />;
  }
}
