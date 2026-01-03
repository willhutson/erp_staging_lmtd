import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Demo team availability data
const TEAM_AVAILABILITY = [
  {
    id: "1",
    name: "Ted Vicencio",
    role: "Senior Editor",
    department: "Video",
    status: "available",
    capacity: 60,
    currentProjects: 2,
    nextAvailable: null,
  },
  {
    id: "2",
    name: "Salma Hassan",
    role: "Copywriter",
    department: "Copy",
    status: "busy",
    capacity: 95,
    currentProjects: 4,
    nextAvailable: "Jan 10",
  },
  {
    id: "3",
    name: "Matthew Reynolds",
    role: "Motion Designer",
    department: "Video",
    status: "available",
    capacity: 40,
    currentProjects: 1,
    nextAvailable: null,
  },
  {
    id: "4",
    name: "Afaq Ahmed",
    role: "Senior Designer",
    department: "Design",
    status: "leave",
    capacity: 0,
    currentProjects: 0,
    nextAvailable: "Jan 8",
  },
  {
    id: "5",
    name: "CJ Ocampo",
    role: "Creative Director",
    department: "Creative",
    status: "available",
    capacity: 30,
    currentProjects: 1,
    nextAvailable: null,
  },
  {
    id: "6",
    name: "Nadia Al-Farsi",
    role: "Arabic Copywriter",
    department: "Copy",
    status: "busy",
    capacity: 85,
    currentProjects: 3,
    nextAvailable: "Jan 12",
  },
];

const statusConfig = {
  available: { label: "Available", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  busy: { label: "At Capacity", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  leave: { label: "On Leave", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function getCapacityColor(capacity: number) {
  if (capacity < 50) return "bg-emerald-500";
  if (capacity < 75) return "bg-amber-500";
  return "bg-red-500";
}

export default function AvailabilityPage() {
  const availableCount = TEAM_AVAILABILITY.filter(t => t.status === "available").length;
  const busyCount = TEAM_AVAILABILITY.filter(t => t.status === "busy").length;
  const onLeaveCount = TEAM_AVAILABILITY.filter(t => t.status === "leave").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Team Availability</h1>
        <p className="text-muted-foreground">Real-time view of team capacity and availability</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Team</span>
            </div>
            <div className="text-3xl font-bold">{TEAM_AVAILABILITY.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Available</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{availableCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">At Capacity</span>
            </div>
            <div className="text-3xl font-bold text-amber-600">{busyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">On Leave</span>
            </div>
            <div className="text-3xl font-bold text-slate-600">{onLeaveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEAM_AVAILABILITY.map((member) => {
              const status = statusConfig[member.status as keyof typeof statusConfig];
              return (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{member.name}</p>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.department}</p>
                    </div>
                  </div>

                  {member.status !== "leave" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{member.capacity}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all ${getCapacityColor(member.capacity)}`}
                          style={{ width: `${member.capacity}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{member.currentProjects} active projects</span>
                        {member.nextAvailable && (
                          <span>Free: {member.nextAvailable}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {member.status === "leave" && member.nextAvailable && (
                    <div className="mt-4 p-2 rounded-lg bg-muted text-center text-sm">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Returns {member.nextAvailable}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
