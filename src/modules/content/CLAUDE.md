# Content Module (Social CMS)

## Overview

The Content module provides a complete social media content management system with:
- Multi-platform post creation and scheduling
- Approval workflows with client portal integration
- Platform-specific preview components
- RESTful API for external integrations
- Webhook system for real-time notifications
- WhatsApp approval integration

## Architecture

```
/src/modules/content
├── actions/
│   ├── content-actions.ts      # Post CRUD operations
│   └── social-account-actions.ts # Social account management
├── services/
│   └── approval-workflow.ts    # Approval state machine
├── webhooks/
│   └── content-webhooks.ts     # Webhook emission system
└── CLAUDE.md                   # This file

/src/app/(dashboard)/content-engine
├── page.tsx                    # Calendar dashboard
├── ContentCalendarClient.tsx   # Interactive calendar
└── posts/
    ├── page.tsx               # Posts list
    ├── PostsListClient.tsx    # Posts grid/list view
    └── new/
        ├── page.tsx           # New post form
        └── NewPostForm.tsx    # Multi-platform post creation

/src/app/portal/content
├── page.tsx                   # Client content review list
└── [postId]/
    ├── page.tsx              # Content review page
    └── ContentReviewClient.tsx # Platform previews + approval UI

/src/app/api/content
├── route.ts                   # GET/POST /api/content
└── [postId]/
    ├── route.ts              # GET/PATCH/DELETE /api/content/[postId]
    └── approvals/
        └── route.ts          # Approval endpoints
```

## Database Schema

### Enums

```prisma
enum SocialPlatform {
  INSTAGRAM_FEED
  INSTAGRAM_STORY
  INSTAGRAM_REEL
  FACEBOOK_PAGE
  FACEBOOK_STORY
  THREADS
  TIKTOK
  YOUTUBE_VIDEO
  YOUTUBE_SHORT
  LINKEDIN_PAGE
  LINKEDIN_PERSONAL
  LINKEDIN_ARTICLE
  X_TWEET
  X_THREAD
  WORDPRESS
  CUSTOM_CMS
  PINTEREST
  SNAPCHAT
}

enum ContentType {
  SINGLE_IMAGE
  CAROUSEL
  VIDEO
  SHORT_VIDEO
  STORY
  TEXT_ONLY
  ARTICLE
  LIVE
}

enum ContentPostStatus {
  DRAFT
  INTERNAL_REVIEW
  CLIENT_REVIEW
  REVISION_REQUESTED
  APPROVED
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
  ARCHIVED
}
```

### Models

- **SocialAccount**: Client's connected social accounts
- **ContentPost**: Main post entity with multi-platform support
- **ContentAsset**: Media files with platform variants
- **ContentVersion**: Revision history
- **ContentApproval**: Approval workflow records
- **ContentComment**: Feedback and discussion
- **PlatformSpec**: Platform constraints (character limits, aspect ratios)

## Approval Workflow

### Status Flow

```
DRAFT → INTERNAL_REVIEW → CLIENT_REVIEW → APPROVED → SCHEDULED → PUBLISHED
           ↓                    ↓              ↓
    REVISION_REQUESTED ←————————┘              ↓
           ↓                               FAILED
         DRAFT
```

### Valid Transitions

| Current Status | Can Transition To |
|----------------|-------------------|
| DRAFT | INTERNAL_REVIEW, CLIENT_REVIEW, ARCHIVED |
| INTERNAL_REVIEW | DRAFT, CLIENT_REVIEW, REVISION_REQUESTED, APPROVED |
| CLIENT_REVIEW | INTERNAL_REVIEW, REVISION_REQUESTED, APPROVED |
| REVISION_REQUESTED | DRAFT, INTERNAL_REVIEW, CLIENT_REVIEW |
| APPROVED | SCHEDULED, PUBLISHING, REVISION_REQUESTED |
| SCHEDULED | APPROVED, PUBLISHING, ARCHIVED |
| PUBLISHING | PUBLISHED, FAILED |
| PUBLISHED | ARCHIVED |
| FAILED | DRAFT, SCHEDULED, ARCHIVED |
| ARCHIVED | DRAFT |

### Creating Approvals

```typescript
import { createApprovalRequest } from "@/modules/content/services/approval-workflow";

const result = await createApprovalRequest({
  postId: "post-id",
  approvalType: "CLIENT", // INTERNAL | CLIENT | LEGAL | FINAL
  requestedById: "user-id",
  clientContactId: "contact-id", // For client approvals
  notifyViaWhatsApp: true,
});
```

### Processing Responses

```typescript
import { processApprovalResponse } from "@/modules/content/services/approval-workflow";

await processApprovalResponse({
  approvalId: "approval-id",
  status: "APPROVED", // APPROVED | REJECTED | REVISION_REQUESTED
  respondedById: "user-id",
  responseNotes: "Looks great!",
});
```

## REST API

### Authentication

All endpoints support two authentication methods:

1. **API Key** (recommended for external integrations):
   ```
   X-API-Key: your-api-key
   ```

2. **Session Auth** (for internal UI):
   Uses NextAuth session cookies

### Endpoints

#### List Posts
```
GET /api/content
```

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| clientId | string | Filter by client |
| status | string | Filter by status |
| platforms | string | Comma-separated platforms |
| scheduledFrom | ISO datetime | Schedule range start |
| scheduledTo | ISO datetime | Schedule range end |
| search | string | Search title/caption |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| sortBy | string | Sort field (default: createdAt) |
| sortOrder | string | asc or desc (default: desc) |

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

#### Create Post
```
POST /api/content
```

