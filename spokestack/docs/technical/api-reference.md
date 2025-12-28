# API Reference

SpokeStack provides both internal APIs (Server Actions) and external REST APIs.

---

## Authentication

All API requests require authentication.

### Session-Based (Internal)
Server Components and Actions use NextAuth.js session:

```typescript
import { auth } from "@/lib/auth";

export async function getServerSession() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}
```

### API Keys (External)
For external integrations, use API keys:

```
Authorization: Bearer sk_live_xxxxxxxxxxxx
```

---

## REST Endpoints

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List organizations |
| GET | `/api/organizations/:id` | Get organization |
| POST | `/api/organizations` | Create organization |
| PATCH | `/api/organizations/:id` | Update organization |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Briefs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/briefs` | List briefs |
| GET | `/api/briefs/:id` | Get brief |
| POST | `/api/briefs` | Create brief |
| PATCH | `/api/briefs/:id` | Update brief |
| DELETE | `/api/briefs/:id` | Delete brief |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |

### Time Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-entries` | List entries |
| POST | `/api/time-entries` | Create entry |
| PATCH | `/api/time-entries/:id` | Update entry |
| DELETE | `/api/time-entries/:id` | Delete entry |

### RFPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfp` | List RFPs |
| GET | `/api/rfp/:id` | Get RFP |
| POST | `/api/rfp` | Create RFP |
| PATCH | `/api/rfp/:id` | Update RFP |

---

## Query Parameters

### Pagination
```
?page=1&limit=20
```

### Filtering
```
?status=ACTIVE&clientId=xxx
```

### Sorting
```
?sortBy=createdAt&sortOrder=desc
```

### Including Relations
```
?include=client,assignee
```

---

## Response Format

### Success
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid auth |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits

| Tier | Requests/Minute |
|------|----------------|
| Free | 60 |
| Pro | 300 |
| Enterprise | 1000 |

Rate limit headers:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1703750400
```

---

## Webhooks

Configure webhooks for real-time event notifications.

### Events
- `brief.created`
- `brief.updated`
- `brief.completed`
- `rfp.created`
- `rfp.won`
- `rfp.lost`
- `time_entry.created`
- `leave.requested`
- `leave.approved`

### Payload
```json
{
  "event": "brief.created",
  "timestamp": "2025-12-28T12:00:00Z",
  "data": {
    "id": "xxx",
    "title": "New Brief",
    ...
  }
}
```

---

*Next: [Database Schema](./database-schema.md)*
