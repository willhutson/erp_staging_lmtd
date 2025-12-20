# Phase 10: Client Portal Enhancement - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Phases 5, 6, 7

---

## Overview

A self-service portal for agency clients to view work, approve deliverables, access assets, and submit requests. Reduces status-update overhead and empowers client relationships.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PORTAL ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENT                          PORTAL                      INTERNAL       │
│                                                                              │
│  ┌─────────────┐               ┌─────────────┐             ┌─────────────┐  │
│  │ Login       │──────────────▶│ Auth        │             │ SpokeStack  │  │
│  │ (Magic Link)│               │ (Separate)  │             │ Main App    │  │
│  └─────────────┘               └─────────────┘             └─────────────┘  │
│                                      │                            │         │
│                                      ▼                            │         │
│  ┌─────────────┐               ┌─────────────┐                    │         │
│  │ Dashboard   │◀──────────────│ Portal API  │◀───────────────────┘         │
│  │             │               │             │                               │
│  │ • Summary   │               │ • Filtered  │  Shared Database             │
│  │ • Pending   │               │   data      │  (organizationId +           │
│  │ • Recent    │               │ • Client    │   clientId filtering)        │
│  └─────────────┘               │   scoped    │                               │
│                                └─────────────┘                               │
│  ┌─────────────┐               ┌─────────────┐                               │
│  │ Briefs      │               │ Assets      │                               │
│  │             │               │             │                               │
│  │ • View      │               │ • Download  │                               │
│  │ • Approve   │               │ • Brand     │                               │
│  │ • Comment   │               │ • Archive   │                               │
│  └─────────────┘               └─────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
// Client portal user (separate from internal users)
model ClientPortalUser {
  id              String   @id @default(cuid())
  clientId        String

  // Authentication
  email           String
  passwordHash    String?  // Null = magic link only
  magicLinkToken  String?
  magicLinkExpiry DateTime?

  // Profile
  name            String
  title           String?  // "Marketing Manager"
  phone           String?
  avatarUrl       String?

  // Permissions
  role            ClientPortalRole @default(VIEWER)
  permissions     Json     @default("{}")
  // Structure:
  // {
  //   canSubmitBriefs: true,
  //   canApprove: true,
  //   canViewReports: false,
  //   canDownloadAssets: true,
  //   canViewAllBriefs: false,  // vs only assigned
  // }

  // Status
  isActive        Boolean  @default(true)
  isPrimary       Boolean  @default(false)  // Primary contact
  invitedById     String?  // Internal user who invited
  lastLoginAt     DateTime?
  loginCount      Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  client          Client   @relation(fields: [clientId], references: [id])
  invitedBy       User?    @relation(fields: [invitedById], references: [id])
  approvals       BriefApproval[]
  comments        ClientComment[]
  briefRequests   ClientBriefRequest[]

  @@unique([clientId, email])
  @@index([clientId])
  @@map("client_portal_users")
}

enum ClientPortalRole {
  ADMIN    // Full access, can manage other users
  APPROVER // Can approve deliverables
  VIEWER   // View only
}

// Client portal sessions
model ClientPortalSession {
  id              String   @id @default(cuid())
  userId          String
  token           String   @unique
  ipAddress       String?
  userAgent       String?
  expiresAt       DateTime
  createdAt       DateTime @default(now())

  user            ClientPortalUser @relation(fields: [userId], references: [id])

  @@index([token])
  @@map("client_portal_sessions")
}

// Brief approval workflow
model BriefApproval {
  id              String   @id @default(cuid())
  briefId         String

  // Request
  version         Int      @default(1)  // Which version being approved
  requestedAt     DateTime @default(now())
  requestedById   String   // Internal user

  // Response
  status          ApprovalStatus @default(PENDING)
  respondedAt     DateTime?
  respondedById   String?  // ClientPortalUser ID
  feedback        String?  // General feedback
  revisionNotes   String?  // Specific revision requests

  // Files being approved
  fileIds         String[] // Files included in this approval round

  brief           Brief    @relation(fields: [briefId], references: [id])
  requestedBy     User     @relation(fields: [requestedById], references: [id])
  respondedBy     ClientPortalUser? @relation(fields: [respondedById], references: [id])

  @@index([briefId])
  @@index([status])
  @@map("brief_approvals")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REVISIONS_REQUESTED
  REJECTED
}

