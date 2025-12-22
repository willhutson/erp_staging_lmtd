# Chat Module (SpokeChat)

## Overview

Internal communication platform with Slack-like features:
- Public and private channels
- Direct messages (1:1 and group)
- Real-time messaging via Pusher
- Rich text editing with Tiptap
- @mentions, reactions, threads
- File attachments

## Architecture

```
/src/modules/chat
├── actions/
│   ├── channel-actions.ts      # Channel CRUD, members, DMs
│   ├── message-actions.ts      # Messages, reactions, pins, search
│   └── presence-actions.ts     # User presence management
├── components/
│   ├── ChannelSidebar.tsx      # Channel list sidebar
│   ├── MessageEditor.tsx       # Tiptap-based message composer
│   ├── MessageList.tsx         # Message display with reactions
│   ├── MessageSearch.tsx       # Full-text search with filters
│   ├── ThreadView.tsx          # Thread conversation panel
│   ├── PresenceIndicator.tsx   # Online/away/offline dots
│   └── TypingIndicator.tsx     # "X is typing..." component
├── hooks/
│   └── usePresence.ts          # Automatic presence tracking
├── services/
│   ├── chat-notifications.ts   # System notification messages
│   ├── module-integrations.ts  # Hooks for other modules
│   └── holiday-reminders.ts    # UAE holiday reminders
└── CLAUDE.md                   # This file

/src/app/(dashboard)/chat
├── page.tsx                    # Chat index (welcome screen)
├── ChatLayout.tsx              # Layout with sidebar
└── [slug]/
    ├── page.tsx               # Channel view server component
    └── ChannelViewClient.tsx  # Interactive channel view

/src/lib/pusher.ts              # Pusher configuration
/src/app/api/pusher/auth/       # Auth endpoint for private channels
```

## Database Schema

### Channel Types
- `PUBLIC` - Open to all org members
- `PRIVATE` - Invite only
- `DM` - Direct messages

### Key Models

```prisma
model Channel {
  id              String
  name            String
  slug            String        // URL-friendly
  type            ChannelType
  icon            String?       // Emoji
  dmParticipantIds String[]     // For DM lookup
  isDefault       Boolean       // Auto-join new users
  lastMessageAt   DateTime?
  messageCount    Int
}

model Message {
  content         String        // Tiptap JSON or plain text
  contentFormat   MessageFormat
  parentId        String?       // Thread replies
  replyCount      Int
  mentionedUserIds String[]
  hasMentionAll   Boolean       // @channel, @here
}

model MessageReaction {
  emoji           String        // 👍, ❤️, etc.
}
```

## Real-Time with Pusher

### Environment Variables

```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=ap2
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

### Event Types

| Event | Payload | Description |
|-------|---------|-------------|
| `message:sent` | `{ message, channelId }` | New message |
| `message:edited` | `{ message, channelId }` | Message updated |
| `message:deleted` | `{ messageId, channelId }` | Message deleted |
| `reaction:added` | `{ messageId, reaction }` | Reaction added |
| `reaction:removed` | `{ messageId, emoji, userId }` | Reaction removed |
| `user:typing` | `{ user, channelId }` | Typing indicator |
| `user:stop-typing` | `{ userId, channelId }` | Stopped typing |
| `presence:changed` | `{ userId, status, ... }` | User presence update |
| `mention:received` | `{ message, mentionedBy }` | User mentioned |

### Channel Names

- `channel-{channelId}` - Messages in a channel
- `user-{userId}` - Personal notifications
- `presence-global` - Global presence updates

## Tiptap Editor

Features:
- Bold, italic, code, bullet lists
- @mentions with autocomplete
- Emoji picker
- Markdown shortcuts (`*bold*`, `_italic_`, `` `code` ``)
- Enter to send, Shift+Enter for newline

## Usage Examples

### Create a Channel

```typescript
import { createChannel } from "@/modules/chat/actions/channel-actions";

const channel = await createChannel({
  organizationId: "org-123",
  name: "Project Updates",
  type: "PUBLIC",
  icon: "📢",
  createdById: "user-123",
});
```

### Send a Message

```typescript
import { sendMessage } from "@/modules/chat/actions/message-actions";

