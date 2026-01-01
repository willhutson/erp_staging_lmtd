import { AlertTriangle, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StudioSetupRequiredProps {
  module: string;
}

export function StudioSetupRequired({ module }: StudioSetupRequiredProps) {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-lg mx-auto mt-12">
        <div className="p-8 rounded-[var(--ltd-radius-lg)] border border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold text-ltd-text-1 mb-2">
              Setup Required
            </h2>

            <p className="text-sm text-ltd-text-2 mb-4">
              The <strong>{module}</strong> module requires database setup before it can be used.
            </p>

            <div className="w-full p-4 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 border border-ltd-border-1 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-ltd-text-1 mb-1">
                    Database Migration Required
                  </p>
                  <p className="text-xs text-ltd-text-3">
                    Run the following command to set up Studio tables:
                  </p>
                  <code className="block mt-2 px-3 py-2 bg-ltd-surface-1 rounded text-xs text-ltd-text-2 font-mono">
                    pnpm db:push
                  </code>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/studio"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-ltd-border-1 text-ltd-text-2 rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-surface-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Studio
              </Link>
              <Link
                href="/hub"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
              >
                Go to Hub
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-2">
          <h3 className="text-sm font-medium text-ltd-text-1 mb-2">
            Full Setup Steps
          </h3>
          <ol className="text-xs text-ltd-text-2 space-y-1.5 list-decimal list-inside">
            <li>Ensure your database connection is configured in <code className="px-1 py-0.5 bg-ltd-surface-3 rounded">.env</code></li>
            <li>Run <code className="px-1 py-0.5 bg-ltd-surface-3 rounded">pnpm prisma generate</code> to generate the Prisma client</li>
            <li>Run <code className="px-1 py-0.5 bg-ltd-surface-3 rounded">pnpm db:push</code> to create database tables</li>
            <li>Refresh this page to access {module}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
