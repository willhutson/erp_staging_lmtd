import { Suspense } from "react";
import { PortalDashboardContent } from "./PortalDashboardContent";

export const dynamic = 'force-dynamic';

export default function PortalDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PortalDashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>
  );
}
