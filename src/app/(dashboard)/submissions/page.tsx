import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFormSubmissions } from "@/modules/forms/actions/form-submission-actions";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Type for form submission from action
type FormSubmissionRecord = Awaited<ReturnType<typeof getFormSubmissions>>[number];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  SUBMITTED: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-4 h-4" /> },
  IN_REVIEW: { label: "In Review", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="w-4 h-4" /> },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" /> },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: <XCircle className="w-4 h-4" /> },
};

interface SearchParams {
  status?: string;
  success?: string;
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const showSuccess = params.success === "true";

  const submissions = await getFormSubmissions();

  const canReview = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel);
  const pendingCount = submissions.filter((s: FormSubmissionRecord) => ["SUBMITTED", "IN_REVIEW"].includes(s.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-500 mt-1">
            View and manage form submissions
          </p>
        </div>
        {canReview && pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium">
              {pendingCount} pending review
            </span>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Form submitted successfully! It will be reviewed shortly.
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500">
            Form submissions will appear here once created.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brief
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission: FormSubmissionRecord) => {
                const status = statusConfig[submission.status] || statusConfig.DRAFT;
                return (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/submissions/${submission.id}`}
                        className="font-medium text-gray-900 hover:text-[#52EDC7]"
                      >
                        {submission.title || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{submission.template.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{submission.submittedBy.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      {submission.brief ? (
                        <Link
                          href={`/briefs/${submission.brief.id}`}
                          className="text-[#52EDC7] hover:text-[#1BA098] font-medium"
                        >
                          {submission.brief.briefNumber}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
