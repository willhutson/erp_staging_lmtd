/**
 * Tenant Configuration System
 *
 * Supports three types of domain configurations:
 * 1. Subdomains: lmtd.spokestack.io, acme.spokestack.io
 * 2. Custom domains (CNAME): app.teamlmtd.com -> lmtd.spokestack.io
 * 3. Enterprise dedicated: Separate deploy with own domain
 *
 * Domain resolution priority:
 * 1. Check custom_domains table for exact match
 * 2. Check subdomain against organization slugs
 * 3. Fall back to default tenant
 */

import prisma from "./prisma";

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;

  // Branding
  logo: string | null;
  logoMark: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string | null;

  // Domain configuration
  domain: string | null;           // Primary domain (e.g., spokestack.io)
  customDomain: string | null;     // CNAME custom domain (e.g., app.teamlmtd.com)
  subdomain: string | null;        // Subdomain (e.g., lmtd)

  // Feature flags
  enabledModules: string[];

  // Settings
  settings: Record<string, unknown>;

  // Tier
  tier: "free" | "pro" | "enterprise";

  // Organization ID for database queries
  organizationId: string;
}

// Default SpokeStack configuration
const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  slug: "spokestack",
  name: "SpokeStack",
  logo: null,
  logoMark: null,
  favicon: null,
  primaryColor: "#52EDC7",
  secondaryColor: "#1BA098",
  domain: "spokestack.io",
  customDomain: null,
  subdomain: null,
  enabledModules: ["admin", "crm", "listening", "mediabuying", "analytics", "builder"],
  settings: {},
  tier: "pro",
  organizationId: "",
};

// Cache for tenant configs (TTL: 5 minutes)
const tenantCache = new Map<string, { config: TenantConfig; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Extract tenant identifier from hostname
 */
export function extractTenantFromHost(host: string): {
  type: "subdomain" | "custom" | "default";
  identifier: string;
} {
  // Remove port if present
  const hostname = host.split(":")[0];

  // Known base domains for SpokeStack
  const baseDomains = [
    "spokestack.io",
    "spokestack.vercel.app",
    "localhost",
  ];

  // Check if it's a subdomain of a known base domain
  for (const baseDomain of baseDomains) {
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      return { type: "default", identifier: "default" };
    }

    if (hostname.endsWith(`.${baseDomain}`)) {
      const subdomain = hostname.replace(`.${baseDomain}`, "");
      // Ignore www, app, api subdomains
      if (["www", "app", "api"].includes(subdomain)) {
        return { type: "default", identifier: "default" };
      }
      return { type: "subdomain", identifier: subdomain };
    }
  }

  // It's a custom domain (CNAME)
  return { type: "custom", identifier: hostname };
}

/**
 * Resolve tenant configuration from hostname
 */
export async function resolveTenant(host: string): Promise<TenantConfig> {
  const { type, identifier } = extractTenantFromHost(host);

  // Check cache first
  const cacheKey = `${type}:${identifier}`;
  const cached = tenantCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.config;
  }

  let config: TenantConfig | null = null;

  try {
    if (type === "custom") {
      // Look up custom domain in database
      config = await resolveByCustomDomain(identifier);
    } else if (type === "subdomain") {
      // Look up by organization slug
      config = await resolveBySubdomain(identifier);
    }
  } catch (error) {
    console.error("Error resolving tenant:", error);
  }

  // Fall back to default
  const finalConfig = config || DEFAULT_TENANT;

  // Cache the result
  tenantCache.set(cacheKey, {
    config: finalConfig,
    expires: Date.now() + CACHE_TTL,
  });

  return finalConfig;
}

/**
 * Resolve tenant by custom domain (CNAME)
 *
 * Custom domains can be configured in two places:
 * 1. ClientInstance.customDomain - for white-labeled client portals
 * 2. Organization.domain - for organization-level custom domains
 */
async function resolveByCustomDomain(domain: string): Promise<TenantConfig | null> {
  // Check ClientInstance table for custom domain (verified only)
  const clientInstance = await prisma.clientInstance.findFirst({
    where: {
      customDomain: domain,
      customDomainVerified: true,
      isActive: true,
    },
    include: {
      defaultDashboard: true,
    },
  });

  if (clientInstance) {
    // Map InstanceTier enum to config tier
    const tierMap: Record<string, "free" | "pro" | "enterprise"> = {
      FREE: "free",
      PRO: "pro",
      ENTERPRISE: "enterprise",
    };

    return {
      id: clientInstance.id,
      slug: clientInstance.slug,
      name: clientInstance.name,
      logo: clientInstance.logo,
      logoMark: clientInstance.logoMark,
      favicon: clientInstance.favicon,
      primaryColor: clientInstance.primaryColor || "#52EDC7",
      secondaryColor: clientInstance.secondaryColor,
      domain: null,
      customDomain: clientInstance.customDomain,
      subdomain: null,
      enabledModules: clientInstance.enabledModules,
      settings: clientInstance.settings as Record<string, unknown>,
      tier: tierMap[clientInstance.tier] || "pro",
      organizationId: clientInstance.organizationId,
    };
  }

  // Also check Organization table for domain
  const org = await prisma.organization.findFirst({
    where: {
      domain: domain,
    },
  });

  if (org) {
    return organizationToTenantConfig(org, { customDomain: domain });
  }

  return null;
}

