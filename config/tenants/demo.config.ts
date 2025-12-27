export const demoConfig = {
  id: "demo",
  name: "Demo Agency",
  domain: "demo.spokestack.io",

  branding: {
    primaryColor: "#7B61FF",
    primaryDark: "#5B41DF",
    logo: "/logos/spokestack.svg",
  },

  features: {
    briefing: true,
    resourcePlanning: true,
    timeTracking: true,
    clientPortal: true,
    rfpManagement: false,
    analytics: true,
    integrations: {
      slack: true,
      google: true,
      meta: false,
    },
  },

  briefTypes: [
    "VIDEO_SHOOT",
    "VIDEO_EDIT",
    "DESIGN",
    "COPYWRITING_EN",
    "PAID_MEDIA",
  ] as const,

  departments: [
    "Management",
    "Creative",
    "Production",
    "Client Services",
    "Marketing",
  ],

  defaults: {
    weeklyCapacity: 40,
    billableTarget: 0.75,
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  },

  storage: {
    maxFileSizeBytes: 250 * 1024 * 1024, // 250MB default
    maxFileSizeMB: 250,
    roleLimits: {
      ADMIN: 1024,
      LEADERSHIP: 512,
      TEAM_LEAD: 256,
      STAFF: 128,
      FREELANCER: 64,
    },
    allowedMimeTypes: [],
    supportEmail: "support@demo-agency.com",
    supportMessage: "Contact your administrator for storage limit increases.",
  },
};

export type DemoConfig = typeof demoConfig;
