"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createNPSSurvey } from "@/modules/nps/actions/nps-actions";

interface Client {
  id: string;
  name: string;
  code: string;
  contacts: { id: string; name: string; email: string | null }[];
}

interface NewSurveyFormProps {
  clients: Client[];
  defaultYear: number;
  defaultQuarter: number;
}

export function NewSurveyForm({ clients, defaultYear, defaultQuarter }: NewSurveyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [contactId, setContactId] = useState("");
  const [quarter, setQuarter] = useState(String(defaultQuarter));
  const [year, setYear] = useState(String(defaultYear));

  const selectedClient = clients.find((c) => c.id === clientId);
  const contacts = selectedClient?.contacts || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Please select a client");
      return;
    }

    startTransition(async () => {
      try {
        await createNPSSurvey({
          clientId,
          quarter: parseInt(quarter),
          year: parseInt(year),
          sentToId: contactId || undefined,
        });
        router.push("/feedback/nps");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create survey");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client */}
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setContactId(""); }}>
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

          {/* Contact */}
          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label>NPS Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.email && `(${contact.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                These are contacts marked as NPS designees for this client
              </p>
            </div>
          )}

          {/* Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quarter</Label>
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
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(defaultYear - 1)}>{defaultYear - 1}</SelectItem>
                  <SelectItem value={String(defaultYear)}>{defaultYear}</SelectItem>
                  <SelectItem value={String(defaultYear + 1)}>{defaultYear + 1}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#52EDC7] text-gray-900 hover:bg-[#1BA098] hover:text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Survey"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