// Client comments on briefs
model ClientComment {
  id              String   @id @default(cuid())
  briefId         String
  portalUserId    String

  content         String   @db.Text
  attachmentIds   String[] // Optional file attachments

  isInternal      Boolean  @default(false)  // Hidden from client
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  brief           Brief    @relation(fields: [briefId], references: [id])
  portalUser      ClientPortalUser @relation(fields: [portalUserId], references: [id])

  @@index([briefId])
  @@map("client_comments")
}

// Client-initiated brief requests
model ClientBriefRequest {
  id              String   @id @default(cuid())
  clientId        String
  portalUserId    String

  // Request details
  type            String   // "VIDEO_SHOOT", "DESIGN", etc.
  title           String
  description     String   @db.Text
  deadline        DateTime?
  priority        String?  // "urgent", "normal"

  // Attachments
  attachmentIds   String[]

  // Status
  status          ClientRequestStatus @default(SUBMITTED)
  reviewedById    String?  // Internal user who reviewed
  reviewedAt      DateTime?
  reviewNotes     String?
  briefId         String?  // Created brief, if approved

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  client          Client   @relation(fields: [clientId], references: [id])
  portalUser      ClientPortalUser @relation(fields: [portalUserId], references: [id])
  reviewedBy      User?    @relation(fields: [reviewedById], references: [id])
  brief           Brief?   @relation(fields: [briefId], references: [id])

  @@index([clientId])
  @@index([status])
  @@map("client_brief_requests")
}

enum ClientRequestStatus {
  SUBMITTED
  IN_REVIEW
  APPROVED
  DECLINED
  CONVERTED  // Converted to internal brief
}
```

---

## Authentication

### Magic Link Flow

```typescript
// src/lib/portal/auth.ts

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { randomBytes, createHash } from 'crypto';

const MAGIC_LINK_EXPIRY_HOURS = 24;
const SESSION_EXPIRY_DAYS = 30;

export async function sendMagicLink(email: string): Promise<void> {
  const user = await db.clientPortalUser.findFirst({
    where: { email, isActive: true },
    include: { client: true },
  });

  if (!user) {
    // Don't reveal if user exists
    return;
  }

  // Generate token
  const token = randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + MAGIC_LINK_EXPIRY_HOURS * 60 * 60 * 1000);

  // Save token
  await db.clientPortalUser.update({
    where: { id: user.id },
    data: {
      magicLinkToken: hashToken(token),
      magicLinkExpiry: expiry,
    },
  });

  // Send email
  const portalUrl = getPortalUrl(user.client.organizationId);
  const link = `${portalUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: `Sign in to ${user.client.name} Portal`,
    template: 'portal-magic-link',
    data: {
      userName: user.name,
      clientName: user.client.name,
      link,
      expiresIn: `${MAGIC_LINK_EXPIRY_HOURS} hours`,
    },
  });
}

export async function verifyMagicLink(
  email: string,
  token: string
): Promise<{ user: ClientPortalUser; session: string } | null> {
  const hashedToken = hashToken(token);

  const user = await db.clientPortalUser.findFirst({
    where: {
      email,
      magicLinkToken: hashedToken,
      magicLinkExpiry: { gt: new Date() },
      isActive: true,
    },
  });

  if (!user) {
    return null;
  }

  // Clear magic link
  await db.clientPortalUser.update({
    where: { id: user.id },
    data: {
      magicLinkToken: null,
      magicLinkExpiry: null,
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });

  // Create session
  const sessionToken = randomBytes(32).toString('hex');
  const session = await db.clientPortalSession.create({
    data: {
      userId: user.id,
      token: hashToken(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { user, session: sessionToken };
}

export async function validateSession(
  sessionToken: string
): Promise<ClientPortalUser | null> {
  const session = await db.clientPortalSession.findFirst({
    where: {
      token: hashToken(sessionToken),
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: { client: true },
      },
    },
  });

  if (!session || !session.user.isActive) {
    return null;
  }

  return session.user;
}

export async function logout(sessionToken: string): Promise<void> {
  await db.clientPortalSession.deleteMany({
    where: { token: hashToken(sessionToken) },
  });
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getPortalUrl(organizationId: string): string {
  // Could be org-specific subdomain
  return process.env.PORTAL_URL || `${process.env.APP_URL}/portal`;
}
```

