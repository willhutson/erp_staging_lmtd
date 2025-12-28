"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  List,
  LayoutGrid,
  GanttChart,
  Clock,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Upload,
  FileStack,
  FileText,
  X,
  Loader2,
  Plus,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy RFP data
const DUMMY_RFPS = [
  { id: "1", name: "Dubai Tourism Campaign 2026", clientName: "Dubai Tourism", value: 850000, deadline: "2026-01-15", status: "ACTIVE", probability: "HIGH", tasks: 12, completedTasks: 4 },
  { id: "2", name: "Abu Dhabi Sports Council Rebrand", clientName: "ADSC", value: 420000, deadline: "2026-01-20", status: "VETTING", probability: "MEDIUM", tasks: 8, completedTasks: 0 },
  { id: "3", name: "Sharjah Museums Digital Experience", clientName: "Sharjah Museums", value: 680000, deadline: "2026-02-01", status: "AWAITING_REVIEW", probability: "HIGH", tasks: 15, completedTasks: 10 },
  { id: "4", name: "RAK Tourism Video Series", clientName: "RAK Tourism", value: 320000, deadline: "2026-01-25", status: "READY_TO_SUBMIT", probability: "MEDIUM", tasks: 6, completedTasks: 6 },
  { id: "5", name: "Ajman Media Hub Launch", clientName: "Ajman Media", value: 250000, deadline: "2026-02-10", status: "SUBMITTED", probability: "LOW", tasks: 10, completedTasks: 10 },
  { id: "6", name: "UAE Space Agency Documentary", clientName: "MBRSC", value: 1200000, deadline: "2026-01-30", status: "AWAITING_RESPONSE", probability: "HIGH", tasks: 20, completedTasks: 20 },
  { id: "7", name: "Emirates NBD Brand Campaign", clientName: "Emirates NBD", value: 550000, deadline: "2026-02-15", status: "ACTIVE", probability: "MEDIUM", tasks: 9, completedTasks: 2 },
  { id: "8", name: "Etisalat 5G Experience Center", clientName: "Etisalat", value: 780000, deadline: "2026-01-18", status: "VETTING", probability: "HIGH", tasks: 14, completedTasks: 0 },
];

const STATUSES = [
  { id: "VETTING", label: "Vetting", color: "bg-slate-500" },
  { id: "ACTIVE", label: "Active", color: "bg-blue-500" },
  { id: "AWAITING_REVIEW", label: "Review", color: "bg-purple-500" },
  { id: "READY_TO_SUBMIT", label: "Ready", color: "bg-amber-500" },
  { id: "SUBMITTED", label: "Submitted", color: "bg-cyan-500" },
  { id: "AWAITING_RESPONSE", label: "Awaiting", color: "bg-indigo-500" },
];

type ViewMode = "kanban" | "list" | "timeline";

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getStatusBadge(status: string) {
  const statusConfig = STATUSES.find((s) => s.id === status);
  return <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>;
}

function getProbabilityBadge(probability: string) {
  switch (probability) {
    case "HIGH":
      return <Badge className="bg-green-500">High</Badge>;
    case "MEDIUM":
      return <Badge className="bg-amber-500">Medium</Badge>;
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    default:
      return null;
  }
}

// RFP Form Component
interface RFPFormProps {
  onClose: () => void;
  droppedFiles?: File[];
}