await sendMessage({
  organizationId: "org-123",
  channelId: "channel-123",
  userId: "user-123",
  content: "<p>Hello <span data-mention-id=\"user-456\">@John</span>!</p>",
  mentionedUserIds: ["user-456"],
});
```

### Subscribe to Real-Time Updates

```typescript
import { getPusherClient, PUSHER_EVENTS } from "@/lib/pusher";

const pusher = getPusherClient();
const channel = pusher.subscribe(`channel-${channelId}`);

channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data) => {
  console.log("New message:", data.message);
});
```

### Find or Create DM

```typescript
import { findOrCreateDM } from "@/modules/chat/actions/channel-actions";

const dm = await findOrCreateDM(organizationId, [userId1, userId2]);
// Returns existing DM or creates new one
```

## Access Control

- All authenticated users can access chat
- Public channels are visible to everyone
- Private channels require membership
- DMs are restricted to participants
- Channel owners/admins can manage members

## Threads (Phase 18.3)

```tsx
import { ThreadView } from "@/modules/chat/components/ThreadView";

<ThreadView
  open={showThread}
  onClose={() => setShowThread(false)}
  parentMessage={selectedMessage}
  channelId={channelId}
  organizationId={orgId}
  currentUserId={userId}
  users={users}
/>
```

## Presence (Phase 18.3)

### Automatic Tracking

```tsx
import { usePresence } from "@/modules/chat/hooks/usePresence";

// In your layout or chat page
usePresence({
  userId: currentUserId,
  idleTimeoutMs: 5 * 60 * 1000, // 5 min to away
  heartbeatIntervalMs: 60 * 1000, // 1 min heartbeat
});
```

### Presence Indicator

```tsx
import {
  PresenceIndicator,
  AvatarWithPresence,
  PresenceBadge,
} from "@/modules/chat/components/PresenceIndicator";

// Simple dot
<PresenceIndicator userId="user-123" initialStatus="ONLINE" />

// Avatar with presence dot
<AvatarWithPresence
  userId="user-123"
  name="John Doe"
  avatarUrl="/avatar.jpg"
  initialStatus="ONLINE"
/>

// Badge for lists
<PresenceBadge status="AWAY" />
```

### Typing Indicator

```tsx
import {
  TypingIndicator,
  useTyping,
} from "@/modules/chat/components/TypingIndicator";

// Show who's typing
<TypingIndicator
  channelId={channelId}
  currentUserId={userId}
/>

// In message composer
const { handleTyping, stopTyping } = useTyping({
  channelId,
  userId,
  userName: "John",
});

// Call handleTyping() on input change
// Call stopTyping() after sending
```

## Message Search (Phase 18.6)

Full-text search across all messages with advanced filters.

### Features
- Search across all channels or filter by specific channel
- Filter by sender, date range, attachments
- Keyboard shortcut: `⌘K` / `Ctrl+K`
- Highlighted snippets in results
- Quick navigation to message context

### Usage

```typescript
import { MessageSearch } from "@/modules/chat/components";

<MessageSearch
  organizationId={organizationId}
  channels={channels}
  users={users}
  onSelectMessage={(result) => {
    // Navigate to message
    router.push(`/chat/${result.channel.slug}?message=${result.id}`);
  }}
/>
```

### Server Actions

```typescript
import { searchMessages, quickSearchMessages } from "@/modules/chat/actions/message-actions";

// Full search with filters
const { results, total, hasMore } = await searchMessages({
  organizationId,
  query: "project deadline",
  channelId: "optional-channel-id",
  userId: "optional-sender-id",
  fromDate: new Date("2025-01-01"),
  toDate: new Date("2025-12-31"),
  hasAttachments: true,
  limit: 20,
  offset: 0,
});

// Quick search for autocomplete
const results = await quickSearchMessages(organizationId, "deadline", 5);
```

## Module Integrations (Phase 18.5)

SpokeChat integrates with other modules to provide automated notifications.

### Brief Integrations

```typescript
import { onBriefCreated, onBriefCompleted } from "@/modules/chat/services/module-integrations";

