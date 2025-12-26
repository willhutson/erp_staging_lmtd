export const lmtdConfig = {
  id: "lmtd",
  name: "TeamLMTD",
  domain: "teamlmtd.com",

  branding: {
    primaryColor: "#52EDC7",
    primaryDark: "#1BA098",
    logo: "/logos/teamlmtd.svg",
  },

  features: {
    briefing: true,
    resourcePlanning: true,
    timeTracking: true,
    clientPortal: true,
    rfpManagement: true,
    analytics: true,
    integrations: {
      slack: true,
      google: true,
      meta: true,
    },
  },

  briefTypes: [
    "VIDEO_SHOOT",
    "VIDEO_EDIT",
    "DESIGN",
    "COPYWRITING_EN",
    "COPYWRITING_AR",
    "PAID_MEDIA",
    "REPORT",
  ] as const,

  departments: [
    "Management",
    "Creative & Design",
    "Video Production",
    "Client Servicing",
    "HR & Operations",
    "OCM",
    "Paid Media",
    "Copywriting",
  ],

  defaults: {
    weeklyCapacity: 40,
    billableTarget: 0.8,
    currency: "AED",
    timezone: "Asia/Dubai",
    dateFormat: "DD MMM YYYY",
    timeFormat: "12h",
  },

  storage: {
    // File size limits in bytes (can be overridden per-user via settings)
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB default
    maxFileSizeMB: 500,

    // Role-based limits (in MB)
    roleLimits: {
      ADMIN: 2048,       // 2GB - admins can upload anything
      LEADERSHIP: 1024,  // 1GB
      TEAM_LEAD: 500,    // 500MB
      STAFF: 250,        // 250MB
      FREELANCER: 100,   // 100MB
    },

    // Allowed MIME types (empty = all allowed)
    allowedMimeTypes: [],

    // Support contact for limit increases
    supportEmail: "ops@teamlmtd.com",
    supportMessage: "If you need more bandwidth, email your manager or ops@teamlmtd.com ASAP.",
  },
};

export type LmtdConfig = typeof lmtdConfig;
