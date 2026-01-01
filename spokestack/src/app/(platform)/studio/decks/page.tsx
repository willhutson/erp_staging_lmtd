import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Presentation, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudioDecksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
            <Presentation className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pitch Decks</h1>
            <p className="text-sm text-muted-foreground">Build presentations with AI assistance</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search decks..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-orange-500/10 mb-4">
              <Presentation className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No pitch decks yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Create your first pitch deck. Export to Google Slides when ready.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Deck
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
