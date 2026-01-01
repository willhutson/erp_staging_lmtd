import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudioDocsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground">Create and sync with Google Docs</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-blue-500/10 mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Create your first document to get started. Documents sync with Google Docs for real-time collaboration.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
