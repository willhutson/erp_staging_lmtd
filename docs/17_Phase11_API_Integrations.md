# Phase 11: API & Integration Layer - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Core platform (Phases 1-5)

---

## Overview

A comprehensive API layer enabling third-party integrations, automation platforms (n8n, Zapier, Make), and custom app development on top of SpokeStack.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API & INTEGRATION ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EXTERNAL SYSTEMS                 API LAYER                 SPOKESTACK       │
│                                                                              │
│  ┌─────────────┐                ┌─────────────┐           ┌─────────────┐   │
│  │ n8n         │───────────────▶│ REST API    │──────────▶│ Server      │   │
│  │ Zapier      │   API Key      │ /api/v1/*   │           │ Actions     │   │
│  │ Make        │                └─────────────┘           └─────────────┘   │
│  └─────────────┘                                                             │
│                                 ┌─────────────┐           ┌─────────────┐   │
│  ┌─────────────┐                │ Webhook     │◀──────────│ Event       │   │
│  │ Custom Apps │◀───────────────│ Delivery    │           │ Bus         │   │
│  │ Middleware  │   Webhooks     └─────────────┘           └─────────────┘   │
│  └─────────────┘                                                             │
│                                 ┌─────────────┐           ┌─────────────┐   │
│  ┌─────────────┐                │ Inbound     │──────────▶│ Action      │   │
│  │ Slack       │───────────────▶│ Webhooks    │           │ Handlers    │   │
│  │ Google      │   Signatures   └─────────────┘           └─────────────┘   │
│  └─────────────┘                                                             │
│                                 ┌─────────────┐                              │
│  ┌─────────────┐                │ OpenAPI     │                              │
│  │ Developers  │◀───────────────│ Spec + Docs │                              │
│  └─────────────┘                └─────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
// API Keys for external access
model ApiKey {
  id              String   @id @default(cuid())
  organizationId  String

  // Key data
  name            String   // "n8n Production", "Zapier Integration"
  keyHash         String   @unique  // SHA-256 of the key (never store raw)
  keyPrefix       String   // First 8 chars for identification: "sk_live_a1b2..."

  // Permissions
  scopes          String[] // ["briefs:read", "briefs:write", "time:read"]

  // Rate limiting
  rateLimit       Int      @default(1000)  // Requests per hour

  // Status
  isActive        Boolean  @default(true)
  lastUsedAt      DateTime?
  usageCount      Int      @default(0)

  // Expiry
  expiresAt       DateTime?

  // Audit
  createdById     String
  createdAt       DateTime @default(now())
  revokedAt       DateTime?
  revokedById     String?

  organization    Organization @relation(fields: [organizationId], references: [id])
  createdBy       User         @relation("ApiKeyCreator", fields: [createdById], references: [id])

  @@index([organizationId])
  @@index([keyHash])
  @@map("api_keys")
}

// Webhook subscriptions (outbound)
model WebhookSubscription {
  id              String   @id @default(cuid())
  organizationId  String

  // Target
  url             String   // https://hooks.zapier.com/...
  name            String   // "Zapier Brief Notifications"

  // Events to subscribe to
  events          String[] // ["brief.created", "brief.completed"]

  // Security
  secret          String   // For HMAC signature verification

  // Filtering (optional)
  filters         Json?    // { "briefType": ["VIDEO_SHOOT"], "clientId": "xxx" }

  // Status
  isActive        Boolean  @default(true)

  // Health tracking
  lastDeliveryAt  DateTime?
  lastStatus      Int?     // Last HTTP status code
  failureCount    Int      @default(0)
  disabledAt      DateTime?  // Auto-disabled after failures

  // Metadata
  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  deliveries      WebhookDelivery[]

  @@index([organizationId])
  @@map("webhook_subscriptions")
}

// Webhook delivery log
model WebhookDelivery {
  id              String   @id @default(cuid())
  subscriptionId  String

  // Event data
  event           String   // "brief.created"
  payload         Json     // The sent payload

  // Delivery attempt
  attemptNumber   Int      @default(1)

  // Response
  status          String   // "pending", "success", "failed"
  statusCode      Int?
  responseBody    String?  @db.Text
  responseTime    Int?     // ms

  // Error info
  error           String?

  // Timestamps
  createdAt       DateTime @default(now())
  deliveredAt     DateTime?
  nextRetryAt     DateTime?

  subscription    WebhookSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId, createdAt])
  @@index([status, nextRetryAt])
  @@map("webhook_deliveries")
}

// API request log (for debugging and rate limiting)
model ApiRequestLog {
  id              String   @id @default(cuid())
  organizationId  String
  apiKeyId        String?

  // Request
  method          String   // GET, POST, etc.
  path            String   // /api/v1/briefs
  query           Json?

  // Response
  statusCode      Int
  responseTime    Int      // ms

  // Client info
  ipAddress       String?
  userAgent       String?

  createdAt       DateTime @default(now())

  @@index([organizationId, createdAt])
  @@index([apiKeyId, createdAt])
  @@map("api_request_logs")
}
```

---

## API Key Management

```typescript
// src/lib/api/keys.ts

import { db } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX = 'sk_live_';

export async function createApiKey(options: {
  organizationId: string;
  name: string;
  scopes: string[];
  createdById: string;
  expiresAt?: Date;
}): Promise<{ key: string; apiKey: ApiKey }> {
  // Generate key
  const rawKey = randomBytes(32).toString('base64url');
  const fullKey = `${KEY_PREFIX}${rawKey}`;
  const keyHash = hashKey(fullKey);
  const keyPrefix = fullKey.substring(0, 16);

  const apiKey = await db.apiKey.create({
    data: {
      organizationId: options.organizationId,
      name: options.name,
      keyHash,
      keyPrefix,
      scopes: options.scopes,
      createdById: options.createdById,
      expiresAt: options.expiresAt,
    },
  });

  // Return raw key only once - it cannot be retrieved later
  return { key: fullKey, apiKey };
}

export async function validateApiKey(key: string): Promise<{
  apiKey: ApiKey;
  organizationId: string;
  scopes: string[];
} | null> {
  if (!key.startsWith(KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashKey(key);

  const apiKey = await db.apiKey.findFirst({
    where: {
      keyHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  if (!apiKey) {
    return null;
  }

  // Update usage stats
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  });

  return {
    apiKey,
    organizationId: apiKey.organizationId,
    scopes: apiKey.scopes,
  };
}

export async function revokeApiKey(keyId: string, revokedById: string): Promise<void> {
  await db.apiKey.update({
    where: { id: keyId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedById,
    },
  });
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Available scopes
export const API_SCOPES = {
  'briefs:read': 'Read briefs',
  'briefs:write': 'Create and update briefs',
  'briefs:delete': 'Delete briefs',
  'clients:read': 'Read clients',
  'clients:write': 'Create and update clients',
  'users:read': 'Read users',
  'time:read': 'Read time entries',
  'time:write': 'Create time entries',
  'submissions:read': 'Read form submissions',
  'submissions:write': 'Create submissions',
  'submissions:approve': 'Approve/reject submissions',
  'files:read': 'Read and download files',
  'files:write': 'Upload files',
  'webhooks:manage': 'Manage webhook subscriptions',
} as const;
```

---

## REST API Endpoints

### API Middleware

```typescript
// src/lib/api/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './keys';
import { db } from '@/lib/db';

export interface ApiContext {
  organizationId: string;
  apiKeyId: string;
  scopes: string[];
}

export async function withApiAuth(
  request: NextRequest,
  requiredScopes: string[],
  handler: (ctx: ApiContext) => Promise<Response>
): Promise<Response> {
  const startTime = Date.now();

  // Extract API key from header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return apiError('Missing or invalid Authorization header', 401);
  }

  const key = authHeader.substring(7);
  const auth = await validateApiKey(key);

  if (!auth) {
    return apiError('Invalid API key', 401);
  }

  // Check scopes
  const hasScopes = requiredScopes.every((s) => auth.scopes.includes(s));
  if (!hasScopes) {
    return apiError(`Missing required scopes: ${requiredScopes.join(', ')}`, 403);
  }

  // Rate limiting check
  const isRateLimited = await checkRateLimit(auth.apiKey);
  if (isRateLimited) {
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const response = await handler({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKey.id,
      scopes: auth.scopes,
    });

    // Log request
    await logApiRequest({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKey.id,
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return response;
  } catch (error) {
    console.error('API Error:', error);
    return apiError('Internal server error', 500);
  }
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: { message } }, { status });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): Response {
  return Response.json({
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
    },
  });
}
```

### Briefs API

```typescript
// src/app/api/v1/briefs/route.ts

import { NextRequest } from 'next/server';
import { withApiAuth, apiSuccess, apiPaginated, apiError } from '@/lib/api/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// GET /api/v1/briefs
export async function GET(request: NextRequest) {
  return withApiAuth(request, ['briefs:read'], async (ctx) => {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const assigneeId = searchParams.get('assignee_id');

    const where = {
      organizationId: ctx.organizationId,
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(assigneeId && { assigneeId }),
    };

    const [briefs, total] = await Promise.all([
      db.brief.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.brief.count({ where }),
    ]);

    return apiPaginated(briefs, total, limit, offset);
  });
}

// POST /api/v1/briefs
const createBriefSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['VIDEO_SHOOT', 'VIDEO_EDIT', 'DESIGN', 'COPYWRITING_EN', 'COPYWRITING_AR', 'PAID_MEDIA', 'RFP']),
  clientId: z.string().cuid(),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  assigneeId: z.string().cuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  return withApiAuth(request, ['briefs:write'], async (ctx) => {
    const body = await request.json();
    const parsed = createBriefSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(`Validation error: ${parsed.error.message}`, 400);
    }

    const data = parsed.data;

    // Verify client belongs to org
    const client = await db.client.findFirst({
      where: { id: data.clientId, organizationId: ctx.organizationId },
    });

    if (!client) {
      return apiError('Client not found', 404);
    }

    // Generate brief number
    const briefNumber = await generateBriefNumber(ctx.organizationId, data.type);

    const brief = await db.brief.create({
      data: {
        organizationId: ctx.organizationId,
        briefNumber,
        title: data.title,
        type: data.type,
        clientId: data.clientId,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        assigneeId: data.assigneeId,
        priority: data.priority || 'NORMAL',
        status: 'DRAFT',
        metadata: data.metadata,
      },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Emit event for webhooks
    await emitEvent('brief.created', ctx.organizationId, brief);

    return apiSuccess(brief, 201);
  });
}

// src/app/api/v1/briefs/[id]/route.ts

// GET /api/v1/briefs/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiAuth(request, ['briefs:read'], async (ctx) => {
    const brief = await db.brief.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
      include: {
        client: true,
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        files: { include: { file: true } },
      },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    return apiSuccess(brief);
  });
}

// PATCH /api/v1/briefs/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiAuth(request, ['briefs:write'], async (ctx) => {
    const body = await request.json();

    const brief = await db.brief.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    const updated = await db.brief.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        assigneeId: body.assigneeId,
        priority: body.priority,
        status: body.status,
      },
    });

    await emitEvent('brief.updated', ctx.organizationId, updated);

    return apiSuccess(updated);
  });
}

// DELETE /api/v1/briefs/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiAuth(request, ['briefs:delete'], async (ctx) => {
    const brief = await db.brief.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    await db.brief.delete({ where: { id: params.id } });

    await emitEvent('brief.deleted', ctx.organizationId, { id: params.id });

    return apiSuccess({ deleted: true });
  });
}
```

### Additional Endpoints

```typescript
// API Endpoints Summary

// Briefs
// GET    /api/v1/briefs              - List briefs (paginated, filterable)
// POST   /api/v1/briefs              - Create brief
// GET    /api/v1/briefs/:id          - Get brief
// PATCH  /api/v1/briefs/:id          - Update brief
// DELETE /api/v1/briefs/:id          - Delete brief
// POST   /api/v1/briefs/:id/status   - Update status

// Clients
// GET    /api/v1/clients             - List clients
// POST   /api/v1/clients             - Create client
// GET    /api/v1/clients/:id         - Get client
// PATCH  /api/v1/clients/:id         - Update client

// Users
// GET    /api/v1/users               - List users (read-only)
// GET    /api/v1/users/:id           - Get user

// Time Entries
// GET    /api/v1/time-entries        - List time entries
// POST   /api/v1/time-entries        - Log time
// PATCH  /api/v1/time-entries/:id    - Update entry
// DELETE /api/v1/time-entries/:id    - Delete entry

// Submissions
// GET    /api/v1/submissions         - List submissions
// POST   /api/v1/submissions         - Create submission
// GET    /api/v1/submissions/:id     - Get submission
// POST   /api/v1/submissions/:id/approve  - Approve
// POST   /api/v1/submissions/:id/reject   - Reject

// Files
// GET    /api/v1/files               - List files
// POST   /api/v1/files/upload        - Get upload URL
// GET    /api/v1/files/:id           - Get file metadata
// GET    /api/v1/files/:id/download  - Get download URL

// Webhooks (self-management)
// GET    /api/v1/webhooks            - List subscriptions
// POST   /api/v1/webhooks            - Create subscription
// PATCH  /api/v1/webhooks/:id        - Update subscription
// DELETE /api/v1/webhooks/:id        - Delete subscription
// GET    /api/v1/webhooks/:id/deliveries - Delivery history
```

---

## Webhook System (Outbound)

### Event Emitter

```typescript
// src/lib/api/events.ts

import { db } from '@/lib/db';
import { webhookDelivery } from './webhook-delivery';

export type EventType =
  | 'brief.created'
  | 'brief.updated'
  | 'brief.status_changed'
  | 'brief.completed'
  | 'brief.deleted'
  | 'brief.assigned'
  | 'submission.created'
  | 'submission.approved'
  | 'submission.rejected'
  | 'time.logged'
  | 'client.created'
  | 'client.updated'
  | 'file.uploaded';

interface EventPayload {
  event: EventType;
  timestamp: string;
  organization_id: string;
  data: Record<string, unknown>;
}

export async function emitEvent(
  event: EventType,
  organizationId: string,
  data: Record<string, unknown>
): Promise<void> {
  const payload: EventPayload = {
    event,
    timestamp: new Date().toISOString(),
    organization_id: organizationId,
    data,
  };

  // Find active subscriptions for this event
  const subscriptions = await db.webhookSubscription.findMany({
    where: {
      organizationId,
      isActive: true,
      events: { has: event },
    },
  });

  // Queue deliveries
  for (const subscription of subscriptions) {
    // Check filters
    if (subscription.filters && !matchesFilters(data, subscription.filters)) {
      continue;
    }

    // Queue for delivery
    await webhookDelivery.queue({
      subscriptionId: subscription.id,
      event,
      payload,
      url: subscription.url,
      secret: subscription.secret,
    });
  }
}

function matchesFilters(data: Record<string, unknown>, filters: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (!value.includes(data[key])) return false;
    } else if (data[key] !== value) {
      return false;
    }
  }
  return true;
}
```

### Webhook Delivery Service

```typescript
// src/lib/api/webhook-delivery.ts

import { db } from '@/lib/db';
import { createHmac } from 'crypto';

const MAX_RETRIES = 5;
const RETRY_DELAYS = [0, 60, 300, 1800, 7200]; // seconds: immediate, 1min, 5min, 30min, 2hr

interface DeliveryJob {
  subscriptionId: string;
  event: string;
  payload: Record<string, unknown>;
  url: string;
  secret: string;
}

class WebhookDeliveryService {
  async queue(job: DeliveryJob): Promise<void> {
    // Create delivery record
    const delivery = await db.webhookDelivery.create({
      data: {
        subscriptionId: job.subscriptionId,
        event: job.event,
        payload: job.payload,
        status: 'pending',
      },
    });

    // Attempt immediate delivery
    await this.deliver(delivery.id);
  }

  async deliver(deliveryId: string): Promise<void> {
    const delivery = await db.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { subscription: true },
    });

    if (!delivery || !delivery.subscription.isActive) {
      return;
    }

    const { subscription } = delivery;
    const payload = JSON.stringify(delivery.payload);

    // Generate signature
    const signature = this.generateSignature(payload, subscription.secret);
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      const startTime = Date.now();

      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery-Id': delivery.id,
        },
        body: payload,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text().catch(() => '');

      if (response.ok) {
        // Success
        await db.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'success',
            statusCode: response.status,
            responseBody: responseBody.substring(0, 1000),
            responseTime,
            deliveredAt: new Date(),
          },
        });

        // Update subscription health
        await db.webhookSubscription.update({
          where: { id: subscription.id },
          data: {
            lastDeliveryAt: new Date(),
            lastStatus: response.status,
            failureCount: 0,
          },
        });
      } else {
        // HTTP error - schedule retry
        await this.handleFailure(delivery, response.status, responseBody);
      }
    } catch (error) {
      // Network error - schedule retry
      await this.handleFailure(delivery, null, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleFailure(
    delivery: WebhookDelivery,
    statusCode: number | null,
    error: string
  ): Promise<void> {
    const attemptNumber = delivery.attemptNumber + 1;

    if (attemptNumber > MAX_RETRIES) {
      // Give up
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          statusCode,
          error,
        },
      });

      // Increment subscription failure count
      const subscription = await db.webhookSubscription.update({
        where: { id: delivery.subscriptionId },
        data: {
          failureCount: { increment: 1 },
          lastStatus: statusCode,
        },
      });

      // Auto-disable after 10 consecutive failures
      if (subscription.failureCount >= 10) {
        await db.webhookSubscription.update({
          where: { id: subscription.id },
          data: {
            isActive: false,
            disabledAt: new Date(),
          },
        });
      }
    } else {
      // Schedule retry
      const retryDelay = RETRY_DELAYS[attemptNumber] || 7200;
      const nextRetryAt = new Date(Date.now() + retryDelay * 1000);

      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attemptNumber,
          statusCode,
          error,
          nextRetryAt,
        },
      });

      // In production, use a job queue (Inngest, Trigger.dev, etc.)
      // For now, simple setTimeout for demonstration
      setTimeout(() => this.deliver(delivery.id), retryDelay * 1000);
    }
  }

  private generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  // Verify incoming webhook (for documentation purposes)
  static verifySignature(
    payload: string,
    signatureHeader: string,
    secret: string
  ): boolean {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.substring(2);
    const signature = parts.find((p) => p.startsWith('v1='))?.substring(3);

    if (!timestamp || !signature) {
      return false;
    }

    // Check timestamp is within 5 minutes
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (age > 300) {
      return false;
    }

    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    return signature === expected;
  }
}

export const webhookDelivery = new WebhookDeliveryService();
```

---

## OpenAPI Specification

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: SpokeStack API
  version: 1.0.0
  description: |
    REST API for SpokeStack platform integration.

    ## Authentication
    All requests require a Bearer token in the Authorization header:
    ```
    Authorization: Bearer sk_live_xxxxxxxxxxxx
    ```

    ## Rate Limiting
    Default rate limit is 1000 requests per hour per API key.
    Headers returned: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

servers:
  - url: https://api.spokestack.io/v1
    description: Production

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer

  schemas:
    Brief:
      type: object
      properties:
        id:
          type: string
        briefNumber:
          type: string
        title:
          type: string
        type:
          type: string
          enum: [VIDEO_SHOOT, VIDEO_EDIT, DESIGN, COPYWRITING_EN, COPYWRITING_AR, PAID_MEDIA, RFP]
        status:
          type: string
          enum: [DRAFT, PENDING, IN_PROGRESS, IN_REVIEW, CLIENT_REVIEW, REVISIONS, COMPLETED, CANCELLED]
        clientId:
          type: string
        assigneeId:
          type: string
        deadline:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            message:
              type: string

paths:
  /briefs:
    get:
      summary: List briefs
      tags: [Briefs]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
        - name: status
          in: query
          schema:
            type: string
        - name: client_id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of briefs

    post:
      summary: Create brief
      tags: [Briefs]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, type, clientId]
              properties:
                title:
                  type: string
                type:
                  type: string
                clientId:
                  type: string
                deadline:
                  type: string
                  format: date-time
      responses:
        '201':
          description: Brief created

  /briefs/{id}:
    get:
      summary: Get brief
      tags: [Briefs]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Brief details
        '404':
          description: Brief not found

  /webhooks:
    get:
      summary: List webhook subscriptions
      tags: [Webhooks]
      responses:
        '200':
          description: List of subscriptions

    post:
      summary: Create webhook subscription
      tags: [Webhooks]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [url, events]
              properties:
                url:
                  type: string
                  format: uri
                name:
                  type: string
                events:
                  type: array
                  items:
                    type: string
                    enum: [brief.created, brief.updated, brief.completed, submission.created]
      responses:
        '201':
          description: Subscription created
```

---

## n8n Integration

### n8n Node Structure

```typescript
// For n8n community node package

// SpokeStack Trigger Node (webhook-based)
export class SpokestackTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SpokeStack Trigger',
    name: 'spokestackTrigger',
    group: ['trigger'],
    version: 1,
    description: 'Trigger on SpokeStack events',
    defaults: { name: 'SpokeStack Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [{ name: 'spokestackApi', required: true }],
    webhooks: [{ name: 'default', httpMethod: 'POST', path: 'webhook' }],
    properties: [
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          { name: 'Brief Created', value: 'brief.created' },
          { name: 'Brief Updated', value: 'brief.updated' },
          { name: 'Brief Completed', value: 'brief.completed' },
          { name: 'Submission Created', value: 'submission.created' },
          { name: 'Time Logged', value: 'time.logged' },
        ],
        default: ['brief.created'],
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData();
    return { workflowData: [[{ json: body }]] };
  }
}

// SpokeStack Action Node
export class Spokestack implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SpokeStack',
    name: 'spokestack',
    group: ['transform'],
    version: 1,
    description: 'Interact with SpokeStack API',
    defaults: { name: 'SpokeStack' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'spokestackApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Brief', value: 'brief' },
          { name: 'Client', value: 'client' },
          { name: 'Time Entry', value: 'timeEntry' },
          { name: 'Submission', value: 'submission' },
        ],
        default: 'brief',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: { show: { resource: ['brief'] } },
        options: [
          { name: 'Create', value: 'create' },
          { name: 'Get', value: 'get' },
          { name: 'Get All', value: 'getAll' },
          { name: 'Update', value: 'update' },
          { name: 'Update Status', value: 'updateStatus' },
        ],
        default: 'getAll',
      },
      // ... more properties per operation
    ],
  };
}
```

---

## Implementation Checklist

### Phase 11.1: API Foundation
- [ ] Create ApiKey, WebhookSubscription, WebhookDelivery models
- [ ] Implement API key creation, validation, revocation
- [ ] Build API middleware (auth, rate limiting, logging)
- [ ] Create API key management UI in settings

### Phase 11.2: REST Endpoints
- [ ] Implement /api/v1/briefs CRUD
- [ ] Implement /api/v1/clients CRUD
- [ ] Implement /api/v1/users (read-only)
- [ ] Implement /api/v1/time-entries CRUD
- [ ] Implement /api/v1/submissions + approve/reject
- [ ] Implement /api/v1/files upload/download

### Phase 11.3: Webhook System
- [ ] Build event emitter with subscription matching
- [ ] Implement webhook delivery with retries
- [ ] Add signature verification
- [ ] Build webhook management endpoints
- [ ] Create webhook logs UI

### Phase 11.4: Documentation
- [ ] Generate OpenAPI 3.1 specification
- [ ] Build API documentation page
- [ ] Add code examples (curl, JS, Python)
- [ ] Create webhook payload examples

### Phase 11.5: n8n / Automation
- [ ] Publish OpenAPI spec for auto-generation
- [ ] Create n8n community node (optional)
- [ ] Test with n8n, Zapier, Make
- [ ] Document common automation recipes

---

## TeamLMTD Configuration

```typescript
const lmtdApiConfig = {
  // Rate limits
  rateLimits: {
    default: 1000,      // per hour
    premium: 10000,     // per hour (future tiers)
  },

  // Default scopes for new keys
  defaultScopes: [
    'briefs:read',
    'clients:read',
    'users:read',
  ],

  // Webhook settings
  webhooks: {
    maxSubscriptions: 10,
    maxRetries: 5,
    signatureAlgorithm: 'sha256',
  },

  // Available events
  events: [
    'brief.created',
    'brief.updated',
    'brief.status_changed',
    'brief.completed',
    'brief.assigned',
    'submission.created',
    'submission.approved',
    'submission.rejected',
    'time.logged',
    'client.created',
  ],
};
```

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
