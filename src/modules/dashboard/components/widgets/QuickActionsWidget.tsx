import Link from "next/link";
import { Clock, FileText, Users, FileStack } from "lucide-react";

const actions = [
  {
    label: "New Brief",
    href: "/briefs/new",
    icon: FileText,
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    label: "Log Time",
    href: "/time",
    icon: Clock,
    color: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    label: "New Client",
    href: "/clients/new",
    icon: Users,
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
  {
    label: "New RFP",
    href: "/rfp/new",
    icon: FileStack,
    color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  },
];

export function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-colors ${action.color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
