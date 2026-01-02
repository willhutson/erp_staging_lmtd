import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  Calendar,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { getMyCards } from "@/modules/boards/actions";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

function PageError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Unable to Load</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
      </div>
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default async function MyCardsPage() {
  try {
    const user = await getStudioUser();

    const cards = await getMyCards();

    // Group cards by priority
    const urgentCards = cards.filter((c) => c.priority === "URGENT");
    const highCards = cards.filter((c) => c.priority === "HIGH");
    const mediumCards = cards.filter((c) => c.priority === "MEDIUM");
    const lowCards = cards.filter((c) => c.priority === "LOW");

    // Cards due soon (within 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueSoon = cards.filter(
      (c) => c.dueDate && new Date(c.dueDate) <= weekFromNow
    );

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/boards"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks assigned to you across all project boards
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cards
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Urgent
              </CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentCards.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due Soon
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dueSoon.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highCards.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        {cards.length > 0 ? (
          <div className="space-y-6">
            {/* Urgent Tasks */}
            {urgentCards.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-red-600">
                  Urgent ({urgentCards.length})
                </h2>
                <div className="grid gap-3">
                  {urgentCards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Tasks */}
            {highCards.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-orange-600">
                  High Priority ({highCards.length})
                </h2>
                <div className="grid gap-3">
                  {highCards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority Tasks */}
            {mediumCards.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Medium Priority ({mediumCards.length})
                </h2>
                <div className="grid gap-3">
                  {mediumCards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority Tasks */}
            {lowCards.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-500">
                  Low Priority ({lowCards.length})
                </h2>
                <div className="grid gap-3">
                  {lowCards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No cards assigned</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                You don&apos;t have any cards assigned to you yet.
              </p>
              <Button asChild>
                <Link href="/boards">
                  View All Boards
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("My Cards page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PageError message={message} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TaskCard({ card }: { card: any }) {
  const boardId = card.column?.board?.id;
  const boardName = card.column?.board?.name;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{card.title}</h3>
              <Badge className={PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.MEDIUM}>
                {card.priority}
              </Badge>
            </div>
            {card.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {card.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {boardName && (
                <span className="flex items-center gap-1">
                  <FolderKanban className="h-3 w-3" />
                  {boardName}
                </span>
              )}
              {card.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {formatDistanceToNow(new Date(card.dueDate), { addSuffix: true })}
                </span>
              )}
              {card._count?.comments > 0 && (
                <span>{card._count.comments} comments</span>
              )}
            </div>
          </div>
          {boardId && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/boards/${boardId}`}>View Board</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
