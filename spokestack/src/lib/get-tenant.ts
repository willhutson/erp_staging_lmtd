import { headers } from "next/headers";
import { resolveTenant, TenantConfig } from "./tenant";

/**
 * Get the current tenant in Server Components and Server Actions
 *
 * Uses the headers set by middleware to resolve the tenant.
 * Falls back to default tenant if headers are missing.
 */
export async function getTenant(): Promise<TenantConfig> {
  const headersList = await headers();
  const host = headersList.get("x-tenant-host") || headersList.get("host") || "localhost";

  return resolveTenant(host);
}

/**
 * Get tenant info without full resolution (faster, no DB call)
 * Useful when you just need the type and identifier
 */
export async function getTenantInfo(): Promise<{
  type: "subdomain" | "custom" | "default";
  identifier: string;
  host: string;
}> {
  const headersList = await headers();

  return {
    type: (headersList.get("x-tenant-type") as "subdomain" | "custom" | "default") || "default",
    identifier: headersList.get("x-tenant-identifier") || "default",
    host: headersList.get("x-tenant-host") || headersList.get("host") || "localhost",
  };
}
