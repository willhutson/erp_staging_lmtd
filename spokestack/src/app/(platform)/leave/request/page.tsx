"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Loader2, Palmtree, Stethoscope, Baby, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEAVE_TYPES = [
  { id: "annual", label: "Annual Leave", icon: Palmtree, description: "Vacation and personal time off" },
  { id: "sick", label: "Sick Leave", icon: Stethoscope, description: "Health-related absences" },
  { id: "personal", label: "Personal Leave", icon: CalendarDays, description: "Personal matters and emergencies" },
  { id: "parental", label: "Parental Leave", icon: Baby, description: "Maternity or paternity leave" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function RequestLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Leave request submitted successfully");
    router.push("/leave");
  };

  // Calculate days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leave">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Leave</h1>
          <p className="text-muted-foreground">
            Submit a new leave request for approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Type</CardTitle>
            <CardDescription>Select the type of leave you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {LEAVE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = leaveType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setLeaveType(type.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <div>
                      <p className={cn("font-medium", isSelected && "text-primary")}>{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
            <CardDescription>Select the start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {startDate && endDate && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  Total: <span className="font-semibold">{calculateDays()} day(s)</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reason (Optional)</CardTitle>
            <CardDescription>Provide additional context for your request</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for leave..."
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/leave">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || !leaveType || !startDate || !endDate}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
