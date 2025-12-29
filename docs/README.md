# SpokeStack Documentation

**Version:** 2.0 | **Last Updated:** December 2024

Complete documentation for the TeamLMTD ERP platform.

---

## Quick Start

| Document | Description |
|----------|-------------|
| [Setup Guide](./00_SETUP_GUIDE.md) | Full environment setup instructions |
| [Cheat Sheet](./CHEAT_SHEET.md) | Quick command reference |
| [Onboarding Prework](../INSTANCE_ONBOARDING_PREWORK.md) | External service setup checklist |

---

## Architecture & Design

Core technical specifications and system design.

| Document | Description |
|----------|-------------|
| [Platform Overview](./01_Platform_Overview.md) | Vision, goals, success metrics |
| [Technical Architecture](./02_Technical_Architecture.md) | Tech stack, database design, config system |
| [Platform Architecture](./11_Platform_Architecture.md) | System components and data flow |
| [CMS Architecture](./19_CMS_Architecture.md) | Content management system design |
| [Unified Schema](./21_Unified_Schema_Master.md) | Complete database schema reference |
| [Database Schema (Extended)](./19_Database_Schema_CMS_Analytics_CRM.md) | CMS, Analytics, CRM schemas |
| [Consolidated Tech Spec](./CONSOLIDATED_TECH_SPEC.md) | Combined technical specification |

---

## Feature Specifications

Detailed specs for each platform module.

| Document | Description |
|----------|-------------|
| [Briefing System](./03_Briefing_System.md) | 7 brief types, forms, workflows, AI scoring |
| [Resource Planning](./04_Resource_Planning.md) | Kanban, Gantt, capacity, time tracking |
| [RFP Management](./05_RFP_Management.md) | Pipeline, subitems, win tracking |
| [User Directory](./06_User_Directory.md) | 46 users, permissions, team structure |

---

## Development Resources

Code templates, patterns, and user stories.

| Document | Description |
|----------|-------------|
| [User Stories](./07_User_Stories.md) | 100+ stories by persona and priority |
| [Code Templates](./08_Code_Templates.md) | Prisma seed, form configs, TypeScript types |
| [CLAUDE.md](./CLAUDE.md) | Claude Code project instructions |

---

## Roadmap & Planning

Platform roadmap and implementation tracking.

| Document | Description |
|----------|-------------|
| [Platform Roadmap](./09_Platform_Roadmap.md) | Full platform development roadmap |
| [Roadmap Phase 2](./10_Platform_Roadmap_Phase2.md) | Phase 2 expansion details |
| [Phase Prioritization](./18_Phase_Prioritization.md) | Phase ordering and dependencies |
| [Implementation Status](./IMPLEMENTATION_STATUS.md) | Current build status (Phases 1-18 complete) |

---

## Phase Documentation

Detailed specifications for each implementation phase.

| Phase | Document | Description |
|-------|----------|-------------|
| 6 | [Notifications](./12_Phase6_Notifications.md) | Email, push, in-app notifications |
| 7 | [File Management](./13_Phase7_FileManagement.md) | Upload, storage, versioning |
| 8 | [Analytics](./14_Phase8_Analytics.md) | Dashboards, reports, metrics |
| 9 | [Slack Integration](./15_Phase9_SlackIntegration.md) | Slack bot, notifications |
| 10 | [Client Portal](./16_Phase10_ClientPortal.md) | External client access |
| 11 | [API Integrations](./17_Phase11_API_Integrations.md) | REST API, webhooks |

---

## AI Agents

Agent skill definitions for automation and assistance.

| Agent | Description |
|-------|-------------|
| [Brief Creator](./agents/brief-creator.md) | Auto-generate briefs from input |
| [Client Analyzer](./agents/client-analyzer.md) | Client health scoring |
| [Deadline Tracker](./agents/deadline-tracker.md) | Deadline monitoring and alerts |
| [Quality Checker](./agents/quality-checker.md) | Deliverable quality review |
| [Resource Scanner](./agents/resource-scanner.md) | Capacity analysis |
| [Skill Sandbox](./20_Skill_Development_Sandbox.md) | Agent development guide |

---

## Module Documentation

Each module has its own CLAUDE.md with specific instructions:

```
src/modules/
├── ai/CLAUDE.md          # AI assistant module
├── chat/CLAUDE.md        # SpokeChat messaging
├── content/CLAUDE.md     # Content management
├── content-engine/CLAUDE.md  # Social content engine
├── files/CLAUDE.md       # File management
└── reporting/CLAUDE.md   # Analytics & reporting

src/components/
└── editor/CLAUDE.md      # Rich text editor
```

---

## Archive

Historical phase checklists and planning documents.

| Document | Description |
|----------|-------------|
| [Phase 1 Checklist](./archive/PHASE_1_CHECKLIST.md) | Token foundation |
| [Phase 2 Checklist](./archive/PHASE_2_CHECKLIST.md) | Component wrappers |
| [Phase 3 Checklist](./archive/PHASE_3_CHECKLIST.md) | Dashboard layout |
| [Phase 3A Checklist](./archive/PHASE_3A_CHECKLIST.md) | Extended dashboard |

---

## Project Structure

```
/                           # Repository root
├── CLAUDE.md              # Main project instructions
├── README.md              # Project overview
├── INSTANCE_ONBOARDING_PREWORK.md  # Service setup checklist
│
├── docs/                  # This folder - all documentation
│   ├── 01-21 specs        # Numbered specification documents
│   ├── agents/            # AI agent skill definitions
│   └── archive/           # Historical checklists
│
├── config/                # Tenant and form configurations
├── prisma/                # Database schema and seeds
├── src/                   # Application source code
├── tasks/                 # Planning and task tracking
└── knowledge/             # Agent knowledge base
```

---

## Key Links

- **Live App:** https://spokestack.vercel.app
- **API Docs:** https://spokestack.vercel.app/admin/settings/api
- **User Docs:** https://spokestack.vercel.app/docs

---

*Built for TeamLMTD - December 2024*
