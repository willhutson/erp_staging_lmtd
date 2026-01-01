import { PageShell } from "@/components/ltd/patterns/page-shell"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Mail, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Real LMTD team members
const teamMembers = [
  {
    id: "1",
    name: "William Whitaker Hutson",
    email: "will@teamlmtd.com",
    role: "CEO",
    department: "Management",
    status: "active" as const,
    initials: "WH",
  },
  {
    id: "2",
    name: "Afaq Tariq",
    email: "afaq@teamlmtd.com",
    role: "CFO",
    department: "Management",
    status: "active" as const,
    initials: "AT",
  },
  {
    id: "3",
    name: "Theodore Totsidis",
    email: "ted@teamlmtd.com",
    role: "Executive Creative Director",
    department: "Creative & Design",
    status: "active" as const,
    initials: "TT",
  },
  {
    id: "4",
    name: "Cornel Jerome Holland",
    email: "cj@teamlmtd.com",
    role: "Client Servicing Director",
    department: "Client Servicing",
    status: "active" as const,
    initials: "CJ",
  },
  {
    id: "5",
    name: "Salma Ehab Ahmed",
    email: "salma@teamlmtd.com",
    role: "Strategy Director",
    department: "Client Servicing",
    status: "active" as const,
    initials: "SA",
  },
  {
    id: "6",
    name: "Klaudia Maria Pszczolinska",
    email: "klaudia@teamlmtd.com",
    role: "Design Director",
    department: "Creative & Design",
    status: "active" as const,
    initials: "KP",
  },
  {
    id: "7",
    name: "Albert Khoury",
    email: "albert@teamlmtd.com",
    role: "Workflow Optimization Lead",
    department: "HR & Operations",
    status: "active" as const,
    initials: "AK",
  },
  {
    id: "8",
    name: "Rozanne Jamaica Vasallo",
    email: "rozanne@teamlmtd.com",
    role: "Producer",
    department: "Video Production",
    status: "active" as const,
    initials: "RV",
  },
  {
    id: "9",
    name: "Haidy Hany Guirguis",
    email: "haidy@teamlmtd.com",
    role: "Account Director",
    department: "Client Servicing",
    status: "active" as const,
    initials: "HG",
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <PageShell
      title="Team"
      actions={
        <LtdButton>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </LtdButton>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div key={member.id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-ltd-primary text-ltd-primary-text">{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                  <div className="text-xs text-ltd-text-3">{member.department}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <LtdButton variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </LtdButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Member</DropdownMenuItem>
                  <DropdownMenuItem>Change Role</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
              <div className="flex items-center justify-between">
                <LtdBadge status={member.status === "active" ? "success" : "warning"}>{member.status}</LtdBadge>
                <LtdButton variant="outline" size="sm">
                  View Profile
                </LtdButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
