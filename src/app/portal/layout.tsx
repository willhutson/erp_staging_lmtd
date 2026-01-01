import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal - TeamLMTD",
  description: "View and approve your project deliverables",
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Portal header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#52EDC7] rounded-lg flex items-center justify-center">
              <span className="font-bold text-gray-900">L</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Client Portal</h1>
              <p className="text-xs text-gray-500">Powered by TeamLMTD</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Need help?{" "}
          <a href="mailto:hello@teamlmtd.com" className="text-[#1BA098]">
            Contact TeamLMTD
          </a>
        </div>
      </footer>
    </div>
  );
}
