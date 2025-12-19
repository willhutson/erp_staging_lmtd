import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Linkedin,
  FileText,
  Clock,
} from "lucide-react";
import { ContactList } from "@/modules/crm/components/ContactList";
import { ActivityTimeline } from "@/modules/crm/components/ActivityTimeline";
import { ClientOnboardingChecklist } from "@/modules/onboarding/components/ClientOnboardingChecklist";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const relationshipStatusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  LEAD: { label: "Lead", color: "text-gray-600", bgColor: "bg-gray-100" },
  PROSPECT: { label: "Prospect", color: "text-blue-600", bgColor: "bg-blue-100" },
  ACTIVE: { label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
  AT_RISK: { label: "At Risk", color: "text-red-600", bgColor: "bg-red-100" },
  CHURNED: { label: "Churned", color: "text-gray-500", bgColor: "bg-gray-100" },
  DORMANT: { label: "Dormant", color: "text-yellow-600", bgColor: "bg-yellow-100" },
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const client = await db.client.findUnique({
    where: { id },
    include: {
      accountManager: {
        select: { id: true, name: true, email: true },
      },
      contacts: {
        where: { isActive: true },
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
      },
      activities: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      briefs: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          briefNumber: true,
          status: true,
          createdAt: true,
        },
      },
      onboarding: {
        include: {
          tasks: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      _count: {
        select: {
          briefs: true,
          projects: true,
        },
      },
    },
  });

  if (!client || client.organizationId !== session.user.organizationId) {
    notFound();
  }

  const statusConfig =
    relationshipStatusConfig[client.relationshipStatus] ||
    relationshipStatusConfig.ACTIVE;

  // Calculate total hours from briefs
  const timeEntries = await db.timeEntry.aggregate({
    where: {
      brief: {
        clientId: client.id,
      },
    },
    _sum: {
      hours: true,
    },
  });

  const totalHours = Number(timeEntries._sum.hours || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/clients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-500">{client.code}</p>
            </div>
            <span
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-full ml-2",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Briefs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {client._count.briefs}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Hours Logged</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalHours.toFixed(0)}h
          </p>
        </div>
        {client.isRetainer && client.retainerHours && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Monthly Retainer</p>
            <p className="text-2xl font-bold text-purple-600">
              {client.retainerHours}h
            </p>
          </div>
        )}
        {client.lifetimeValue && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Lifetime Value</p>
            <p className="text-2xl font-bold text-gray-900">
              AED {Number(client.lifetimeValue).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              {client.industry && (
                <div>
                  <dt className="text-gray-500">Industry</dt>
                  <dd className="text-gray-900">{client.industry}</dd>
                </div>
              )}
              {client.accountManager && (
                <div>
                  <dt className="text-gray-500">Account Manager</dt>
                  <dd className="text-gray-900">{client.accountManager.name}</dd>
                </div>
              )}
              {client.website && (
                <div>
                  <dt className="text-gray-500">Website</dt>
                  <dd>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1BA098] hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      {client.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
              {client.linkedIn && (
                <div>
                  <dt className="text-gray-500">LinkedIn</dt>
                  <dd>
                    <a
                      href={client.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1BA098] hover:underline flex items-center gap-1"
                    >
                      <Linkedin className="w-3 h-3" />
                      View Profile
                    </a>
                  </dd>
                </div>
              )}
              {client.leadSource && (
                <div>
                  <dt className="text-gray-500">Lead Source</dt>
                  <dd className="text-gray-900">
                    {client.leadSource.replace(/_/g, " ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contacts */}
          <ContactList contacts={client.contacts} clientId={client.id} />

          {/* Onboarding */}
          <ClientOnboardingChecklist
            clientId={client.id}
            onboarding={client.onboarding}
          />
        </div>

        {/* Right column - Activity & Recent briefs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity timeline */}
          <ActivityTimeline activities={client.activities} clientId={client.id} />

          {/* Recent briefs */}
          {client.briefs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Briefs</h2>
                <Link
                  href={`/briefs?client=${client.id}`}
                  className="text-sm text-[#1BA098] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {client.briefs.map((brief) => (
                  <Link
                    key={brief.id}
                    href={`/briefs/${brief.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{brief.title}</p>
                      <p className="text-xs text-gray-500">{brief.briefNumber}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {brief.status.replace(/_/g, " ")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
