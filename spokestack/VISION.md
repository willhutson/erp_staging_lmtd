# SpokeStack Vision

## The Problem

Marketing tools exist in silos. Social listening platforms, media buying dashboards, creator management systems, and analytics tools each solve narrow problems but don't connect to how agencies and companies actually operate.

Meanwhile, the marketing and communications industry is evolving. Companies are bringing generalist talent in-house. Agencies are handling broader scopes. The line between "marketing execution" and "business operations" is blurring.

**The gap:** There's no platform that bridges marketing execution with business operations - approvals, workflows, resource planning, client management, time tracking, and deliverables.

## The Solution

SpokeStack is a unified platform that connects marketing tools with operational infrastructure. It's not just another marketing dashboard - it's the operational backbone that makes marketing work actually work.

### Two Pillars, One Platform

**1. Marketing Modules** - The "doing" tools
- **Listening** - Creator/influencer discovery, social monitoring, content tracking
- **Media Buying** - Ad account management, campaign performance, budget tracking
- **Analytics** - Cross-platform reporting, custom dashboards, performance insights
- **Builder** - WYSIWYG dashboard builder, widget library, white-label client portals

**2. Operations Modules** - The "running the business" tools
- **Briefs & Workflows** - Work requests, approvals, status tracking
- **Resource Planning** - Team capacity, assignments, scheduling
- **Time Tracking** - Billable hours, project allocation, utilization
- **Client Management** - Contacts, contracts, deliverables, feedback
- **HR & Leave** - Employee management, time off, documents
- **RFP Pipeline** - New business tracking, proposal management

**3. The Glue** - What makes it unique
- **Form Templates** - Config-driven forms that connect any workflow
- **Custom Dashboards** - Drag-and-drop dashboards mixing marketing + operations data
- **Automations** - Triggers and actions across modules
- **Client Portals** - White-labeled views for external stakeholders

## Example Flows

### Creator Campaign to Invoice
```
Creator identified in Listening
    → Campaign created in Media Buying
    → Brief auto-generated for creative team
    → Work assigned, time tracked
    → Deliverables uploaded for client approval
    → Approved content published
    → Time entries → Invoice generated
```

### Performance-Triggered Workflow
```
Ad campaign underperforming (Analytics)
    → Alert triggered
    → Task created for media buyer
    → Budget reallocation approved
    → Client notified via portal
    → Changes logged for reporting
```

### Client Feedback Loop
```
Client submits feedback (Portal)
    → NPS score captured
    → Linked to specific deliverables
    → Team notified
    → Follow-up task created
    → Informs next brief/scope
```

## Architecture Principles

### Multi-Tenant from Day One
Every table has `organizationId`. SpokeStack can serve:
- **Agencies** managing multiple clients
- **Brands** with in-house teams
- **Holding companies** with multiple agencies

### Config-Driven Flexibility
Behavior lives in configuration, not code:
- Form fields and validation rules
- Workflow states and transitions
- Dashboard layouts and widgets
- Permission structures

### Module Isolation with Shared Context
Each module is self-contained but shares:
- User authentication and permissions
- Organization and client context
- Activity logging and audit trails
- Notification infrastructure

## Target Users

### Primary: Marketing Agencies
- Social media agencies
- Digital marketing agencies
- Creative agencies
- Influencer marketing agencies

### Secondary: In-House Teams
- Corporate communications teams
- Brand marketing departments
- Content teams at media companies

### Use Case: TeamLMTD
TeamLMTD (Dubai-based social/digital agency) is the first implementation and ongoing sandbox for SpokeStack development. Real workflows, real data, real feedback.

## Technical Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Google SSO, email/password)
- **ORM:** Prisma
- **Hosting:** Vercel

## Roadmap Themes

### Foundation (Current)
- Core authentication and multi-tenancy
- Admin module (users, organizations, roles)
- Basic CRUD for all modules

### Integration
- Platform API connections (Meta, Google, TikTok)
- Webhook infrastructure
- Third-party tool sync

### Intelligence
- Cross-module analytics
- Automated insights
- Predictive workflows

### Scale
- White-label deployment
- API for custom integrations
- Mobile applications

---

*SpokeStack: Where marketing execution meets business operations.*
