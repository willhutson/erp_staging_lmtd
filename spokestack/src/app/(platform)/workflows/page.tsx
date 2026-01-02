import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Kanban,
  LayoutTemplate,
  FolderKanban,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getWorkflowBoards, getMyWorkflowCards } from "@/modules/workflows/actions";

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
    const user = await getStudioUser();

    // Fetch real data from the database
    const [boards, myCards] = await Promise.all([
      getWorkflowBoards(),
      getMyWorkflowCards(),
    ]);

    const activeBoards = boards.filter((b) => !b.isArchived);

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Workflow Boards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team&apos;s processes with Monday.com-style boards
            </p>
          </div>
          <Button asChild>
            <Link href="/workflows/templates">
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Boards
              </CardTitle>
              <Kanban className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBoards.length}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Tasks
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCards.length}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Templates
              </CardTitle>
              <LayoutTemplate className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Ready to use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Boards List or Empty State */}
        {boards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Link key={board.id} href={`/workflows/${board.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{board.name}</CardTitle>
                      <Badge variant={board.isArchived ? "secondary" : "default"}>
                        {board.isArchived ? "Archived" : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {board.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{board._count?.columns || 0} columns</span>
                      <span>{board._count?.members || 0} members</span>
                    </div>
                    {board.client && (
                      <Badge variant="outline" className="mt-2">
                        {board.client.name}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                <Kanban className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No workflow boards yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Create your first workflow board from a template to start managing
                your team&apos;s processes visually.
              </p>
              <Button asChild>
                <Link href="/workflows/templates">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-blue-500" />
                My Workflows
              </CardTitle>
              <CardDescription>
                View and manage workflows assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/workflows/my">View My Workflows</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-purple-500" />
                Template Library
              </CardTitle>
              <CardDescription>
                Pre-built workflows for common agency processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/workflows/templates">Browse Templates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Workflows page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <WorkflowsError message={message} />;
  }
}
