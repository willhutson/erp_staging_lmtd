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
│   ├── message-actions.ts      # Messages, reactions, pins
│   └── presence-actions.ts     # User presence management
├── components/
│   ├── ChannelSidebar.tsx      # Channel list sidebar
│   ├── MessageEditor.tsx       # Tiptap-based message composer
│   ├── MessageList.tsx         # Message display with reactions
│   ├── ThreadView.tsx          # Thread conversation panel
│   ├── PresenceIndicator.tsx   # Online/away/offline dots
│   └── TypingIndicator.tsx     # "X is typing..." component
├── hooks/
│   └── usePresence.ts          # Automatic presence tracking
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

## Future Enhancements

1. **Search** - Full-text message search
2. **File Uploads** - Direct file sharing
3. **Notification Preferences** - User-configurable notification settings
4. **Mobile Push** - Push notifications
5. **Slash Commands** - `/giphy`, `/poll`, etc.
6. **Read Receipts** - See who's read messages
