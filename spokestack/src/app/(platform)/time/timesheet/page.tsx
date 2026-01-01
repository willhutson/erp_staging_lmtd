import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const projects = [
  { id: "1", name: "CCAD - Social Media", client: "CCAD", color: "bg-blue-500" },
  { id: "2", name: "DET - Campaign", client: "DET", color: "bg-green-500" },
  { id: "3", name: "ADEK - Video", client: "ADEK", color: "bg-purple-500" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function TimesheetPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Timesheet</h1>
            <p className="text-sm text-muted-foreground">Weekly time tracking view</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-semibold ml-2">Dec 30 - Jan 5, 2025</span>
              <Badge variant="outline" className="ml-2">This Week</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">0h 0m</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Timesheet Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[200px]">Project</th>
                  {weekDays.map((day, i) => (
                    <th key={day} className="text-center py-3 px-2 font-medium text-muted-foreground min-w-[80px]">
                      <div>{day}</div>
                      <div className="text-xs">{30 + i > 31 ? i - 1 : 30 + i}</div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${project.color}`} />
                        <div>
                          <div className="font-medium text-sm">{project.name}</div>
                          <div className="text-xs text-muted-foreground">{project.client}</div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => (
                      <td key={day} className="text-center py-2 px-2">
                        <input
                          type="text"
                          placeholder="-"
                          className="w-full text-center py-1 px-2 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none text-sm bg-transparent"
                        />
                      </td>
                    ))}
                    <td className="text-center py-3 px-4 font-medium">0h</td>
                  </tr>
                ))}
                {/* Add row button */}
                <tr>
                  <td colSpan={9} className="py-3 px-4">
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add project row
                    </Button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td className="py-3 px-4 font-medium">Daily Total</td>
                  {weekDays.map((day) => (
                    <td key={day} className="text-center py-3 px-2 font-medium">0h</td>
                  ))}
                  <td className="text-center py-3 px-4 font-bold">0h</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0h</div>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">40h</div>
            <p className="text-sm text-muted-foreground">Target Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">0%</div>
            <p className="text-sm text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Projects Logged</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