Body:
```json
{
  "clientId": "client-id",
  "title": "Post Title",
  "platforms": ["INSTAGRAM_FEED", "FACEBOOK_PAGE"],
  "contentType": "SINGLE_IMAGE",
  "caption": "Post caption...",
  "captionAr": "Arabic caption...",
  "hashtags": ["#marketing", "#social"],
  "mentions": ["@brand"],
  "linkUrl": "https://example.com",
  "scheduledFor": "2024-01-15T10:00:00Z",
  "briefId": "brief-id"
}
```

#### Get Post
```
GET /api/content/[postId]
```

#### Update Post
```
PATCH /api/content/[postId]
```

#### Delete Post
```
DELETE /api/content/[postId]
```

#### List Approvals
```
GET /api/content/[postId]/approvals
```

#### Create Approval Request
```
POST /api/content/[postId]/approvals
```

Body:
```json
{
  "approvalType": "CLIENT",
  "clientContactId": "contact-id",
  "notes": "Please review by EOD",
  "dueDate": "2024-01-15T18:00:00Z",
  "notifyViaWhatsApp": true
}
```

#### Respond to Approval
```
PATCH /api/content/[postId]/approvals
```

Body:
```json
{
  "approvalId": "approval-id",
  "status": "APPROVED",
  "responseNotes": "Looks great!"
}
```

## Webhooks

### Event Types

| Event | Trigger |
|-------|---------|
| content.post.created | New post created |
| content.post.updated | Post updated |
| content.post.deleted | Post deleted |
| content.post.status_changed | Status transition |
| content.approval.requested | Approval request created |
| content.approval.responded | Approval response received |
| content.post.scheduled | Post scheduled for publishing |
| content.post.published | Post successfully published |
| content.post.publish_failed | Publishing failed |
| content.metrics.updated | Engagement metrics updated |
| content.notification.whatsapp | WhatsApp notification sent |

### Webhook Payload

```json
{
  "event": "content.approval.requested",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "webhookId": "uuid",
  "signature": "hmac-sha256-signature",
  "data": {
    "postId": "post-id",
    "approvalId": "approval-id",
    "approvalType": "CLIENT",
    "organizationId": "org-id",
    "clientId": "client-id"
  }
}
```

### Signature Verification

```typescript
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

### Subscribing to Webhooks

Create webhook subscriptions in Settings > Integrations > Webhooks:

1. Provide endpoint URL (must be HTTPS)
2. Select events to subscribe to
3. Copy the generated secret for signature verification

## WhatsApp Integration

### Approval Notifications

When `notifyViaWhatsApp: true` is set on an approval request:

1. System looks up client contact's phone number
2. Formats approval notification message with post details
3. Includes approval link to client portal
4. Emits `content.notification.whatsapp` webhook

### WhatsApp Response Processing

Clients can respond to approval requests via WhatsApp:

- **APPROVE** or ✅ → Approves content
- **REJECT** or ❌ → Rejects content
- **REVISION** or 📝 → Requests revisions

```typescript
import { processWhatsAppApprovalResponse } from "@/modules/content/services/approval-workflow";

const result = await processWhatsAppApprovalResponse(
  messageText, // "APPROVE"
  senderPhone  // "+971501234567"
);
```

## Platform Previews

The client portal includes visual previews for each platform:

- **Instagram**: Feed post with engagement icons
- **TikTok**: Full-screen vertical video format
- **LinkedIn**: Company post with rich content
- **X (Twitter)**: Tweet with media card
- **Facebook**: Uses Instagram-style preview
- **YouTube**: Uses LinkedIn-style preview

Previews are rendered in `ContentReviewClient.tsx` based on the selected platform tab.

## Usage Examples

### Creating a Post with Approval Flow

```typescript
// 1. Create post
const post = await createContentPost({
  organizationId: "org-id",
  clientId: "client-id",
  title: "Product Launch",
  platforms: ["INSTAGRAM_FEED", "LINKEDIN_PAGE"],
  contentType: "SINGLE_IMAGE",
  caption: "Exciting news! ...",
  createdById: "user-id",
});

// 2. Add assets
await addContentAsset(post.id, {
  type: "IMAGE",
  fileName: "launch.jpg",
  fileUrl: "https://storage.example.com/launch.jpg",
});

// 3. Submit for internal review
await createApprovalRequest({
  postId: post.id,
  approvalType: "INTERNAL",
  requestedById: "user-id",
});

// 4. After internal approval, submit for client review
await createApprovalRequest({
  postId: post.id,
  approvalType: "CLIENT",
  requestedById: "user-id",
  clientContactId: "contact-id",
  notifyViaWhatsApp: true,
});

// 5. After client approval, schedule
await schedulePost(post.id, new Date("2024-01-15T10:00:00Z"));
```

### Listening for Webhooks

```typescript
// Your webhook endpoint
app.post("/webhooks/content", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }

  const { event, data } = req.body;

  switch (event) {
    case "content.post.published":
      console.log(`Post ${data.postId} published to ${data.platforms}`);
      break;
    case "content.approval.responded":
      console.log(`Approval ${data.approvalId} ${data.status}`);
      break;
  }

  res.status(200).send("OK");
});
```

## Future Enhancements

### Phase 16.3+ (Planned)

1. **Social API Integrations**
   - Meta Graph API (Instagram, Facebook)
   - TikTok API
   - LinkedIn API
   - X (Twitter) API
   - YouTube Data API

2. **Auto-Publishing**
   - OAuth token management
   - Rate limit handling
   - Retry with backoff
   - Error recovery

3. **Analytics Ingestion**
   - Pull engagement metrics
   - Track post performance
   - A/B testing support

4. **Content Library**
   - Reusable asset management
   - Brand asset templates
   - Caption templates

5. **AI Features**
   - Caption generation
   - Hashtag suggestions
   - Best time to post
   - Performance predictions
