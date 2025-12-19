# TeamLMTD ERP Platform

## Code Templates

**Version:** 2.0 | **Ready for:** Claude Code Development

---

## 1. Prisma Seed Data

```typescript
// prisma/seed.ts

import { PrismaClient, PermissionLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Organization
  const lmtd = await prisma.organization.upsert({
    where: { slug: 'lmtd' },
    update: {},
    create: {
      name: 'TeamLMTD',
      slug: 'lmtd',
      domain: 'teamlmtd.com',
      configKey: 'lmtd',
      settings: {
        timezone: 'Asia/Dubai',
        currency: 'AED',
        dateFormat: 'DD MMM YYYY',
      },
    },
  });

  // Users - All 46 team members
  const users = [
    // Management
    { email: 'will@teamlmtd.com', name: 'William Whitaker Hutson', role: 'CEO', department: 'Management', permissionLevel: PermissionLevel.ADMIN },
    { email: 'afaq@teamlmtd.com', name: 'Afaq Tariq', role: 'CFO', department: 'Management', permissionLevel: PermissionLevel.ADMIN },
    
    // Creative & Design
    { email: 'klaudia@teamlmtd.com', name: 'Klaudia Maria Pszczolinska', role: 'Design Director', department: 'Creative & Design', permissionLevel: PermissionLevel.TEAM_LEAD },
    { email: 'ted@teamlmtd.com', name: 'Theodore Totsidis', role: 'Executive Creative Director', department: 'Creative & Design', permissionLevel: PermissionLevel.LEADERSHIP },
    { email: 'nejib@teamlmtd.com', name: 'Mohamed Nejib Ben Ayed', role: 'Graphic Designer', department: 'Creative & Design', permissionLevel: PermissionLevel.STAFF },
    { email: 'john@teamlmtd.com', name: 'John Vincent Gomez', role: 'Graphic Designer', department: 'Creative & Design', permissionLevel: PermissionLevel.STAFF },
    { email: 'anasramzan@gmail.com', name: 'Anas Eramullan', role: 'Graphic Designer', department: 'Creative & Design', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    
    // Video Production
    { email: 'rozanne@teamlmtd.com', name: 'Rozanne Jamaica Vasallo', role: 'Producer', department: 'Video Production', permissionLevel: PermissionLevel.TEAM_LEAD },
    { email: 'haani@teamlmtd.com', name: 'Haani Farooq', role: 'Content Specialist', department: 'Video Production', permissionLevel: PermissionLevel.STAFF },
    { email: 'mikaela@teamlmtd.com', name: 'Mikaela Delovieres', role: 'Trend Analyst', department: 'Video Production', permissionLevel: PermissionLevel.STAFF },
    { email: 'harsh@teamlmtd.com', name: 'Harsh Ghanshyambhai Prajapati', role: 'Video Content Specialist', department: 'Video Production', permissionLevel: PermissionLevel.STAFF },
    { email: 'jasim@teamlmtd.com', name: 'Jasim Kunhamed Kuttuan', role: 'Video Content Specialist', department: 'Video Production', permissionLevel: PermissionLevel.STAFF, skills: ['video', 'design'] },
    { email: 'marvin@teamlmtd.com', name: 'Marvin Cuenca Vasquez', role: 'Video Content Specialist', department: 'Video Production', permissionLevel: PermissionLevel.STAFF, skills: ['video', 'design'] },
    { email: 'htet@teamlmtd.com', name: 'Hteth Aung Win', role: 'Video Content Creator', department: 'Video Production', permissionLevel: PermissionLevel.STAFF },
    { email: 'yadu@teamlmtd.com', name: 'Yadu Krishnan', role: 'Video Content Creator', department: 'Video Production', permissionLevel: PermissionLevel.STAFF },
    { email: 'veysel@teamlmtd.com', name: 'Veysel Enis', role: 'Video Content Creator', department: 'Video Production', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    
    // Client Servicing
    { email: 'cj@teamlmtd.com', name: 'Cornel Jerome Anthony Raphael Holland', role: 'Client Servicing Director', department: 'Client Servicing', permissionLevel: PermissionLevel.LEADERSHIP },
    { email: 'salma@teamlmtd.com', name: 'Salma Ehab Mohamed Aly Ahmed', role: 'Strategy Director', department: 'Client Servicing', permissionLevel: PermissionLevel.LEADERSHIP },
    { email: 'haidy@teamlmtd.com', name: 'Haidy Hany Labib Guirguis', role: 'Account Director', department: 'Client Servicing', permissionLevel: PermissionLevel.TEAM_LEAD },
    { email: 'sarwath@teamlmtd.com', name: 'Sarwath Abdul Wahid', role: 'Associate Account Director', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'clauda@teamlmtd.com', name: 'Clauda El Achkar', role: 'Senior ARM', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'don@teamlmtd.com', name: 'Don Chenuka Wirasinha', role: 'ARM', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'susan@teamlmtd.com', name: 'Susan George', role: 'ARM', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'linda@teamlmtd.com', name: 'Linda Khalid El-Borno', role: 'Account Executive', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'nisrine@teamlmtd.com', name: 'Nisrine Moubarik', role: 'Account Executive', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'lakshmy@teamlmtd.com', name: 'Lakshmy Bharati', role: 'ARM', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF },
    { email: 'matthew@teamlmtd.com', name: 'Matthew David Cole', role: 'Project Manager', department: 'Client Servicing', permissionLevel: PermissionLevel.LEADERSHIP },
    { email: 'rida@teamlmtd.com', name: 'Rida Kashif', role: 'Social Media Executive', department: 'Client Servicing', permissionLevel: PermissionLevel.STAFF, skills: ['social', 'video'] },
    { email: 'jralegaspi25@gmail.com', name: 'Joei Legaspi', role: 'Trend Analyst', department: 'Client Servicing', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    { email: 'aliaminshivjee@gmail.com', name: 'Ali Amin', role: 'Trend Analyst', department: 'Client Servicing', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    { email: 'senani.dilukshika@gmail.com', name: 'Senani Dilukshika', role: 'Social Media Account Exec', department: 'Client Servicing', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    { email: 'clive.ferns1@gmail.com', name: 'Clive Hernandez', role: 'Account Manager', department: 'Client Servicing', permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true },
    
    // HR & Operations
    { email: 'albert@teamlmtd.com', name: 'Albert Khoury', role: 'Workflow Optimization Lead', department: 'HR & Operations', permissionLevel: PermissionLevel.ADMIN },
    { email: 'sheryl@teamlmtd.com', name: 'Sheryl Lunas Sto. Tomas', role: 'HR Executive', department: 'HR & Operations', permissionLevel: PermissionLevel.STAFF },
    { email: 'salman@teamlmtd.com', name: 'Salman Ali Bahadar', role: 'Driver', department: 'HR & Operations', permissionLevel: PermissionLevel.STAFF },
    { email: 'joe@teamlmtd.com', name: 'Joeniffer Ruiz A. Legaspi', role: 'Accountant', department: 'HR & Operations', permissionLevel: PermissionLevel.STAFF },
    { email: 'dima@teamlmtd.com', name: 'Dima Albouza', role: 'Finance Executive', department: 'HR & Operations', permissionLevel: PermissionLevel.STAFF },
    
    // OCM
    { email: 'ghassan@teamlmtd.com', name: 'Ghassan Abdelbasit Osman Sid Ahmed', role: 'Online Community Manager', department: 'OCM', permissionLevel: PermissionLevel.TEAM_LEAD },
    { email: 'maryam@teamlmtd.com', name: 'Maryam Naji Al-Basha Zaiba', role: 'Online Community Manager', department: 'OCM', permissionLevel: PermissionLevel.STAFF },
    { email: 'hkamil@teamlmtd.com', name: 'Haytham Abdelfattah Mostafa Ali Kamil', role: 'Online Community Manager', department: 'OCM', permissionLevel: PermissionLevel.STAFF },
    
    // Paid Media
    { email: 'omer@teamlmtd.com', name: 'Omer Gunal', role: 'Analyst', department: 'Paid Media', permissionLevel: PermissionLevel.TEAM_LEAD },
    { email: 'nour@teamlmtd.com', name: 'Nourhan Mohamed Ahmed Hassan Radwan', role: 'Paid Media Specialist', department: 'Paid Media', permissionLevel: PermissionLevel.STAFF },
    
    // Copywriting
    { email: 'emaan@teamlmtd.com', name: 'Emaan Omer', role: 'English Copywriter', department: 'Copywriting', permissionLevel: PermissionLevel.TEAM_LEAD, skills: ['copywriting-en'] },
    { email: 'tony@teamlmtd.com', name: 'Tony Samaan', role: 'Arabic Copywriter', department: 'Copywriting', permissionLevel: PermissionLevel.TEAM_LEAD, skills: ['copywriting-ar'] },
    { email: 'marcelle@teamlmtd.com', name: 'Marcelle Alzaher', role: 'Junior Arabic Copywriter', department: 'Copywriting', permissionLevel: PermissionLevel.STAFF, skills: ['copywriting-ar'] },
    { email: 'razan@teamlmtd.com', name: 'Razan Samir Lutfi Abdallah', role: 'Content Specialist', department: 'Copywriting', permissionLevel: PermissionLevel.STAFF, skills: ['copywriting-en'] },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { organizationId_email: { organizationId: lmtd.id, email: userData.email } },
      update: userData,
      create: { ...userData, organizationId: lmtd.id, weeklyCapacity: userData.isFreelancer ? 20 : 40, skills: userData.skills || [] },
    });
  }

  // Clients
  const clients = [
    { code: 'CCAD', name: 'CCAD', industry: 'Government', isRetainer: true, retainerHours: 80, color: '#52EDC7' },
    { code: 'DET', name: 'Dubai Economy & Tourism', industry: 'Government', isRetainer: true, retainerHours: 120, color: '#3b82f6' },
    { code: 'ADEK', name: 'ADEK', industry: 'Government/Education', isRetainer: true, retainerHours: 60, color: '#8b5cf6' },
    { code: 'ECD', name: 'Emirates Cancer', industry: 'Healthcare', isRetainer: false, color: '#f97316' },
  ];

  for (const clientData of clients) {
    await prisma.client.upsert({
      where: { organizationId_code: { organizationId: lmtd.id, code: clientData.code } },
      update: clientData,
      create: { ...clientData, organizationId: lmtd.id },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 2. Form Configuration Example

```typescript
// config/forms/video-shoot.form.ts

