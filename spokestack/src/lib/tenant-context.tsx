"use client";

import { createContext, useContext, ReactNode } from "react";
import { TenantConfig } from "./tenant";

/**
 * Tenant Context for Client Components
 *
 * Provides tenant configuration to React components.
 * The tenant is resolved on the server and passed down.
 */

interface TenantContextValue {
  tenant: TenantConfig;
  isWhiteLabeled: boolean;
  isEnterprise: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  tenant: TenantConfig;
}

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  const value: TenantContextValue = {
    tenant,
    isWhiteLabeled: !!tenant.customDomain,
    isEnterprise: tenant.tier === "enterprise",
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

/**
 * Hook to get just the tenant config
 */
export function useTenantConfig(): TenantConfig {
  const { tenant } = useTenant();
  return tenant;
}

/**
 * Hook to check if current tenant has a specific module enabled
 */
export function useHasModule(module: string): boolean {
  const { tenant } = useTenant();
  return tenant.enabledModules.includes(module);
}

/**
 * Hook to get tenant branding
 */
export function useTenantBranding() {
  const { tenant } = useTenant();
  return {
    name: tenant.name,
    logo: tenant.logo,
    logoMark: tenant.logoMark,
    favicon: tenant.favicon,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
  };
}