/**
 * Resolve tenant by subdomain
 */
async function resolveBySubdomain(subdomain: string): Promise<TenantConfig | null> {
  // Check ClientInstance first
  const clientInstance = await prisma.clientInstance.findFirst({
    where: {
      slug: subdomain,
      isActive: true,
    },
  });

  if (clientInstance) {
    // Map InstanceTier enum to config tier
    const tierMap: Record<string, "free" | "pro" | "enterprise"> = {
      FREE: "free",
      PRO: "pro",
      ENTERPRISE: "enterprise",
    };

    return {
      id: clientInstance.id,
      slug: clientInstance.slug,
      name: clientInstance.name,
      logo: clientInstance.logo,
      logoMark: clientInstance.logoMark,
      favicon: clientInstance.favicon,
      primaryColor: clientInstance.primaryColor || "#52EDC7",
      secondaryColor: clientInstance.secondaryColor,
      domain: null,
      customDomain: clientInstance.customDomain,
      subdomain: subdomain,
      enabledModules: clientInstance.enabledModules,
      settings: clientInstance.settings as Record<string, unknown>,
      tier: tierMap[clientInstance.tier] || "pro",
      organizationId: clientInstance.organizationId,
    };
  }

  // Check Organization
  const org = await prisma.organization.findFirst({
    where: {
      slug: subdomain,
    },
  });

  if (org) {
    return organizationToTenantConfig(org, { subdomain });
  }

  return null;
}

/**
 * Convert Organization to TenantConfig
 */
function organizationToTenantConfig(
  org: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
    logoMark: string | null;
    favicon: string | null;
    domain: string | null;
    settings: unknown;
    themeSettings: unknown;
  },
  overrides: Partial<TenantConfig> = {}
): TenantConfig {
  const theme = (org.themeSettings as Record<string, string>) || {};

  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    logo: org.logo,
    logoMark: org.logoMark,
    favicon: org.favicon,
    primaryColor: theme.primaryColor || "#52EDC7",
    secondaryColor: theme.secondaryColor || "#1BA098",
    domain: org.domain,
    customDomain: null,
    subdomain: org.slug,
    enabledModules: ["admin", "crm", "listening", "mediabuying", "analytics", "builder"],
    settings: (org.settings as Record<string, unknown>) || {},
    tier: "pro",
    organizationId: org.id,
    ...overrides,
  };
}

/**
 * Clear tenant cache (useful after config updates)
 */
export function clearTenantCache(identifier?: string) {
  if (identifier) {
    // Clear specific tenant
    const keysToDelete: string[] = [];
    tenantCache.forEach((_, key) => {
      if (key.includes(identifier)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => tenantCache.delete(key));
  } else {
    // Clear all
    tenantCache.clear();
  }
}

/**
 * Get all registered custom domains (for Vercel domain configuration)
 *
 * Returns both:
 * - Subdomains: lmtd.spokestack.io
 * - Custom CNAME domains: app.teamlmtd.com
 */
export async function getAllCustomDomains(): Promise<string[]> {
  const [clientInstances, organizations] = await Promise.all([
    prisma.clientInstance.findMany({
      where: { isActive: true },
      select: { slug: true, customDomain: true, customDomainVerified: true },
    }),
    prisma.organization.findMany({
      where: { domain: { not: null } },
      select: { domain: true },
    }),
  ]);

  const domains: string[] = [];

  // Add subdomains for all client instances
  for (const ci of clientInstances) {
    domains.push(`${ci.slug}.spokestack.io`);

    // Add verified custom domains
    if (ci.customDomain && ci.customDomainVerified) {
      domains.push(ci.customDomain);
    }
  }

  // Add organization-level custom domains
  for (const org of organizations) {
    if (org.domain) {
      domains.push(org.domain);
    }
  }

  return domains;
}

/**
 * Verify a custom domain for a ClientInstance
 * This would typically be called after DNS verification
 */
export async function verifyCustomDomain(
  clientInstanceId: string,
  domain: string
): Promise<boolean> {
  try {
    await prisma.clientInstance.update({
      where: { id: clientInstanceId },
      data: {
        customDomain: domain,
        customDomainVerified: true,
        customDomainVerifiedAt: new Date(),
      },
    });
    // Clear cache for this domain
    clearTenantCache(domain);
    return true;
  } catch (error) {
    console.error("Error verifying custom domain:", error);
    return false;
  }
}

/**
 * Set a pending custom domain (unverified)
 */
export async function setPendingCustomDomain(
  clientInstanceId: string,
  domain: string
): Promise<{ success: boolean; verificationToken?: string }> {
  try {
    // Generate a verification token
    const verificationToken = `spokestack-verify-${clientInstanceId.slice(-8)}`;

    await prisma.clientInstance.update({
      where: { id: clientInstanceId },
      data: {
        customDomain: domain,
        customDomainVerified: false,
        customDomainVerifiedAt: null,
      },
    });

    return { success: true, verificationToken };
  } catch (error) {
    console.error("Error setting pending custom domain:", error);
    return { success: false };
  }
}
