"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { format } from "date-fns";
import type { WorkflowBoardWithRelations } from "@/modules/workflows/types";

interface WorkflowBoardClientProps {
  board: WorkflowBoardWithRelations;
}

export function WorkflowBoardClient({ board }: WorkflowBoardClientProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{board.name}</h1>
              <Badge variant={board.isArchived ? "secondary" : "default"}>
                {board.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
            {board.description && (
              <p className="text-sm text-muted-foreground">{board.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Members */}
          <div className="flex -space-x-2 mr-2">
            {board.members?.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.user.avatarUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {member.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {(board.members?.length || 0) > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{(board.members?.length || 0) - 5}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Invite
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Board Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {board.columns?.map((column) => (
            <div
              key={column.id}
              className="w-80 flex flex-col bg-muted/50 rounded-lg"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color || "#6b7280" }}
                  />
                  <h3 className="font-medium">{column.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.cards?.length || 0}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {column.cards?.map((card) => (
                  <Card
                    key={card.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCard(card.id)}
                  >
                    <CardContent className="p-3">
                      {/* Priority indicator */}
                      <div
                        className={`h-1 w-full rounded-full mb-2 ${getPriorityColor(card.priority)}`}
                      />

                      {/* Title */}
                      <h4 className="font-medium text-sm mb-2">{card.title}</h4>

                      {/* Description preview */}
                      {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {card.description}
                        </p>
                      )}

                      {/* Labels */}
                      {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {card.labels.slice(0, 3).map((label, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {card.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(card.dueDate), "MMM d")}
                            </span>
                          )}
                          {(card._count?.comments || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {card._count?.comments}
                            </span>
                          )}
                          {(card._count?.attachments || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {card._count?.attachments}
                            </span>
                          )}
                          {(card._count?.checklists || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              {card._count?.checklists}
                            </span>
                          )}
                        </div>
                        {card.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={card.assignee.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {card.assignee.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Card Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="w-80 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {(!board.columns || board.columns.length === 0) && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No columns yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first column to start organizing your workflow
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
