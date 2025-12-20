import { getPortalUser } from "@/lib/portal/auth";
import { BriefRequestForm } from "./BriefRequestForm";

export const dynamic = 'force-dynamic';

export default async function NewBriefRequestPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Request</h1>
        <p className="text-gray-500 mt-1">
          Tell us what you need and we&apos;ll get started
        </p>
      </div>

      <BriefRequestForm clientId={user.clientId} />
    </div>
  );
}