// In your brief action
await onBriefCreated({
  id: brief.id,
  organizationId,
  title: brief.title,
  type: brief.type,
  clientId: brief.clientId,
  createdById: session.user.id,
  assigneeId: brief.assigneeId,
});
```

### Content Engine Integrations

```typescript
import {
  onContentSubmitted,
  onContentApproved,
  onContentRevisionRequested,
  onContentPublished,
} from "@/modules/chat/services/module-integrations";

// When content is submitted for review
await onContentSubmitted({
  id: post.id,
  organizationId,
  title: post.title,
  platform: post.platforms[0],
  clientId: post.clientId,
  submittedById: userId,
});

// When content is approved
await onContentApproved({
  id: post.id,
  organizationId,
  title: post.title,
  platform: post.platforms[0],
  approvedById: userId,
  scheduledFor: post.scheduledFor,
});

// When content is published (celebration!)
await onContentPublished({
  id: post.id,
  organizationId,
  title: post.title,
  platform: post.platforms[0],
  clientId: post.clientId,
});
```

### Celebration Functions

```typescript
import {
  celebrateMilestone,
  celebrateAchievement,
  celebrateBirthday,
  celebrateAnniversary,
} from "@/modules/chat/services/module-integrations";

// Celebrate milestones
await celebrateMilestone({
  organizationId,
  title: "100 Posts for CCAD!",
  description: "Amazing work, team!",
  userIds: [userId1, userId2],
});

// Birthdays
await celebrateBirthday({
  organizationId,
  userName: "Sarah",
  userId: sarahId,
});
```

### Available Notification Types

| Event | Channel | Emoji |
|-------|---------|-------|
| Brief created | Default | 📋 |
| Brief assigned | DM to assignee | 📌 |
| Brief completed | Default | ✅ |
| Content submitted | Client channel | 📤 |
| Content approved | Default | 👍 |
| Content revision | Default | ✏️ |
| Content published | Default | 🎉 |
| Client feedback | Client channel | 💚/💬/🔴 |
| Deadline reminder | DM to assignees | ⏰/⚠️ |
| Holiday content reminder | Content channel | 💡/📝/⚡ |
| Holiday leave reminder | Default | 📆/⏰ |

## UAE Holiday Reminders (Phase 18.5)

Automated reminders for UAE national holidays - for both content planning and leave requests.

### Holiday Configuration

Holidays are configured in `/config/holidays/uae.holidays.ts`:

```typescript
import { getUpcomingHolidays, getNextHoliday } from "@config/holidays";

// Get holidays in the next 30 days
const upcoming = getUpcomingHolidays(new Date(), 30);

// Get the next holiday
const next = getNextHoliday();
console.log(next?.name, next?.date, next?.contentThemes);
```

### Reminder Schedule

**Content Planning Reminders:**
- 30 days before: Start brainstorming 💡
- 14 days before: Finalize concepts 📝
- 7 days before: Content should be ready ⚡

**Leave Planning Reminders:**
- 14 days before: Plan your time off 📆
- 7 days before: Last call for requests ⏰

### Cron Job Setup

Trigger daily at 9 AM UAE time:

```bash
# Vercel Cron (vercel.json)
{
  "crons": [{
    "path": "/api/cron/holiday-reminders",
    "schedule": "0 5 * * *"  # 5 AM UTC = 9 AM UAE
  }]
}

# Or curl with secret
curl -X POST https://your-app.com/api/cron/holiday-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Manual Triggers

```typescript
import {
  processHolidayReminders,
  sendManualContentReminder,
  previewUpcomingReminders,
} from "@/modules/chat/services";

// Preview what reminders would be sent
const preview = previewUpcomingReminders(45);

// Process today's reminders for an org
await processHolidayReminders(organizationId);

// Manually send a content reminder
await sendManualContentReminder(organizationId, "Eid Al Fitr");
```

### UAE Holidays Included

| Holiday | Date (2025) | Duration |
|---------|-------------|----------|
| New Year's Day | Jan 1 | 1 day |
| Emirati Mother's Day | Mar 21 | 1 day |
| Eid Al Fitr | ~Mar 30 | 4 days |
| Arafat Day | ~Jun 5 | 1 day |
| Eid Al Adha | ~Jun 6 | 4 days |
| Islamic New Year | ~Jun 26 | 1 day |
| Prophet's Birthday | ~Sep 4 | 1 day |
| Martyrs Day | Nov 30 | 1 day |
| UAE National Day | Dec 2-3 | 2 days |

