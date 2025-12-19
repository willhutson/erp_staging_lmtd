import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  FileText,
  Shield,
  Clock,
  Users,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const visaStatusLabels: Record<string, string> = {
  EMPLOYMENT: "Employment Visa",
  INVESTOR: "Investor Visa",
  GOLDEN: "Golden Visa",
  FREELANCE: "Freelance Visa",
  DEPENDENT: "Dependent Visa",
  VISIT: "Visit Visa",
  NOT_APPLICABLE: "N/A",
};

const maritalStatusLabels: Record<string, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  DIVORCED: "Divorced",
  WIDOWED: "Widowed",
};

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERN: "Intern",
};

function isExpiringSoon(date: Date | null): boolean {
  if (!date) return false;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return new Date(date).getTime() - Date.now() < thirtyDays;
}

function isExpired(date: Date | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id },
    include: {
      teamLead: {
        select: { id: true, name: true },
      },
      teamMembers: {
        select: { id: true, name: true, role: true, avatarUrl: true },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      managedClients: {
        select: { id: true, name: true, code: true },
        where: { isActive: true },
      },
      _count: {
        select: {
          briefsAssigned: true,
          briefsCreated: true,
          timeEntries: true,
        },
      },
    },
  });

  if (!user || user.organizationId !== session.user.organizationId) {
    notFound();
  }

  const canViewSensitive =
    session.user.permissionLevel === "ADMIN" ||
    session.user.permissionLevel === "LEADERSHIP" ||
    session.user.id === user.id;

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/team"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#52EDC7] flex items-center justify-center text-gray-900 font-bold text-xl">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {user.department}
                </span>
                {user.isFreelancer && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    Freelancer
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  {employmentTypeLabels[user.employmentType]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">Active Briefs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user._count.briefsAssigned}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Clients Managed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.managedClients.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Weekly Capacity</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.weeklyCapacity}h
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Team Size</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.teamMembers.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Contact</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${user.email}`}
                  className="text-[#1BA098] hover:underline"
                >
                  {user.email}
                </a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${user.phone}`}
                    className="text-gray-900 hover:underline"
                  >
                    {user.phone}
                  </a>
                </div>
              )}
              {user.emergencyContact && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs mb-1">Emergency Contact</p>
                  <p className="text-gray-900">{user.emergencyContact}</p>
                  {user.emergencyPhone && (
                    <p className="text-gray-500">{user.emergencyPhone}</p>
                  )}
                </div>
              )}
            </dl>
          </div>

          {/* Personal info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Personal</h2>
            <dl className="space-y-3 text-sm">
              {user.dateOfBirth && (
                <div>
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="text-gray-900">{formatDate(user.dateOfBirth)}</dd>
                </div>
              )}
              {user.nationality && (
                <div>
                  <dt className="text-gray-500">Nationality</dt>
                  <dd className="text-gray-900">{user.nationality}</dd>
                </div>
              )}
              {user.maritalStatus && (
                <div>
                  <dt className="text-gray-500">Marital Status</dt>
                  <dd className="text-gray-900">
                    {maritalStatusLabels[user.maritalStatus]}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Team */}
          {(user.teamLead || user.teamMembers.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Team</h2>
              {user.teamLead && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Reports to</p>
                  <Link
                    href={`/team/${user.teamLead.id}`}
                    className="text-sm text-[#1BA098] hover:underline"
                  >
                    {user.teamLead.name}
                  </Link>
                </div>
              )}
              {user.teamMembers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Direct reports</p>
                  <div className="space-y-2">
                    {user.teamMembers.map((member) => (
                      <Link
                        key={member.id}
                        href={`/team/${member.id}`}
                        className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#52EDC7] flex items-center justify-center text-xs font-medium text-gray-900">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="text-gray-900">{member.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Employment</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Start Date</dt>
                <dd className="text-gray-900 font-medium">
                  {formatDate(user.startDate)}
                </dd>
              </div>
              {user.probationEnd && (
                <div>
                  <dt className="text-gray-500">Probation Ends</dt>
                  <dd
                    className={cn(
                      "font-medium",
                      isExpired(user.probationEnd)
                        ? "text-green-600"
                        : "text-orange-600"
                    )}
                  >
                    {formatDate(user.probationEnd)}
                  </dd>
                </div>
              )}
              {user.contractEnd && (
                <div>
                  <dt className="text-gray-500">Contract Ends</dt>
                  <dd
                    className={cn(
                      "font-medium",
                      isExpiringSoon(user.contractEnd)
                        ? "text-red-600"
                        : "text-gray-900"
                    )}
                  >
                    {formatDate(user.contractEnd)}
                  </dd>
                </div>
              )}
              {user.hourlyRate && (
                <div>
                  <dt className="text-gray-500">Hourly Rate</dt>
                  <dd className="text-gray-900 font-medium">
                    AED {Number(user.hourlyRate).toFixed(0)}/hr
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* UAE Documents - only visible to admins/HR */}
          {canViewSensitive && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">UAE Documents</h2>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emirates ID */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Emirates ID
                    </span>
                    {user.emiratesIdExpiry && (
                      <ExpiryBadge date={user.emiratesIdExpiry} />
                    )}
                  </div>
                  {user.emiratesId ? (
                    <p className="text-sm text-gray-900 font-mono">
                      {user.emiratesId}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                  {user.emiratesIdExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {formatDate(user.emiratesIdExpiry)}
                    </p>
                  )}
                </div>

                {/* Passport */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Passport
                    </span>
                    {user.passportExpiry && (
                      <ExpiryBadge date={user.passportExpiry} />
                    )}
                  </div>
                  {user.passportNumber ? (
                    <p className="text-sm text-gray-900 font-mono">
                      {user.passportNumber}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                  {user.passportExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {formatDate(user.passportExpiry)}
                    </p>
                  )}
                </div>

                {/* Visa */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Visa
                    </span>
                    {user.visaExpiry && <ExpiryBadge date={user.visaExpiry} />}
                  </div>
                  {user.visaStatus ? (
                    <p className="text-sm text-gray-900">
                      {visaStatusLabels[user.visaStatus]}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                  {user.visaExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {formatDate(user.visaExpiry)}
                    </p>
                  )}
                </div>

                {/* Bank */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Bank Account
                  </span>
                  {user.bankName ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">{user.bankName}</p>
                      {user.bankIban && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {user.bankIban}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {canViewSensitive && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Documents</h2>
                <button className="text-sm text-[#1BA098] hover:underline">
                  Upload Document
                </button>
              </div>
              {user.documents.length > 0 ? (
                <div className="space-y-2">
                  {user.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.type.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.expiryDate && (
                          <ExpiryBadge date={doc.expiryDate} />
                        )}
                        {doc.isVerified && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No documents uploaded
                </div>
              )}
            </div>
          )}

          {/* Managed Clients */}
          {user.managedClients.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Managed Clients
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {user.managedClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{client.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpiryBadge({ date }: { date: Date }) {
  const expired = isExpired(date);
  const expiringSoon = isExpiringSoon(date);

  if (expired) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
        <AlertTriangle className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (expiringSoon) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
        <AlertTriangle className="w-3 h-3" />
        Expiring Soon
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
      Valid
    </span>
  );
}