import { FormConfig } from '@/types/forms';

export const videoShootForm: FormConfig = {
  id: 'VIDEO_SHOOT',
  name: 'Video Shoot Request',
  namingConvention: 'Shoot: [Client] – [Campaign or Topic]',
  example: 'Shoot: CCAD – Talking Heads',
  slackCommand: '/brief-shoot',
  
  sections: [
    {
      id: 'basic',
      title: 'Basic Information',
      fields: [
        {
          id: 'title',
          label: 'Project Title',
          type: 'text',
          required: true,
          maxLength: 255,
          placeholder: 'Shoot: [Client] – [Campaign or Topic]',
          validation: {
            pattern: '^Shoot:\\s*.+\\s*–\\s*.+$',
            message: 'Please follow format: Shoot: [Client] – [Topic]',
          },
        },
        {
          id: 'requesterId',
          label: 'Your Name',
          type: 'user-select',
          required: true,
          filter: { departments: ['Client Servicing'] },
        },
        {
          id: 'clientId',
          label: 'Client Name',
          type: 'client-select',
          required: true,
        },
        {
          id: 'assigneeId',
          label: 'Assigned Videographer',
          type: 'user-select',
          required: true,
          filter: { departments: ['Video Production'] },
        },
      ],
    },
    {
      id: 'shoot-details',
      title: 'Shoot Details',
      fields: [
        {
          id: 'location',
          label: 'Location',
          type: 'textarea',
          required: true,
          maxLength: 2000,
          placeholder: 'City and full address',
        },
        {
          id: 'dates',
          label: 'Date(s)',
          type: 'date-range',
          required: true,
          helpText: 'Same date for single day shoots',
        },
        {
          id: 'timing',
          label: 'Timing',
          type: 'text',
          required: true,
          placeholder: '10am-2pm',
        },
        {
          id: 'transportNeeded',
          label: 'Transport Needed?',
          type: 'select',
          required: true,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'not_sure', label: 'Not Sure Yet' },
          ],
        },
        {
          id: 'shootingMethod',
          label: 'Shooting Method',
          type: 'select',
          required: true,
          options: [
            { value: 'studio', label: 'Studio' },
            { value: 'on_location', label: 'On Location' },
            { value: 'hybrid', label: 'Hybrid' },
          ],
        },
        {
          id: 'deliverables',
          label: 'Expected Deliverables',
          type: 'multi-select',
          required: true,
          options: [
            { value: 'raw_footage', label: 'Raw Footage' },
            { value: 'edited_video', label: 'Edited Video' },
            { value: 'photos', label: 'Photos' },
            { value: 'bts', label: 'Behind the Scenes' },
          ],
        },
      ],
    },
    {
      id: 'creative',
      title: 'Creative Direction',
      fields: [
        {
          id: 'objective',
          label: 'Campaign Objective',
          type: 'textarea',
          required: true,
          maxLength: 2000,
        },
        {
          id: 'talentVO',
          label: 'Talent V/O Needed?',
          type: 'textarea',
          required: true,
          maxLength: 2000,
        },
        {
          id: 'additionalNotes',
          label: 'Additional Notes',
          type: 'textarea',
          required: false,
          maxLength: 2000,
        },
      ],
    },
    {
      id: 'references',
      title: 'Reference Materials',
      fields: [
        {
          id: 'referenceLink',
          label: 'Reference Link',
          type: 'url',
          required: false,
        },
        {
          id: 'attachments',
          label: 'Attachments',
          type: 'file-upload',
          required: false,
          multiple: true,
        },
      ],
    },
  ],
  
  qualityRules: [
    { field: 'location', weight: 15, check: 'minLength', value: 20 },
    { field: 'objective', weight: 20, check: 'minLength', value: 50 },
    { field: 'timing', weight: 10, check: 'notEmpty' },
    { field: 'deliverables', weight: 15, check: 'minItems', value: 1 },
    { field: 'referenceLink', weight: 10, check: 'notEmpty' },
    { field: 'attachments', weight: 10, check: 'hasFiles' },
    { field: 'talentVO', weight: 10, check: 'minLength', value: 10 },
    { field: 'additionalNotes', weight: 10, check: 'minLength', value: 20 },
  ],
};
```

---

## 3. Type Definitions

```typescript
// src/types/index.ts

