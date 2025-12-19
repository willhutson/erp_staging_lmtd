import { Building2 } from "lucide-react";

export default function PortalHomePage() {
  return (
    <div className="text-center py-12">
      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Welcome to the Client Portal
      </h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Access your project deliverables, review work in progress, and provide
        feedback directly to the team.
      </p>
      <p className="text-sm text-gray-400">
        Please use the link provided in your email to access your client area.
      </p>
    </div>
  );
}
