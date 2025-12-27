"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { lmtdConfig } from "@config/tenants/lmtd.config";
import { demoConfig } from "@config/tenants/demo.config";

// Instance configuration type
export interface InstanceConfig {
  id: string;
  name: string;
  domain: string;
  branding: {
    primaryColor: string;
    primaryDark: string;
    logo: string;
  };
  features: {
    briefing: boolean;
    resourcePlanning: boolean;
    timeTracking: boolean;
    clientPortal: boolean;
    rfpManagement: boolean;
    analytics: boolean;
    integrations: {
      slack: boolean;
      google: boolean;
      meta: boolean;
    };
  };
}

// Available instances
export const instances: InstanceConfig[] = [
  {
    id: lmtdConfig.id,
    name: lmtdConfig.name,
    domain: "lmtd.spokestack.io",
    branding: lmtdConfig.branding,
    features: lmtdConfig.features,
  },
  {
    id: demoConfig.id,
    name: demoConfig.name,
    domain: demoConfig.domain,
    branding: demoConfig.branding,
    features: demoConfig.features,
  },
];

interface InstanceContextType {
  currentInstance: InstanceConfig;
  setInstance: (id: string) => void;
  instances: InstanceConfig[];
}

const InstanceContext = createContext<InstanceContextType | null>(null);

const STORAGE_KEY = "spokestack-instance";

export function InstanceProvider({ children }: { children: ReactNode }) {
  const [currentInstance, setCurrentInstance] = useState<InstanceConfig>(instances[0]);
  const [mounted, setMounted] = useState(false);

  // Load saved instance on mount
  useEffect(() => {
    setMounted(true);
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = instances.find((i) => i.id === savedId);
      if (found) {
        setCurrentInstance(found);
      }
    }
  }, []);

  const setInstance = (id: string) => {
    const found = instances.find((i) => i.id === id);
    if (found) {
      setCurrentInstance(found);
      localStorage.setItem(STORAGE_KEY, id);

      // Apply branding colors as CSS variables
      document.documentElement.style.setProperty("--instance-primary", found.branding.primaryColor);
      document.documentElement.style.setProperty("--instance-primary-dark", found.branding.primaryDark);
    }
  };

  // Apply initial branding
  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty("--instance-primary", currentInstance.branding.primaryColor);
      document.documentElement.style.setProperty("--instance-primary-dark", currentInstance.branding.primaryDark);
    }
  }, [currentInstance, mounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <InstanceContext.Provider value={{ currentInstance, setInstance, instances }}>
      {children}
    </InstanceContext.Provider>
  );
}

export function useInstance() {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error("useInstance must be used within an InstanceProvider");
  }
  return context;
}
