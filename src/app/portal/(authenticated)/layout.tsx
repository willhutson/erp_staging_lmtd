export const dynamic = 'force-dynamic';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white border-b">
        <span className="font-semibold">Client Portal</span>
      </div>
      <main className="p-6">{children}</main>
    </div>
  );
}
