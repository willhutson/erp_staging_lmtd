import { lmtdConfig } from "@/../../config/tenants/lmtd.config";

const configs = {
  lmtd: lmtdConfig,
  default: lmtdConfig,
};

export function getConfig(configKey: string = "default") {
  return configs[configKey as keyof typeof configs] ?? configs.default;
}

export function getTenantConfig() {
  // For now, always return LMTD config
  // In multi-tenant future, this would read from session/request
  return lmtdConfig;
}
