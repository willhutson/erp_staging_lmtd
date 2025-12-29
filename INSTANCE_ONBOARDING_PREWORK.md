# SpokeStack Instance Onboarding - Prework Checklist

Before spinning up your first production instance, complete these setup tasks. This ensures all integrations and services are ready to connect.

---

## 1. Domain & DNS Setup

### Primary Domain
- [ ] Register or designate a domain (e.g., `app.teamlmtd.com`)
- [ ] Configure DNS records:
  ```
  A     @       → Vercel IP (automatic if using Vercel)
  CNAME www     → cname.vercel-dns.com
  ```
- [ ] Add domain to Vercel project settings
- [ ] Enable SSL (automatic with Vercel)

### Email Domain (for notifications)
- [ ] Configure SPF record for sending domain
- [ ] Configure DKIM for email authentication
- [ ] Verify domain with your email provider (Resend, SendGrid, etc.)

---

## 2. Phyllo API (Creator Data)

**Purpose:** Aggregates creator metrics across Instagram, TikTok, YouTube, Twitter/X

### Setup Steps
1. [ ] Sign up at https://dashboard.getphyllo.com
2. [ ] Create a new application
3. [ ] Note your credentials:
   - `PHYLLO_CLIENT_ID`
   - `PHYLLO_CLIENT_SECRET`
   - `PHYLLO_ENVIRONMENT` (sandbox/production)
4. [ ] Configure allowed redirect URIs
5. [ ] Request production access (if needed)

### Pricing
- Starter: Free (limited API calls)
- Growth: Contact for pricing
- Docs: https://docs.getphyllo.com

---

## 3. Google Cloud Platform

### Create GCP Project
1. [ ] Go to https://console.cloud.google.com
2. [ ] Create new project: `spokestack-production`
3. [ ] Enable billing
4. [ ] Note your `GCP_PROJECT_ID`

### BigQuery (Data Warehouse)
1. [ ] Enable BigQuery API
2. [ ] Create dataset: `spokestack_analytics`
3. [ ] Create service account with BigQuery Admin role
4. [ ] Download JSON key file
5. [ ] Store as `GOOGLE_APPLICATION_CREDENTIALS` or `BIGQUERY_SERVICE_ACCOUNT_KEY`

### Google Drive (File Storage)
1. [ ] Enable Google Drive API
2. [ ] Configure OAuth consent screen
3. [ ] Create OAuth 2.0 credentials (Web application)
4. [ ] Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (dev)
5. [ ] Note credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Google Analytics 4
1. [ ] Enable Google Analytics Data API
2. [ ] Link GA4 property to GCP project
3. [ ] Grant service account "Viewer" access to GA4 property
4. [ ] Note your `GA4_PROPERTY_ID`

### Google Calendar (Optional)
1. [ ] Enable Google Calendar API
2. [ ] Uses same OAuth credentials as Drive

---

## 4. Automation Platform

### Option A: n8n (Self-hosted, Recommended)
**Pros:** Free, self-hosted, no per-task limits, GDPR compliant

1. [ ] Deploy n8n instance (Docker/Railway/Render)
   ```bash
   docker run -d --name n8n -p 5678:5678 n8nio/n8n
   ```
2. [ ] Configure webhook URL: `https://n8n.yourdomain.com`
3. [ ] Create API credentials for SpokeStack
4. [ ] Note: `N8N_WEBHOOK_URL`, `N8N_API_KEY`

### Option B: Zapier
**Pros:** No hosting, huge app library
**Cons:** Expensive at scale ($20-$100+/mo)

1. [ ] Sign up at https://zapier.com
2. [ ] Create a new Zap for testing
3. [ ] Note: `ZAPIER_WEBHOOK_URL`

### Option C: Make.com (Integromat)
**Pros:** Visual builder, cheaper than Zapier
**Cons:** Learning curve

1. [ ] Sign up at https://make.com
2. [ ] Create scenario with webhook trigger
3. [ ] Note webhook URL

---

## 5. Communication Services

### Slack Integration
1. [ ] Go to https://api.slack.com/apps
2. [ ] Create new app "SpokeStack"
3. [ ] Add Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `users:read`
4. [ ] Install to workspace
5. [ ] Note: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`

### Email Provider (Choose One)

#### Resend (Recommended)
1. [ ] Sign up at https://resend.com
2. [ ] Verify sending domain
3. [ ] Create API key
4. [ ] Note: `RESEND_API_KEY`

#### SendGrid
1. [ ] Sign up at https://sendgrid.com
2. [ ] Verify domain
3. [ ] Create API key with Mail Send permissions
4. [ ] Note: `SENDGRID_API_KEY`

---

## 6. Push Notifications (SpokeChat)

**No external service needed!** Generate VAPID keys locally:

```bash
npx web-push generate-vapid-keys
```

Store the output:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (e.g., `mailto:admin@teamlmtd.com`)

---

## 7. Database

### Supabase (Recommended)
1. [ ] Create project at https://supabase.com
2. [ ] Note connection strings:
   - `DATABASE_URL` (pooled, for Prisma)
   - `DIRECT_URL` (direct, for migrations)
3. [ ] Get Supabase keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Alternative: PlanetScale, Neon, Railway Postgres
- Similar setup, just need `DATABASE_URL`

---

## 8. File Storage

### Supabase Storage (if using Supabase)
- Already included, just enable Storage in dashboard

### Alternative: AWS S3 / Cloudflare R2
1. [ ] Create bucket
2. [ ] Create IAM user with S3 access
3. [ ] Note:
   - `S3_BUCKET`
   - `S3_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 9. Authentication

### NextAuth.js Setup
Already configured. Just need OAuth providers:

1. [ ] Google OAuth (from GCP setup above)
2. [ ] Optional: Azure AD for enterprise SSO

---

## Environment Variables Summary

```env
# Domain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
NEXTAUTH_SECRET=generate-random-32-char-string
NEXTAUTH_URL=https://app.yourdomain.com
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Phyllo
PHYLLO_CLIENT_ID=xxx
PHYLLO_CLIENT_SECRET=xxx
PHYLLO_ENVIRONMENT=production

# BigQuery
GCP_PROJECT_ID=spokestack-production
BIGQUERY_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Analytics
GA4_PROPERTY_ID=123456789

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxxx...
VAPID_PRIVATE_KEY=xxx
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Email
RESEND_API_KEY=re_xxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_SIGNING_SECRET=xxx

# Automation (n8n)
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook
N8N_API_KEY=xxx
```

---

## Pre-Launch Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database migrated (`pnpm db:push`)
- [ ] Seed data loaded (`pnpm db:seed`)
- [ ] Domain verified and SSL active
- [ ] Test login flow works
- [ ] Test email sending works
- [ ] Slack notifications posting
- [ ] File uploads working
- [ ] Push notifications registering

---

## Post-Launch

1. Configure organization settings in Admin
2. Invite team members
3. Connect integrations one by one
4. Set up automation workflows
5. Configure notification preferences

---

*Generated for SpokeStack v1.0 - December 2024*
