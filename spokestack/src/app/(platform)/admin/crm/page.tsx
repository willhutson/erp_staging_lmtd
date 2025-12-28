import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Handshake, CheckSquare, ArrowRight } from "lucide-react";

const CRM_MODULES = [
  {
    id: "companies",
    label: "Companies",
    description: "Manage client companies and accounts",
    icon: Building2,
    href: "/admin/crm/companies",
    color: "bg-blue-500",
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Client contacts and stakeholders",
    icon: Users,
    href: "/admin/crm/contacts",
    color: "bg-green-500",
  },
  {
    id: "deals",
    label: "Deals",
    description: "Track opportunities and pipeline",
    icon: Handshake,
    href: "/admin/crm/deals",
    color: "bg-purple-500",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Follow-ups and action items",
    icon: CheckSquare,
    href: "/admin/crm/tasks",
    color: "bg-orange-500",
  },
];

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">
          Manage client relationships, deals, and communications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CRM_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.id} href={module.href}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {module.label}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
