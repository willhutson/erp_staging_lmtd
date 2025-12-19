# TeamLMTD ERP Platform

## Platform Overview

**Version:** 2.0 | **Date:** December 2025 | **Owner:** Will Hutson, CEO

---

## 1. Executive Summary

TeamLMTD ERP is a config-driven platform for professional services agencies that eliminates operational fragmentation. Built with a hybrid architecture that's LMTD-first but multi-tenant ready from day one.

### The Challenge

LMTD currently manages work across 15+ tools:
- **Project Management:** Monday.com, Asana
- **Social Platforms:** Meta, Twitter/X, TikTok, LinkedIn, Snapchat, YouTube
- **Advertising:** Meta Ads, Google Ads, TikTok Ads
- **Analytics:** Google Analytics 4, Brandwatch, Sprinklr
- **Financial:** QuickBooks, Xero
- **Communication:** Slack, Email

**Pain Points:**
- 25-30 daily context switches
- 18 hours/week on manual reporting
- No unified resource visibility
- Inconsistent brief quality
- RFP tracking in spreadsheets

### The Solution

A unified platform with six core modules:

| Module | Purpose |
|--------|---------|
| **Briefing System** | 7 structured form types with AI quality scoring |
| **Resource Planning** | Float.com-style Kanban and Gantt views |
| **Time Tracking** | One-click timer, timesheets, approvals |
| **RFP Management** | New business pipeline with automated workflows |
| **Client Portal** | Deliverable review and approval |
| **Analytics** | Utilization, profitability, performance |

---

## 2. Vision & Goals

### Vision Statement

*"One platform where LMTD's 46 team members manage all client work, from brief to billing, with real-time visibility and zero context switching."*

### Strategic Goals

1. **Operational Efficiency** - Reduce admin overhead by 70%
2. **Resource Visibility** - Real-time capacity and utilization
3. **Quality Consistency** - AI-assisted brief standardization
4. **Business Intelligence** - Data-driven decisions on clients and RFPs
5. **Platform Foundation** - Architecture ready for future agency customers

---

## 3. Success Metrics

### Primary KPIs

| Metric | Current State | Target | Measurement |
|--------|---------------|--------|-------------|
| Weekly Reporting Time | 18 hours | 5 hours | Time tracking |
| Daily Context Switches | 25-30 | <10 | User survey |
| Brief Quality Score | N/A | >80 average | AI scoring |
| Resource Visibility | Manual/None | Real-time | System capability |
| RFP Win Rate Tracking | Manual | Automated | Pipeline dashboard |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Team Utilization | 75% billable |
| Brief Turnaround | -20% avg time |
| Client Satisfaction | +15% (portal adoption) |
| Time Entry Compliance | >95% weekly |

---

## 4. Team Overview

### Organization: 46 Members, 8 Departments

| Department | Count | Team Lead | Primary Function |
|------------|-------|-----------|------------------|
| Management | 2 | Will Hutson | Strategy, oversight |
| Creative & Design | 5 | Klaudia Pszczolinska | Visual design |
| Video Production | 9 | Rozanne Vasallo | Video content |
| Client Servicing | 16 | CJ Holland | Account management |
| HR & Operations | 5 | Albert Khoury | Operations, finance |
| OCM | 3 | Ghassan Ahmed | Community management |
| Paid Media | 2 | Omer Gunal | Advertising |
| Copywriting | 4 | Emaan Omer / Tony Samaan | Content writing |

### Permission Hierarchy

| Level | Users | Access |
|-------|-------|--------|
| **Admin** | Will, Afaq, Albert | Full system, user management |
| **Leadership** | CJ, Ted, Salma, Matthew | All views, RFPs, analytics |
| **Team Lead** | 6 department heads | Team assignment, approvals |
| **Staff** | 27 employees | Own work, time tracking |
| **Freelancer** | 6 contractors | Assigned work only |

---

## 5. High-Level Architecture

### Architecture Principles

```
┌─────────────────────────────────────────────────────────────┐
│                     PLATFORM CORE                           │
│  (Auth, Multi-tenancy, Base UI, Common Components)          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Briefing     │     │  Resources    │     │  Time &       │
│  System       │     │  & Planning   │     │  Financials   │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  RFP          │     │  Client       │     │  Analytics    │
│  Management   │     │  Portal       │     │  & Reporting  │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONFIGURATION LAYER                         │
│  /config/tenants/lmtd.config.ts                             │
│  (Forms, workflows, branding, integrations)                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Config over Code | New tenants = new config file, not code changes |
| Multi-tenant from Day 1 | `organizationId` on all tables prevents refactoring |
| Module Isolation | Features are self-contained, testable, replaceable |
| TypeScript Strict | AI-assisted development works better with types |

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth.js v5 with Google SSO |
| Storage | Cloudflare R2 (S3-compatible) |
| Hosting | Vercel (Dubai region) |

---

## 6. Implementation Timeline

### 12-Week Phased Approach

| Phase | Weeks | Focus | Key Deliverables |
|-------|-------|-------|------------------|
| **1** | 1-2 | Foundation | Auth, layout, database, config system |
| **2** | 3-4 | Briefing | All 7 forms, workflows, assignments |
| **3** | 5-6 | Resources | Kanban, Gantt, capacity dashboard |
| **4** | 7 | Time | Timer, entries, approvals |
| **5** | 8-9 | RFP + Portal | Pipeline, client approval |
| **6** | 10-12 | Integration | Slack, Google, analytics, migration |

### Development Method

- **Claude Code** for async development
- **CLAUDE.md** files guide each module
- **Config-driven** forms and workflows
- **Test-driven** with Vitest + Playwright

---

## 7. Document Index

| Document | Contents |
|----------|----------|
| **02_Technical_Architecture** | Tech stack, database schema, config system, CLAUDE.md |
| **03_Briefing_System** | 7 form specs, workflows, AI scoring, Slack |
| **04_Resource_Planning** | Kanban, Gantt, capacity, time tracking |
| **05_RFP_Management** | Pipeline, subitems, win tracking |
| **06_User_Directory** | 46 users, permissions, dropdowns |
| **07_User_Stories** | 100+ stories by persona and priority |
| **08_Code_Templates** | Prisma seed, form configs, types |

---

*Document Owner: Will Hutson | Last Updated: December 2025*