### Middleware

```typescript
// src/middleware/portal-auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/portal/auth';

export async function portalAuthMiddleware(request: NextRequest) {
  const sessionToken = request.cookies.get('portal_session')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }

  const user = await validateSession(sessionToken);

  if (!user) {
    const response = NextResponse.redirect(new URL('/portal/login', request.url));
    response.cookies.delete('portal_session');
    return response;
  }

  // Add user to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-portal-user-id', user.id);
  requestHeaders.set('x-portal-client-id', user.clientId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

---

## Portal Pages

### Portal Layout

```typescript
// src/app/portal/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/portal/auth';
import { PortalHeader } from './components/PortalHeader';
import { PortalSidebar } from './components/PortalSidebar';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('portal_session')?.value;

  if (!sessionToken) {
    redirect('/portal/login');
  }

  const user = await validateSession(sessionToken);

  if (!user) {
    redirect('/portal/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader user={user} client={user.client} />
      <div className="flex">
        <PortalSidebar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Portal Dashboard

```typescript
// src/app/portal/page.tsx

import { getPortalUser } from '@/lib/portal/session';
import { db } from '@/lib/db';
import { PortalStats } from './components/PortalStats';
import { PendingApprovals } from './components/PendingApprovals';
import { RecentActivity } from './components/RecentActivity';

export default async function PortalDashboard() {
  const user = await getPortalUser();

  // Get stats
  const [activeBriefs, pendingApprovals, completedThisMonth] = await Promise.all([
    db.brief.count({
      where: {
        clientId: user.clientId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    }),
    db.briefApproval.count({
      where: {
        brief: { clientId: user.clientId },
        status: 'PENDING',
      },
    }),
    db.brief.count({
      where: {
        clientId: user.clientId,
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  // Get pending approvals
  const approvals = await db.briefApproval.findMany({
    where: {
      brief: { clientId: user.clientId },
      status: 'PENDING',
    },
    include: {
      brief: {
        select: {
          id: true,
          title: true,
          briefNumber: true,
          type: true,
        },
      },
      requestedBy: {
        select: { name: true },
      },
    },
    orderBy: { requestedAt: 'desc' },
    take: 5,
  });

  // Get recent briefs
  const recentBriefs = await db.brief.findMany({
    where: { clientId: user.clientId },
    include: {
      assignee: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600">{user.client.name} Portal</p>
      </div>

      <PortalStats
        activeBriefs={activeBriefs}
        pendingApprovals={pendingApprovals}
        completedThisMonth={completedThisMonth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingApprovals approvals={approvals} />
        <RecentActivity briefs={recentBriefs} />
      </div>
    </div>
  );
}
```

### Briefs List

```typescript
// src/app/portal/briefs/page.tsx

import { getPortalUser } from '@/lib/portal/session';
import { db } from '@/lib/db';
import { BriefCard } from './components/BriefCard';
import { BriefFilters } from './components/BriefFilters';

interface PageProps {
  searchParams: { status?: string; type?: string; search?: string };
}

export default async function PortalBriefsPage({ searchParams }: PageProps) {
  const user = await getPortalUser();

  const briefs = await db.brief.findMany({
    where: {
      clientId: user.clientId,
      ...(searchParams.status && { status: searchParams.status }),
      ...(searchParams.type && { type: searchParams.type }),
      ...(searchParams.search && {
        OR: [
          { title: { contains: searchParams.search, mode: 'insensitive' } },
          { briefNumber: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      assignee: { select: { name: true, avatarUrl: true } },
      _count: { select: { comments: true } },
      approvals: {
        where: { status: 'PENDING' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Briefs</h1>
        {user.permissions.canSubmitBriefs && (
          <a
            href="/portal/briefs/new"
            className="px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0]"
          >
            Request Brief
          </a>
        )}
      </div>

      <BriefFilters />

      <div className="grid gap-4">
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            hasPendingApproval={brief.approvals.length > 0}
          />
        ))}

        {briefs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No briefs found
          </div>
        )}
      </div>
    </div>
  );
}
```

### Brief Detail with Approval

```typescript
// src/app/portal/briefs/[id]/page.tsx

import { getPortalUser } from '@/lib/portal/session';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BriefHeader } from './components/BriefHeader';
import { BriefTimeline } from './components/BriefTimeline';
import { BriefDeliverables } from './components/BriefDeliverables';
import { ApprovalPanel } from './components/ApprovalPanel';
import { CommentThread } from './components/CommentThread';

export default async function PortalBriefDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await getPortalUser();

  const brief = await db.brief.findFirst({
    where: {
      id: params.id,
      clientId: user.clientId,
    },
    include: {
      assignee: { select: { name: true, avatarUrl: true, email: true } },
      createdBy: { select: { name: true } },
      files: {
        where: { role: 'deliverable' },
        include: {
          file: true,
        },
        orderBy: { addedAt: 'desc' },
      },
      approvals: {
        orderBy: { requestedAt: 'desc' },
        include: {
          requestedBy: { select: { name: true } },
          respondedBy: { select: { name: true } },
        },
      },
      clientComments: {
        include: {
          portalUser: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!brief) {
    notFound();
  }

  const pendingApproval = brief.approvals.find((a) => a.status === 'PENDING');

  return (
    <div className="space-y-6">
      <BriefHeader brief={brief} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BriefTimeline approvals={brief.approvals} />

          <BriefDeliverables
            files={brief.files}
            briefId={brief.id}
          />

          <CommentThread
            comments={brief.clientComments}
            briefId={brief.id}
            canComment={true}
          />
        </div>

        <div className="space-y-6">
          {/* Brief info sidebar */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Brief Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium">{brief.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium">{brief.type}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Assigned To</dt>
                <dd className="font-medium">{brief.assignee?.name || 'Unassigned'}</dd>
              </div>
              {brief.deadline && (
                <div>
                  <dt className="text-gray-500">Deadline</dt>
                  <dd className="font-medium">
                    {new Date(brief.deadline).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Approval panel if pending */}
          {pendingApproval && user.permissions.canApprove && (
            <ApprovalPanel approval={pendingApproval} briefId={brief.id} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Approval Actions

```typescript
// src/modules/portal/actions/approval-actions.ts
'use server';

import { getPortalUser } from '@/lib/portal/session';
import { db } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export async function approveDeliverable(
  briefId: string,
  feedback?: string
): Promise<void> {
  const user = await getPortalUser();

  if (!user.permissions.canApprove) {
    throw new Error('You do not have permission to approve deliverables');
  }

  const approval = await db.briefApproval.findFirst({
    where: {
      briefId,
      brief: { clientId: user.clientId },
      status: 'PENDING',
    },
    include: {
      brief: true,
    },
  });

  if (!approval) {
    throw new Error('No pending approval found');
  }

  // Update approval
  await db.briefApproval.update({
    where: { id: approval.id },
    data: {
      status: 'APPROVED',
      respondedAt: new Date(),
      respondedById: user.id,
      feedback,
    },
  });

  // Update brief status
  await db.brief.update({
    where: { id: briefId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Notify internal team
  if (approval.brief.assigneeId) {
    await notificationService.send({
      type: 'brief.feedback',
      recipientId: approval.brief.assigneeId,
      title: 'Client approved deliverable',
      body: approval.brief.title,
      actionUrl: `/briefs/${briefId}`,
      entityType: 'brief',
      entityId: briefId,
      metadata: {
        clientName: user.client.name,
        approvedBy: user.name,
        feedback,
      },
    });
  }

  revalidatePath(`/portal/briefs/${briefId}`);
}

export async function requestRevisions(
  briefId: string,
  revisionNotes: string
): Promise<void> {
  const user = await getPortalUser();

  if (!user.permissions.canApprove) {
    throw new Error('You do not have permission to request revisions');
  }

  if (!revisionNotes.trim()) {
    throw new Error('Please provide revision notes');
  }

  const approval = await db.briefApproval.findFirst({
    where: {
      briefId,
      brief: { clientId: user.clientId },
      status: 'PENDING',
    },
    include: {
      brief: true,
    },
  });

  if (!approval) {
    throw new Error('No pending approval found');
  }

  // Update approval
  await db.briefApproval.update({
    where: { id: approval.id },
    data: {
      status: 'REVISIONS_REQUESTED',
      respondedAt: new Date(),
      respondedById: user.id,
      revisionNotes,
    },
  });

  // Update brief status
  await db.brief.update({
    where: { id: briefId },
    data: {
      status: 'REVISIONS',
    },
  });

  // Notify assignee
  if (approval.brief.assigneeId) {
    await notificationService.send({
      type: 'brief.feedback',
      recipientId: approval.brief.assigneeId,
      title: 'Client requested revisions',
      body: approval.brief.title,
      actionUrl: `/briefs/${briefId}`,
      entityType: 'brief',
      entityId: briefId,
      priority: 'high',
      metadata: {
        clientName: user.client.name,
        requestedBy: user.name,
        revisionNotes,
      },
    });
  }

  revalidatePath(`/portal/briefs/${briefId}`);
}

export async function addComment(
  briefId: string,
  content: string
): Promise<void> {
  const user = await getPortalUser();

  const brief = await db.brief.findFirst({
    where: { id: briefId, clientId: user.clientId },
  });

  if (!brief) {
    throw new Error('Brief not found');
  }

  await db.clientComment.create({
    data: {
      briefId,
      portalUserId: user.id,
      content,
    },
  });

  // Notify assignee
  if (brief.assigneeId) {
    await notificationService.send({
      type: 'brief.comment',
      recipientId: brief.assigneeId,
      title: 'New client comment',
      body: content.slice(0, 100),
      actionUrl: `/briefs/${briefId}`,
      entityType: 'brief',
      entityId: briefId,
    });
  }

  revalidatePath(`/portal/briefs/${briefId}`);
}
```

---

## Assets & Files

```typescript
// src/app/portal/assets/page.tsx

import { getPortalUser } from '@/lib/portal/session';
import { db } from '@/lib/db';
import { FileGallery } from '@/components/files/FileGallery';
import { FolderNav } from './components/FolderNav';

export default async function PortalAssetsPage({
  searchParams,
}: {
  searchParams: { folder?: string; category?: string };
}) {
  const user = await getPortalUser();

  // Get client files
  const files = await db.file.findMany({
    where: {
      clientFiles: {
        some: { clientId: user.clientId },
      },
      isArchived: false,
      ...(searchParams.category && { category: searchParams.category }),
    },
    include: {
      clientFiles: {
        where: { clientId: user.clientId },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by role
  const brandAssets = files.filter((f) =>
    f.clientFiles.some((cf) => cf.role === 'brand')
  );
  const deliverables = files.filter((f) =>
    f.clientFiles.some((cf) => cf.role === 'deliverable')
  );
  const other = files.filter((f) =>
    f.clientFiles.some((cf) => !['brand', 'deliverable'].includes(cf.role))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Assets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FolderNav
            sections={[
              { name: 'Brand Assets', count: brandAssets.length, href: '?category=brand' },
              { name: 'Deliverables', count: deliverables.length, href: '?category=deliverable' },
              { name: 'All Files', count: files.length, href: '/portal/assets' },
            ]}
          />
        </div>

        <div className="lg:col-span-3">
          {searchParams.category === 'brand' && (
            <FileGallery
              files={brandAssets}
              view="grid"
              onDownload={downloadFile}
            />
          )}

          {searchParams.category === 'deliverable' && (
            <FileGallery
              files={deliverables}
              view="list"
              onDownload={downloadFile}
            />
          )}

          {!searchParams.category && (
            <>
              {brandAssets.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Brand Assets</h2>
                  <FileGallery
                    files={brandAssets.slice(0, 6)}
                    view="grid"
                    onDownload={downloadFile}
                  />
                </div>
              )}

              {deliverables.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h2 className="text-lg font-semibold">Recent Deliverables</h2>
                  <FileGallery
                    files={deliverables.slice(0, 10)}
                    view="list"
                    onDownload={downloadFile}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Internal: Request Approval

```typescript
// src/modules/briefs/actions/approval-actions.ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function requestClientApproval(
  briefId: string,
  fileIds: string[]
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const brief = await db.brief.findFirst({
    where: {
      id: briefId,
      organizationId: session.user.organizationId,
    },
    include: {
      client: {
        include: {
          portalUsers: {
            where: { isActive: true, permissions: { path: ['canApprove'], equals: true } },
          },
        },
      },
    },
  });

  if (!brief) throw new Error('Brief not found');

  // Get current version
  const latestApproval = await db.briefApproval.findFirst({
    where: { briefId },
    orderBy: { version: 'desc' },
  });

  const version = (latestApproval?.version || 0) + 1;

  // Create approval request
  const approval = await db.briefApproval.create({
    data: {
      briefId,
      version,
      requestedById: session.user.id,
      fileIds,
    },
  });

  // Update brief status
  await db.brief.update({
    where: { id: briefId },
    data: { status: 'CLIENT_REVIEW' },
  });

  // Notify client approvers
  for (const approver of brief.client.portalUsers) {
    await sendEmail({
      to: approver.email,
      subject: `Approval Required: ${brief.title}`,
      template: 'approval-request',
      data: {
        approverName: approver.name,
        briefTitle: brief.title,
        briefNumber: brief.briefNumber,
        clientName: brief.client.name,
        requestedBy: session.user.name,
        approvalLink: `${process.env.PORTAL_URL}/briefs/${briefId}`,
      },
    });
  }

  revalidatePath(`/briefs/${briefId}`);
}
```

---

## Implementation Checklist

### Phase 10.1: Authentication
- [ ] Create ClientPortalUser and session models
- [ ] Implement magic link authentication
- [ ] Build login/verification pages
- [ ] Add session middleware

### Phase 10.2: Portal Core
- [ ] Create portal layout (header, sidebar)
- [ ] Build dashboard with stats
- [ ] Implement briefs list with filters
- [ ] Build brief detail page

### Phase 10.3: Approval Workflow
- [ ] Create BriefApproval model
- [ ] Build approval request flow (internal)
- [ ] Build approval UI (portal)
- [ ] Implement revision request flow
- [ ] Add notifications for approvals

### Phase 10.4: Assets & Files
- [ ] Create portal assets page
- [ ] Implement file download for clients
- [ ] Build brand assets gallery
- [ ] Add deliverables archive

### Phase 10.5: Client Requests
- [ ] Create ClientBriefRequest model
- [ ] Build brief request form
- [ ] Implement review workflow (internal)
- [ ] Add conversion to brief

---

## TeamLMTD Configuration

```typescript
const lmtdPortalConfig = {
  // Branding
  branding: {
    logo: '/tenants/lmtd/portal-logo.svg',
    primaryColor: '#52EDC7',
    welcomeMessage: 'Welcome to your TeamLMTD Portal',
  },

  // Authentication
  auth: {
    magicLinkOnly: true,
    sessionDays: 30,
    allowedDomains: null,  // Allow any domain
  },

  // Features
  features: {
    briefRequests: true,
    fileDownloads: true,
    comments: true,
    approvals: true,
    reports: false,  // Phase 2
  },

  // Default permissions for new users
  defaultPermissions: {
    canSubmitBriefs: true,
    canApprove: false,  // Must be explicitly granted
    canViewReports: false,
    canDownloadAssets: true,
    canViewAllBriefs: true,
  },

  // Email templates
  emails: {
    magicLink: 'portal-magic-link',
    approvalRequest: 'portal-approval-request',
    approvalConfirmed: 'portal-approval-confirmed',
  },
};
```

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