export * from './forms';
export * from './config';

// src/types/forms.ts

export interface FormConfig {
  id: string;
  name: string;
  namingConvention: string;
  example: string;
  slackCommand?: string;
  sections: FormSection[];
  qualityRules: QualityRule[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  options?: SelectOption[];
  filter?: UserFilter | ClientFilter;
  validation?: ValidationRule;
  multiple?: boolean;
  accept?: string[];
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'date-range'
  | 'user-select'
  | 'client-select'
  | 'file-upload'
  | 'url'
  | 'number';

export interface SelectOption {
  value: string;
  label: string;
}

export interface UserFilter {
  departments?: string[];
  roles?: string[];
  skills?: string[];
}

export interface ClientFilter {
  isRetainer?: boolean;
  isActive?: boolean;
}

export interface ValidationRule {
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
}

export interface QualityRule {
  field: string;
  weight: number;
  check: 'notEmpty' | 'minLength' | 'minItems' | 'hasFiles';
  value?: number;
  message?: string;
}

// src/types/config.ts

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: BrandingConfig;
  features: FeatureFlags;
  briefTypes: string[];
  departments: string[];
  defaults: DefaultsConfig;
}

export interface BrandingConfig {
  primaryColor: string;
  primaryDark: string;
  logo: string;
  favicon?: string;
}

export interface FeatureFlags {
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
}

export interface DefaultsConfig {
  weeklyCapacity: number;
  billableTarget: number;
  currency: string;
  timezone: string;
  dateFormat: string;
}
```

---

## 4. Permission Utilities

```typescript
// src/lib/permissions.ts

import { PermissionLevel, User } from '@prisma/client';

type Permission =
  | 'brief:create'
  | 'brief:read'
  | 'brief:read:all'
  | 'brief:update'
  | 'brief:assign'
  | 'brief:delete'
  | 'time:create'
  | 'time:read'
  | 'time:approve'
  | 'resource:read'
  | 'resource:manage'
  | 'rfp:create'
  | 'rfp:read'
  | 'analytics:read'
  | 'user:manage';

const PERMISSIONS: Record<PermissionLevel, Permission[]> = {
  ADMIN: [
    'brief:create', 'brief:read', 'brief:read:all', 'brief:update', 'brief:assign', 'brief:delete',
    'time:create', 'time:read', 'time:approve',
    'resource:read', 'resource:manage',
    'rfp:create', 'rfp:read',
    'analytics:read',
    'user:manage',
  ],
  LEADERSHIP: [
    'brief:create', 'brief:read', 'brief:read:all', 'brief:update', 'brief:assign',
    'time:create', 'time:read', 'time:approve',
    'resource:read', 'resource:manage',
    'rfp:create', 'rfp:read',
    'analytics:read',
  ],
  TEAM_LEAD: [
    'brief:create', 'brief:read', 'brief:update', 'brief:assign',
    'time:create', 'time:read', 'time:approve',
    'resource:read',
  ],
  STAFF: [
    'brief:read',
    'time:create', 'time:read',
  ],
  FREELANCER: [
    'brief:read',
    'time:create', 'time:read',
  ],
  CLIENT: [],
};

export function can(user: User, permission: Permission): boolean {
  return PERMISSIONS[user.permissionLevel].includes(permission);
}

export function canAny(user: User, permissions: Permission[]): boolean {
  return permissions.some(p => can(user, p));
}

export function canAll(user: User, permissions: Permission[]): boolean {
  return permissions.every(p => can(user, p));
}
```

---

## 5. Quality Score Calculator

```typescript
// src/lib/quality-score.ts

import { QualityRule } from '@/types/forms';

export function calculateQualityScore(
  formData: Record<string, any>,
  rules: QualityRule[]
): { score: number; suggestions: string[] } {
  let totalWeight = 0;
  let earnedWeight = 0;
  const suggestions: string[] = [];

  for (const rule of rules) {
    totalWeight += rule.weight;
    const value = formData[rule.field];
    let passed = false;

    switch (rule.check) {
      case 'notEmpty':
        passed = value !== null && value !== undefined && value !== '';
        break;
      case 'minLength':
        passed = typeof value === 'string' && value.length >= (rule.value || 0);
        break;
      case 'minItems':
        passed = Array.isArray(value) && value.length >= (rule.value || 0);
        break;
      case 'hasFiles':
        passed = Array.isArray(value) && value.length > 0;
        break;
    }

    if (passed) {
      earnedWeight += rule.weight;
    } else if (rule.message) {
      suggestions.push(rule.message);
    }
  }

  const score = Math.round((earnedWeight / totalWeight) * 100);
  return { score, suggestions };
}
```

---

## 6. Wireframe Files

Available in `/wireframes/`:

| File | Description |
|------|-------------|
| `01_brief_submission.html` | Brief submission form |
| `02_creative_dashboard.html` | Creative team dashboard |
| `03_team_lead_queue.html` | Assignment queue |
| `04_client_portal.html` | Client approval portal |
| `05_rfp_pipeline_dashboard.html` | RFP pipeline |
| `06_kanban_resource_board.html` | Kanban board |
| `07_gantt_resource_timeline.html` | Gantt timeline |

---

*Documentation Complete*
