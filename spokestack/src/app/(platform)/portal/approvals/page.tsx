"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Download,
  Eye,
  Calendar,
  User,
  FileImage,
  FileVideo,
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";

// Mock approval items
const APPROVAL_ITEMS = [
  {
    id: "1",
    title: "Q1 Social Media Campaign Assets",
    description: "10 Instagram posts, 5 stories, and 3 carousel designs for the winter campaign",
    type: "Design",
    project: "Winter Campaign 2026",
    submittedBy: "CJ Ocampo",
    submittedAt: "Dec 27, 2025",
    dueDate: "Dec 30, 2025",
    status: "pending",
    files: [
      { name: "IG_Post_01.png", type: "image" },
      { name: "IG_Post_02.png", type: "image" },
      { name: "Story_01.png", type: "image" },
    ],
    comments: 2,
    revision: 1,
  },
  {
    id: "2",
    title: "Brand Video - 60s Cut",
    description: "Final cut of the 60-second brand awareness video with music and VFX",
    type: "Video",
    project: "Brand Refresh",
    submittedBy: "Ted Vicencio",
    submittedAt: "Dec 26, 2025",
    dueDate: "Dec 31, 2025",
    status: "pending",
    files: [
      { name: "Brand_Video_60s_v3.mp4", type: "video" },
    ],
    comments: 5,
    revision: 3,
  },
  {
    id: "3",
    title: "Website Copy - Homepage",
    description: "Hero section, features section, and CTA copy for the new homepage",
    type: "Copy",
    project: "Website Redesign",
    submittedBy: "Ahmed Ali",
    submittedAt: "Dec 25, 2025",
    dueDate: "Jan 2, 2026",
    status: "revision",
    files: [
      { name: "Homepage_Copy_v2.docx", type: "document" },
    ],
    comments: 8,
    revision: 2,
    revisionNote: "Please update the hero tagline to be more action-oriented",
  },
];

const APPROVED_ITEMS = [
  {
    id: "4",
    title: "Instagram Story Templates",
    type: "Design",
    project: "Social Templates",
    approvedAt: "Dec 26, 2025",
  },
  {
    id: "5",
    title: "LinkedIn Article - Industry Trends",
    type: "Copy",
    project: "Thought Leadership",
    approvedAt: "Dec 24, 2025",
  },
];

function getTypeIcon(type: string) {
  switch (type) {
    case "Design":
      return <FileImage className="h-4 w-4" />;
    case "Video":
      return <FileVideo className="h-4 w-4" />;
    case "Copy":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "Design":
      return "bg-pink-500";
    case "Video":
      return "bg-red-500";
    case "Copy":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

export default function ApprovalsPage() {
  const [selectedItem, setSelectedItem] = useState<typeof APPROVAL_ITEMS[0] | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "revision">("approve");

  const handleAction = (type: "approve" | "reject" | "revision", item: typeof APPROVAL_ITEMS[0]) => {
    setSelectedItem(item);
    setActionType(type);
    setFeedbackDialog(true);
  };

  const submitAction = () => {
    // In real app, would submit to API
    console.log({ action: actionType, item: selectedItem, feedback });
    setFeedbackDialog(false);
    setFeedback("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve deliverables from your team
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
            <Badge className="ml-1 h-5 px-1.5">{APPROVAL_ITEMS.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {APPROVAL_ITEMS.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className={`h-1 ${getTypeColor(item.type)}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {item.status === "revision" && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Revision Requested
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    {item.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.submittedBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due {item.dueDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {item.comments} comments
                  </div>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-4 w-4" />
                    Revision {item.revision}
                  </div>
                </div>

                {/* Revision note if any */}
                {item.revisionNote && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Previous feedback:</strong> {item.revisionNote}
                    </p>
                  </div>
                )}

                {/* Files preview */}
                <div className="flex flex-wrap gap-2">
                  {item.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm"
                    >
                      {file.type === "image" && <FileImage className="h-4 w-4 text-pink-500" />}
                      {file.type === "video" && <FileVideo className="h-4 w-4 text-red-500" />}
                      {file.type === "document" && <FileText className="h-4 w-4 text-blue-500" />}
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-600 hover:text-amber-700"
                      onClick={() => handleAction("revision", item)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Request Revision
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleAction("reject", item)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction("approve", item)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {APPROVED_ITEMS.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.project} • Approved {item.approvedAt}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rejected items</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Deliverable"}
              {actionType === "reject" && "Reject Deliverable"}
              {actionType === "revision" && "Request Revision"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Add optional feedback for the team."}
              {actionType === "reject" && "Please provide a reason for rejection."}
              {actionType === "revision" && "Describe what changes are needed."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={
                actionType === "approve"
                  ? "Great work! (optional)"
                  : "Enter your feedback..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "revision" && "Request Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
