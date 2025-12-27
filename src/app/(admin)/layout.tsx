import { AdminProviders } from "./providers";

// Server component layout for (admin) route group
// This exports the dynamic config to prevent static rendering

export const dynamic = "force-dynamic";

export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
