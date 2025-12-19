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
};

export type LmtdConfig = typeof lmtdConfig;
