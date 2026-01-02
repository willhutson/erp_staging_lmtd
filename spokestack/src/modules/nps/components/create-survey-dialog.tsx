"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createNPSSurvey } from "../actions";

interface Client {
  id: string;
  name: string;
  code: string;
}

interface Contact {
  id: string;
  name: string;
  email: string | null;
}

interface CreateSurveyDialogProps {
  clients: Client[];
  contacts?: Contact[];
}

const currentYear = new Date().getFullYear();
const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

export function CreateSurveyDialog({ clients, contacts = [] }: CreateSurveyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState<string>("");
  const [quarter, setQuarter] = useState<string>(String(currentQuarter));
  const [year, setYear] = useState<string>(String(currentYear));
  const [sentToId, setSentToId] = useState<string>("");

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    startTransition(async () => {
      try {
        await createNPSSurvey({
          clientId,
          quarter: parseInt(quarter),
          year: parseInt(year),
          sentToId: sentToId || undefined,
        });
        toast.success("Survey created successfully");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create survey");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Survey
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create NPS Survey</DialogTitle>
          <DialogDescription>
            Create a new quarterly NPS survey for a client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(currentYear - 1)}>{currentYear - 1}</SelectItem>
                  <SelectItem value={String(currentYear)}>{currentYear}</SelectItem>
                  <SelectItem value={String(currentYear + 1)}>{currentYear + 1}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="sentTo">Send To (Optional)</Label>
              <Select value={sentToId} onValueChange={setSentToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.email ? `(${contact.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
