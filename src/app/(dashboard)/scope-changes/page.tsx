import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getScopeChanges } from "@/modules/scope-changes/actions/scope-change-actions";
import { ScopeChangesClient } from "./ScopeChangesClient";

export const metadata = {
  title: "Scope Changes | SpokeStack",
  description: "Track and manage project scope changes",
};

async function ScopeChangesContent() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const scopeChanges = await getScopeChanges();

  return <ScopeChangesClient scopeChanges={scopeChanges} />;
}

export default function ScopeChangesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scope Changes</h1>
          <p className="text-gray-600 mt-1">
            Track project direction changes and their impact
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#52EDC7]" />
          </div>
        }
      >
        <ScopeChangesContent />
      </Suspense>
    </div>
  );
}
