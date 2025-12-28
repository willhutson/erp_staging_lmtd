# Database Schema

SpokeStack uses PostgreSQL with Prisma ORM.

---

## Core Entities

### Organization
Multi-tenant root entity.

```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())

  users     User[]
  clients   Client[]
  briefs    Brief[]
  projects  Project[]
  rfps      RFP[]
}
```

### User
Team member with role-based access.

```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  name           String
  role           String   // ADMIN, LEADERSHIP, TEAM_LEAD, STAFF, FREELANCER
  department     String?
  avatarUrl      String?
  isActive       Boolean  @default(true)
  weeklyCapacity Int      @default(40)
  organizationId String

  organization   Organization @relation(fields: [organizationId])
  briefs         Brief[]     @relation("CreatedBy")
  assignments    Brief[]     @relation("AssignedTo")
  timeEntries    TimeEntry[]
}
```

### Client
Agency client/customer.

```prisma
model Client {
  id             String   @id @default(uuid())
  name           String
  code           String?  // Short code like "LMTD"
  industry       String?
  primaryColor   String?
  organizationId String

  organization   Organization @relation(fields: [organizationId])
  projects       Project[]
  briefs         Brief[]
}
```

---

## Work Entities

### Brief
Work request/task.

```prisma
model Brief {
  id           String   @id @default(uuid())
  briefNumber  String?  // Auto-generated: BRF-0001
  type         String   // VIDEO_SHOOT, DESIGN, etc.
  title        String
  status       String   @default("DRAFT")
  priority     String   @default("MEDIUM")
  deadline     DateTime?
  description  String?

  clientId     String?
  createdById  String
  assigneeId   String?
  projectId    String?
  organizationId String

  client       Client?  @relation(fields: [clientId])
  createdBy    User     @relation("CreatedBy", fields: [createdById])
  assignee     User?    @relation("AssignedTo", fields: [assigneeId])
  project      Project? @relation(fields: [projectId])
  organization Organization @relation(fields: [organizationId])
  timeEntries  TimeEntry[]
}
```

### Project
Budget-tracked work container.

```prisma
model Project {
  id            String   @id @default(uuid())
  name          String
  type          String   // RETAINER, PROJECT, PITCH, INTERNAL
  status        String   @default("DRAFT")
  budgetAmount  Decimal?
  budgetHours   Int?
  startDate     DateTime?
  endDate       DateTime?

  clientId      String?
  organizationId String

  client        Client?  @relation(fields: [clientId])
  organization  Organization @relation(fields: [organizationId])
  briefs        Brief[]
  timeEntries   TimeEntry[]
}
```

### RFP
Request for Proposal tracking.

```prisma
model RFP {
  id             String   @id @default(uuid())
  name           String
  clientName     String
  status         String   @default("VETTING")
  outcome        String?  // WON, LOST
  deadline       DateTime?
  estimatedValue Decimal?
  probability    String?  // HIGH, MEDIUM, LOW
  scopeOfWork    String?
  requirements   String?
  portal         String?
  bidBondRequired Boolean @default(false)
  notes          String?

  organizationId String

  organization   Organization @relation(fields: [organizationId])
  subitems       RFPSubitem[]
}
```

---

## Tracking Entities

### TimeEntry
Logged work hours.

```prisma
model TimeEntry {
  id          String   @id @default(uuid())
  date        DateTime
  hours       Decimal
  description String?
  billable    Boolean  @default(true)

  userId      String
  briefId     String?
  projectId   String?
  organizationId String

  user        User     @relation(fields: [userId])
  brief       Brief?   @relation(fields: [briefId])
  project     Project? @relation(fields: [projectId])
}
```

### LeaveRequest
Time-off requests.

```prisma
model LeaveRequest {
  id        String   @id @default(uuid())
  type      String   // ANNUAL, SICK, PERSONAL, WFH, UNPAID
  status    String   @default("PENDING")
  startDate DateTime
  endDate   DateTime
  notes     String?

  userId    String
  approverId String?
  organizationId String

  user      User     @relation(fields: [userId])
}
```

---

## Multi-Tenant Entities

### Instance
White-label client portal.

```prisma
model Instance {
  id             String   @id @default(uuid())
  name           String
  slug           String   @unique
  tier           String   @default("PRO")
  primaryColor   String   @default("#52EDC7")
  secondaryColor String   @default("#1BA098")
  enabledModules String[] // Array of module IDs

  organizationId String

  organization   Organization @relation(fields: [organizationId])
}
```

---

## Indexes

Key indexes for performance:

```prisma
@@index([organizationId])
@@index([status])
@@index([createdAt])
@@index([clientId])
@@index([assigneeId])
@@index([deadline])
```

---

## Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply to production
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset
```

---

## Seeding

```bash
npx prisma db seed
```

See `/prisma/seed.ts` for seed data including:
- Sample organization
- 46 team members
- 4 clients
- Sample briefs, projects, RFPs

---

*Back to: [Architecture Overview](./architecture.md)*
