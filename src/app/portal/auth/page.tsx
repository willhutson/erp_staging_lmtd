import { PortalLoginForm } from "./PortalLoginForm";
import { getPortalUser } from "@/lib/portal/auth";
import { redirect } from "next/navigation";

export default async function PortalLoginPage() {
  // If already logged in, redirect to dashboard
  const user = await getPortalUser();
  if (user) {
    redirect("/portal");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#52EDC7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-gray-900">SS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
            <p className="text-gray-500 mt-2">
              Sign in to view your projects and approvals
            </p>
          </div>

          <PortalLoginForm />

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need access?{" "}
              <a
                href="mailto:support@teamlmtd.com"
                className="text-[#52EDC7] hover:text-[#3dd4b0] font-medium"
              >
                Contact your account manager
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by SpokeStack
        </p>
      </div>
    </div>
  );
}
