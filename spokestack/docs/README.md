# SpokeStack Platform Documentation

**Version:** 1.0 | **Last Updated:** December 2025

---

## Welcome to SpokeStack

SpokeStack is a multi-tenant SaaS platform designed for professional services agencies. It provides modular bundles for ERP, Agency Management, Marketing Tools, and Client Portals.

---

## Quick Navigation

### For Users
| Document | Description |
|----------|-------------|
| [Getting Started](./user-guides/getting-started.md) | First steps for new users |
| [Hub Overview](./user-guides/hub-overview.md) | Understanding the main dashboard |
| [SpokeChat](./user-guides/spokechat.md) | Team messaging and communication |

### For Admins
| Document | Description |
|----------|-------------|
| [Admin Dashboard](./admin-guides/admin-dashboard.md) | Managing your organization |
| [User Management](./admin-guides/user-management.md) | Adding and managing team members |
| [Permission Levels](./admin-guides/permissions.md) | Understanding roles and access |

### Module Guides
| Bundle | Modules |
|--------|---------|
| [ERP Bundle](./modules/erp-bundle.md) | Briefs, Time Tracking, Leave, Team, RFP |
| [Agency Bundle](./modules/agency-bundle.md) | Clients, Retainers, Projects, Resources, CRM |
| [Marketing Bundle](./modules/marketing-bundle.md) | Listening, Trackers, Media Buying, Analytics, Builder |
| [Client Portal](./modules/client-portal.md) | Dashboard, Approvals, Deliverables, Reports |

### Technical Documentation
| Document | Description |
|----------|-------------|
| [Architecture Overview](./technical/architecture.md) | System design and tech stack |
| [Database Setup Guide](./DATABASE_SETUP_GUIDE.md) | Prisma + Supabase + Vercel configuration |
| [API Reference](./technical/api-reference.md) | API endpoints and integration |
| [Database Schema](./technical/database-schema.md) | Data models and relationships |
| [Pre-Deployment Checklist](./technical/pre-deployment-checklist.md) | Steps before going live |

---

## Platform Overview

### Module Bundles

SpokeStack is organized into four main bundles:

#### 1. ERP Bundle
Core business operations for managing work and team.
- **Briefs** - Work requests with kanban, list, and timeline views
- **Time Tracking** - Timesheets, timers, and billing
- **Leave** - PTO requests, calendar, approvals
- **Team** - Directory, departments, org chart
- **RFP** - New business pipeline with kanban and timeline

#### 2. Agency Bundle
Professional services and client management.
- **Clients** - Client profiles and brand settings
- **Retainers** - Monthly retainer tracking and allocation
- **Projects** - Project budgets, hours, and Gantt charts
- **Resources** - Team capacity, workload, and scheduling
- **CRM** - Deals, contacts, companies pipeline

#### 3. Marketing Bundle
Digital marketing and analytics tools.
- **Listening** - Creator roster and content tracking
- **Brand Trackers** - Multi-platform brand monitoring
- **Media Buying** - Ad accounts, campaigns, budgets
- **Analytics** - Performance dashboards and reporting
- **Builder** - Custom dashboards and widget library

#### 4. Client Portal Bundle
White-label portal for client access.
- **Portal Dashboard** - Client overview and stats
- **Approvals** - Deliverable review and approval workflow
- **Deliverables** - Asset library with downloads
- **Reports** - Performance reports and analytics

---

## Permission Levels

| Level | Description | Access |
|-------|-------------|--------|
| **Admin** | Full system access | All modules, settings, user management |
| **Leadership** | Department heads | All modules + RFP management |
| **Team Lead** | Team managers | Team assignment, briefs, resources |
| **Staff** | Regular employees | Own work, time tracking, leave |
| **Freelancer** | External contractors | Assigned work only |
| **Client** | External clients | Client Portal only |

---

## Getting Help

- **In-App Help**: Click the ? icon in the header
- **Documentation**: You're reading it!
- **Contact Support**: support@spokestack.io

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2025 | Initial release with all 4 bundles |