function RFPForm({ onClose, droppedFiles = [] }: RFPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientName, setClientName] = useState("");
  const [portal, setPortal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [requirements, setRequirements] = useState("");
  const [bidBondRequired, setBidBondRequired] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, this would call a server action
    console.log("Creating RFP:", {
      name: `RFP – ${clientName}`,
      clientName,
      portal,
      deadline,
      estimatedValue,
      scopeOfWork,
      requirements,
      bidBondRequired,
      notes,
      attachedFiles: droppedFiles.map((f) => f.name),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {droppedFiles.length > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <FileStack className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{droppedFiles.length} document(s) attached</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {droppedFiles.map((file, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                {file.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client / Entity Name *</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g., Dubai South"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portal">Portal / Source</Label>
          <Input
            id="portal"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            placeholder="Where did you receive this RFP?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline *</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Estimated Value (AED)</Label>
          <Input
            id="estimatedValue"
            type="number"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
            placeholder="e.g., 500000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scopeOfWork">Scope of Work</Label>
        <Textarea
          id="scopeOfWork"
          value={scopeOfWork}
          onChange={(e) => setScopeOfWork(e.target.value)}
          rows={4}
          placeholder="Describe the scope of work required..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder="Key requirements or criteria..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="bidBond"
          checked={bidBondRequired}
          onCheckedChange={(checked) => setBidBondRequired(checked as boolean)}
        />
        <Label htmlFor="bidBond" className="cursor-pointer">
          Bid bond required
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || !clientName || !deadline}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating..." : "Create RFP"}
        </Button>
      </div>
    </form>
  );
}

// Document Drop Zone Component
interface DocumentDropZoneProps {
  onFilesDropped: (files: File[]) => void;
}

function DocumentDropZone({ onFilesDropped }: DocumentDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setDroppedFiles(files);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDroppedFiles(files);
    }
  }, []);

  const removeFile = (index: number) => {
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onFilesDropped(droppedFiles);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    // Would trigger extraction and auto-fill in real implementation
    onFilesDropped(droppedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  // If files are selected, show the file list with continue button
  if (droppedFiles.length > 0) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileStack className="h-5 w-5 text-primary" />
                {droppedFiles.length} document{droppedFiles.length > 1 ? "s" : ""} ready
              </CardTitle>
              <CardDescription>
                These will be attached to your new RFP
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    AI Extract
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleContinue}>
                Continue to RFP
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {droppedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-background rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[300px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <label className="text-sm text-primary hover:underline cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
              />
              + Add more files
            </label>
            <Button variant="ghost" size="sm" onClick={() => setDroppedFiles([])}>
              Clear all
            </Button>
          </div>

          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-700 dark:text-purple-300">AI-Powered Extraction Coming Soon</p>
                <p className="text-muted-foreground">
                  Our AI agents will automatically extract key details like deadlines, requirements, and scope from your RFP documents.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state with drop zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border-2 border-dashed p-8 text-center transition-all",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors",
          isDragging ? "bg-primary/20" : "bg-muted"
        )}
      >
        {isDragging ? (
          <Upload className="w-7 h-7 text-primary animate-bounce" />
        ) : (
          <FileStack className="w-7 h-7 text-muted-foreground" />
        )}
      </div>

      {isDragging ? (
        <p className="text-lg font-medium text-primary">Drop files here</p>
      ) : (
        <>
          <p className="font-medium mb-2">
            Drag & drop RFP documents to get started
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Our AI will help extract key details from your documents
          </p>
          <div className="flex items-center justify-center gap-3">
            <label>
              <Button variant="default" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </span>
              </Button>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Supports PDF, Word, Excel, and PowerPoint files
          </p>
        </>
      )}
    </div>
  );
}

export function RfpView() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showForm, setShowForm] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const handleFilesDropped = (files: File[]) => {
    setDroppedFiles(files);
    setShowForm(true);
  };

  const handleNewRfp = () => {
    setDroppedFiles([]);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setDroppedFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Document Drop Zone */}
      <DocumentDropZone onFilesDropped={handleFilesDropped} />

      {/* View Switcher and New RFP Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Pipeline
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === "timeline" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="gap-2"
          >
            <GanttChart className="h-4 w-4" />
            Timeline
          </Button>
        </div>

        <Button onClick={handleNewRfp}>
          <Plus className="mr-2 h-4 w-4" />
          New RFP
        </Button>
      </div>

      {/* Views */}
      {viewMode === "kanban" && <KanbanView rfps={DUMMY_RFPS} />}
      {viewMode === "list" && <ListView rfps={DUMMY_RFPS} />}
      {viewMode === "timeline" && <TimelineView rfps={DUMMY_RFPS} />}

      {/* New RFP Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New RFP</DialogTitle>
            <DialogDescription>
              Create a new request for proposal to track in your pipeline
            </DialogDescription>
          </DialogHeader>
          <RFPForm onClose={handleCloseForm} droppedFiles={droppedFiles} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusRfps = rfps.filter((r) => r.status === status.id);
        const totalValue = statusRfps.reduce((sum, r) => sum + r.value, 0);
        return (
          <div key={status.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className="font-medium text-sm">{status.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{statusRfps.length}</Badge>
                {totalValue > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {formatCurrency(totalValue)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
              {statusRfps.map((rfp) => (
                <Card
                  key={rfp.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{rfp.name}</h4>
                      {getProbabilityBadge(rfp.probability)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{rfp.clientName}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{rfp.completedTasks}/{rfp.tasks} tasks</span>
                      </div>
                      <Progress value={(rfp.completedTasks / rfp.tasks) * 100} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs">
                      <span className="font-medium text-green-600">{formatCurrency(rfp.value)}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(rfp.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {statusRfps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No RFPs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFP</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfps.map((rfp) => (
              <TableRow key={rfp.id}>
                <TableCell>
                  <Link href={`/rfp/${rfp.id}`} className="font-medium hover:underline">
                    {rfp.name}
                  </Link>
                </TableCell>
                <TableCell>{rfp.clientName}</TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">{formatCurrency(rfp.value)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(rfp.completedTasks / rfp.tasks) * 100} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">
                      {rfp.completedTasks}/{rfp.tasks}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {new Date(rfp.deadline).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{getProbabilityBadge(rfp.probability)}</TableCell>
                <TableCell>{getStatusBadge(rfp.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trophy className="h-4 w-4 mr-2 text-green-500" />
                        Mark as Won
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Mark as Lost</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TimelineView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Sort RFPs by deadline
  const sortedRfps = [...rfps].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const getBarPosition = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffDays = Math.floor((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, 41));
  };

  const getStatusColor = (status: string) => {
    const statusConfig = STATUSES.find((s) => s.id === status);
    return statusConfig?.color || "bg-slate-500";
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-64 flex-shrink-0 p-3 border-r font-medium text-sm">
              RFP
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isMonthStart = day.getDate() === 1;
                return (
                  <div
                    key={i}
                    className={`flex-1 p-1 text-center text-[10px] border-r ${
                      isToday ? "bg-primary/10" : isWeekend ? "bg-muted/50" : ""
                    } ${isMonthStart ? "border-l-2 border-l-primary/50" : ""}`}
                  >
                    {(i === 0 || isMonthStart) && (
                      <div className="text-muted-foreground font-medium">
                        {day.toLocaleDateString("en", { month: "short" })}
                      </div>
                    )}
                    <div className={isToday ? "text-primary font-medium" : ""}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {sortedRfps.map((rfp) => {
            const pos = getBarPosition(rfp.deadline);
            return (
              <div key={rfp.id} className="flex border-b hover:bg-muted/20">
                <div className="w-64 flex-shrink-0 p-3 border-r">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <Link href={`/rfp/${rfp.id}`} className="font-medium text-sm hover:underline truncate block">
                        {rfp.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{rfp.clientName}</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 flex-shrink-0 ml-2">
                      {formatCurrency(rfp.value)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative h-14">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, i) => {
                      const isToday = day.toDateString() === today.toDateString();
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={`flex-1 border-r ${
                            isToday ? "bg-primary/5" : isWeekend ? "bg-muted/30" : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                  {/* Deadline marker */}
                  <div
                    className={`absolute top-2 h-10 rounded-lg px-2 flex items-center gap-2 text-white text-xs ${getStatusColor(rfp.status)}`}
                    style={{
                      left: `${Math.max(0, (pos - 5) / 42) * 100}%`,
                      width: `${(6 / 42) * 100}%`,
                    }}
                  >
                    <Progress
                      value={(rfp.completedTasks / rfp.tasks) * 100}
                      className="h-1.5 flex-1 bg-white/30"
                    />
                    <span className="text-[10px]">{Math.round((rfp.completedTasks / rfp.tasks) * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
