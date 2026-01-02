"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Kanban,
  LayoutTemplate,
  FolderKanban,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { BoardWithRelations, BoardCardWithRelations } from "@/modules/boards/types";
import { createBoard } from "@/modules/boards/actions";

interface BoardsClientProps {
  initialBoards: BoardWithRelations[];
  myCards: BoardCardWithRelations[];
}

export function BoardsClient({ initialBoards, myCards }: BoardsClientProps) {
  const router = useRouter();
  const [boards, setBoards] = useState(initialBoards);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const activeBoards = boards.filter((b) => !b.isArchived);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    startTransition(async () => {
      try {
        const board = await createBoard({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        });

        toast.success("Board created successfully!");
        setIsCreateDialogOpen(false);
        setNewName("");
        setNewDescription("");
        router.push(`/boards/${board.id}`);
      } catch (error) {
        console.error("Failed to create board:", error);
        toast.error("Failed to create board. Please try again.");
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Boards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your team&apos;s tasks with Kanban-style boards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/boards/templates">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Board
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Project Board</DialogTitle>
            <DialogDescription>
              Create a new board to manage your team&apos;s tasks
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Board Name</Label>
              <Input
                id="name"
                placeholder="e.g., Content Production"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this board for?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Want pre-configured columns?{" "}
              <Link
                href="/boards/templates"
                className="text-primary hover:underline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Start from a template
              </Link>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !newName.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              My Cards
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
            <Link key={board.id} href={`/boards/${board.id}`}>
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
            <h3 className="text-lg font-semibold mb-2">No project boards yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Create your first project board to start managing
              your team&apos;s tasks visually.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/boards/templates">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-500" />
              My Cards
            </CardTitle>
            <CardDescription>
              View and manage cards assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/boards/my">View My Cards</Link>
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
              Pre-built boards for common agency processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/boards/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