*Islamic holiday dates are approximations based on the lunar calendar.*

## File Uploads (Phase 18.6)

Upload and share files in chat messages.

### Components

```typescript
import {
  FileUploadButton,
  FilePreviewStrip,
  MessageAttachments,
} from "@/modules/chat/components";

// In message composer
<FileUploadButton
  onFilesSelected={(files) => setAttachments([...attachments, ...files])}
  maxFiles={10}
  maxSizeBytes={25 * 1024 * 1024}
/>

// Show pending uploads
<FilePreviewStrip
  files={attachments}
  onRemove={(id) => setAttachments(a => a.filter(f => f.id !== id))}
/>

// Display attachments in messages
<MessageAttachments attachments={message.attachments} />
```

### Supported File Types
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM, QuickTime
- Documents: PDF, Word, Excel, PowerPoint
- Text: Plain text, CSV

### Server Actions

```typescript
import {
  uploadChatFile,
  createAttachment,
  deleteAttachment,
} from "@/modules/chat/actions/upload-actions";

// Upload file via FormData
const result = await uploadChatFile(formData);

// Create attachment record
await createAttachment({
  messageId,
  uploadedById: userId,
  fileName: "report.pdf",
  fileType: "application/pdf",
  fileSize: 1024000,
  fileUrl: result.fileUrl,
});
```

## Notification Preferences (Phase 18.6)

User-configurable notification settings.

### Features
- Global enable/disable
- Sound & desktop notification toggles
- Notify on: DMs, @mentions, all messages, threads, reactions
- Quiet hours with timezone support (UAE default)
- Channel-specific overrides (all/mentions/muted)
- Custom keywords (always notify)

### Usage

```typescript
import { NotificationSettings } from "@/modules/chat/components";

<NotificationSettings
  userId={userId}
  initialPreferences={preferences}
  channels={userChannels}
/>
```

### Server Actions

```typescript
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  muteChannel,
  addKeyword,
  shouldNotify,
} from "@/modules/chat/actions/notification-preferences";

// Get user preferences
const prefs = await getNotificationPreferences(userId);

// Update preferences
await updateNotificationPreferences(userId, {
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
});

// Mute a channel
await muteChannel(userId, channelId);

// Add alert keyword
await addKeyword(userId, "urgent");

// Check if should notify
const { notify, reason } = await shouldNotify({
  userId,
  type: "mention",
  channelId,
  messageContent: "Hey, this is urgent!",
});
```

## Push Notifications (Phase 18.7)

Web Push notifications for desktop and mobile (PWA).

### Setup
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@teamlmtd.com
```

### Usage
```typescript
import { savePushSubscription, notifyNewDM, notifyMention } from "@/modules/chat/actions/push-notifications";

await savePushSubscription(userId, subscription, { platform: "web" });
await notifyNewDM(recipientId, "Sarah", "Hey!", channelId, messageId);
```

## Slash Commands (Phase 18.7)

| Command | Description |
|---------|-------------|
| `/help` | Show commands |
| `/me [action]` | Action message |
| `/status [emoji] [msg]` | Set status |
| `/away` / `/back` | Toggle away |
| `/poll "Q" "A" "B"` | Create poll |
| `/remind [time] [msg]` | Set reminder |
| `/shrug` `/tableflip` | Fun emotes |

```typescript
import { executeSlashCommand, isSlashCommand } from "@/modules/chat/actions/slash-commands";

if (isSlashCommand(message)) {
  const result = await executeSlashCommand(message, context);
}
```

## Read Receipts (Phase 18.7)

```typescript
import { markMessageAsRead, getMessageReadReceipts } from "@/modules/chat/actions/read-receipts";

await markMessageAsRead(messageId, userId);
await markChannelAsRead(channelId, userId);
const receipts = await getMessageReadReceipts(messageId);
```

## SpokeChat Complete! ✅

All features: Channels, DMs, Rich text, Reactions, Threads, Presence, Typing,
AI actions, Module integrations, Holiday reminders, Search, File uploads,
Notification prefs, Push notifications, Slash commands, Read receipts
