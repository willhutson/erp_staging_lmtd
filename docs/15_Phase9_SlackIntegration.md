# Phase 9: Slack Integration - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Phases 5, 6

---

## Overview

Deep Slack integration brings SpokeStack into the team's daily workflow. Submit briefs, receive notifications, and take actions without leaving Slack.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SLACK INTEGRATION ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SLACK WORKSPACE                        SPOKESTACK                           │
│                                                                              │
│  ┌─────────────────┐                   ┌─────────────────┐                  │
│  │ Slash Commands  │──────────────────▶│ Command Handler │                  │
│  │ /brief          │                   │                 │                  │
│  │ /status         │                   │ • Parse command │                  │
│  │ /time           │                   │ • Validate user │                  │
│  └─────────────────┘                   │ • Execute action│                  │
│                                        └─────────────────┘                  │
│  ┌─────────────────┐                   ┌─────────────────┐                  │
│  │ Events API      │◀─────────────────│ Event Publisher │                  │
│  │                 │                   │                 │                  │
│  │ • Messages      │                   │ • Brief updates │                  │
│  │ • Reactions     │                   │ • Notifications │                  │
│  │ • Mentions      │                   │ • Reminders     │                  │
│  └─────────────────┘                   └─────────────────┘                  │
│                                                                              │
│  ┌─────────────────┐                   ┌─────────────────┐                  │
│  │ Interactive     │──────────────────▶│ Action Handler  │                  │
│  │ Components      │                   │                 │                  │
│  │                 │                   │ • Modal submit  │                  │
│  │ • Buttons       │                   │ • Button click  │                  │
│  │ • Modals        │                   │ • Menu select   │                  │
│  │ • Menus         │                   │                 │                  │
│  └─────────────────┘                   └─────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
// Slack workspace connection
model SlackWorkspace {
  id              String   @id @default(cuid())
  organizationId  String   @unique

  // OAuth data
  teamId          String   @unique
  teamName        String
  accessToken     String   // Encrypted
  botUserId       String
  botAccessToken  String   // Encrypted
  scope           String[]

  // Configuration
  isActive        Boolean  @default(true)
  defaultChannel  String?

  // Channel mappings
  channelMappings Json     @default("{}")
  // Structure:
  // {
  //   "briefs": { "channelId": "C123", "channelName": "#briefs" },
  //   "rfp": { "channelId": "C456", "channelName": "#rfp-private" },
  //   "announcements": { "channelId": "C789", "channelName": "#general" },
  // }

  // Enabled features
  enabledCommands String[] @default([])  // ["brief", "status", "time"]
  enabledEvents   String[] @default([])  // ["brief.assigned", "brief.completed"]

  installedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@map("slack_workspaces")
}

// User mapping between SpokeStack and Slack
model SlackUserMapping {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String   @unique  // SpokeStack user ID
  slackUserId     String   // Slack user ID
  slackUsername   String?  // @username
  slackEmail      String?  // For matching

  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])

  @@unique([organizationId, slackUserId])
  @@map("slack_user_mappings")
}

// Audit log for Slack interactions
model SlackInteractionLog {
  id              String   @id @default(cuid())
  organizationId  String
  slackUserId     String
  userId          String?  // Mapped SpokeStack user

  type            String   // "command", "button", "modal_submit", "menu_select"
  action          String   // "/brief", "approve_submission", etc.
  payload         Json?    // Full interaction payload
  response        Json?    // What we sent back

  createdAt       DateTime @default(now())

  @@index([organizationId, createdAt])
  @@map("slack_interaction_logs")
}
```

---

## Slack App Configuration

### Manifest

```yaml
# slack-app-manifest.yaml
display_information:
  name: SpokeStack
  description: Brief management and workflow automation
  background_color: "#52EDC7"
  long_description: |
    SpokeStack brings your agency workflow into Slack. Submit briefs,
    track progress, log time, and stay updated - all without leaving Slack.

features:
  bot_user:
    display_name: SpokeStack
    always_online: true

  slash_commands:
    - command: /brief
      url: https://app.spokestack.io/api/slack/commands
      description: Create or search briefs
      usage_hint: "[type] or [search query]"
      should_escape: false

    - command: /status
      url: https://app.spokestack.io/api/slack/commands
      description: View your assigned briefs
      should_escape: false

    - command: /time
      url: https://app.spokestack.io/api/slack/commands
      description: Log time to a brief
      usage_hint: "[hours] [brief number or search]"
      should_escape: false

oauth_config:
  scopes:
    bot:
      - commands
      - chat:write
      - chat:write.public
      - users:read
      - users:read.email
      - im:write
      - im:history
      - channels:read
      - groups:read

settings:
  interactivity:
    is_enabled: true
    request_url: https://app.spokestack.io/api/slack/interactions

  event_subscriptions:
    request_url: https://app.spokestack.io/api/slack/events
    bot_events:
      - app_mention
      - message.im
```

---

## Slash Commands

### Command Router

```typescript
// src/app/api/slack/commands/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify';
import { handleBriefCommand } from './handlers/brief';
import { handleStatusCommand } from './handlers/status';
import { handleTimeCommand } from './handlers/time';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = request.headers.get('x-slack-request-timestamp')!;
  const signature = request.headers.get('x-slack-signature')!;

  // Verify request is from Slack
  if (!verifySlackRequest(body, timestamp, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const command = params.get('command')!;
  const text = params.get('text') || '';
  const userId = params.get('user_id')!;
  const teamId = params.get('team_id')!;
  const triggerId = params.get('trigger_id')!;
  const responseUrl = params.get('response_url')!;

  // Find workspace and user
  const workspace = await db.slackWorkspace.findUnique({
    where: { teamId },
    include: { organization: true },
  });

  if (!workspace || !workspace.isActive) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'SpokeStack is not configured for this workspace.',
    });
  }

  const userMapping = await db.slackUserMapping.findFirst({
    where: { organizationId: workspace.organizationId, slackUserId: userId },
    include: { user: true },
  });

  if (!userMapping) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Your Slack account is not linked to SpokeStack. Please visit the settings page to connect.',
    });
  }

  // Log interaction
  await db.slackInteractionLog.create({
    data: {
      organizationId: workspace.organizationId,
      slackUserId: userId,
      userId: userMapping.userId,
      type: 'command',
      action: command,
      payload: { text, triggerId },
    },
  });

  // Route to handler
  const context = {
    workspace,
    user: userMapping.user,
    text,
    triggerId,
    responseUrl,
  };

  switch (command) {
    case '/brief':
      return handleBriefCommand(context);
    case '/status':
      return handleStatusCommand(context);
    case '/time':
      return handleTimeCommand(context);
    default:
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `Unknown command: ${command}`,
      });
  }
}
```

### /brief Command

```typescript
// src/app/api/slack/commands/handlers/brief.ts

import { NextResponse } from 'next/server';
import { slackClient } from '@/lib/slack/client';
import { db } from '@/lib/db';

interface CommandContext {
  workspace: SlackWorkspace;
  user: User;
  text: string;
  triggerId: string;
  responseUrl: string;
}

export async function handleBriefCommand(context: CommandContext) {
  const { workspace, user, text, triggerId } = context;

  // No text = show brief type selection
  if (!text.trim()) {
    return showBriefTypeSelector(triggerId, workspace);
  }

  // Check if it's a brief type
  const briefTypes = ['shoot', 'edit', 'design', 'copy', 'paid'];
  const type = text.toLowerCase().split(' ')[0];

  if (briefTypes.includes(type)) {
    return openBriefModal(triggerId, type, workspace);
  }

  // Otherwise, treat as search
  return searchBriefs(text, user, workspace);
}

async function showBriefTypeSelector(triggerId: string, workspace: SlackWorkspace) {
  await slackClient.views.open({
    token: workspace.botAccessToken,
    trigger_id: triggerId,
    view: {
      type: 'modal',
      callback_id: 'brief_type_select',
      title: { type: 'plain_text', text: 'New Brief' },
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: 'What type of brief do you want to create?' },
        },
        {
          type: 'actions',
          elements: [
            { type: 'button', text: { type: 'plain_text', text: '🎬 Video Shoot' }, value: 'VIDEO_SHOOT', action_id: 'select_shoot' },
            { type: 'button', text: { type: 'plain_text', text: '✂️ Video Edit' }, value: 'VIDEO_EDIT', action_id: 'select_edit' },
            { type: 'button', text: { type: 'plain_text', text: '🎨 Design' }, value: 'DESIGN', action_id: 'select_design' },
            { type: 'button', text: { type: 'plain_text', text: '✍️ Copy' }, value: 'COPYWRITING_EN', action_id: 'select_copy' },
            { type: 'button', text: { type: 'plain_text', text: '📈 Paid Media' }, value: 'PAID_MEDIA', action_id: 'select_paid' },
          ],
        },
      ],
    },
  });

  return NextResponse.json({ response_type: 'ephemeral', text: '' });
}

async function openBriefModal(triggerId: string, type: string, workspace: SlackWorkspace) {
  // Get form template
  const template = await db.formTemplate.findFirst({
    where: {
      organizationId: workspace.organizationId,
      type: type.toUpperCase(),
      isActive: true,
    },
  });

  if (!template) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `No form template found for type: ${type}`,
    });
  }

  // Get clients and users for dropdowns
  const [clients, users] = await Promise.all([
    db.client.findMany({
      where: { organizationId: workspace.organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { organizationId: workspace.organizationId, isActive: true },
      select: { id: true, name: true, department: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Build modal from template config
  const config = template.config as FormTemplateConfig;
  const blocks = buildModalBlocks(config, clients, users);

  await slackClient.views.open({
    token: workspace.botAccessToken,
    trigger_id: triggerId,
    view: {
      type: 'modal',
      callback_id: `brief_submit_${template.id}`,
      title: { type: 'plain_text', text: template.name.slice(0, 24) },
      submit: { type: 'plain_text', text: 'Submit Brief' },
      blocks,
      private_metadata: JSON.stringify({ templateId: template.id }),
    },
  });

  return NextResponse.json({ response_type: 'ephemeral', text: '' });
}

function buildModalBlocks(
  config: FormTemplateConfig,
  clients: { id: string; name: string }[],
  users: { id: string; name: string; department: string }[]
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  for (const section of config.sections) {
    // Section header
    blocks.push({
      type: 'header',
      text: { type: 'plain_text', text: section.title },
    });

    for (const field of section.fields) {
      const block = fieldToSlackBlock(field, clients, users);
      if (block) blocks.push(block);
    }
  }

  return blocks;
}

function fieldToSlackBlock(
  field: FormField,
  clients: { id: string; name: string }[],
  users: { id: string; name: string; department: string }[]
): SlackBlock | null {
  switch (field.type) {
    case 'text':
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'plain_text_input',
          action_id: field.id,
          placeholder: field.placeholder ? { type: 'plain_text', text: field.placeholder } : undefined,
        },
      };

    case 'textarea':
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'plain_text_input',
          action_id: field.id,
          multiline: true,
          placeholder: field.placeholder ? { type: 'plain_text', text: field.placeholder } : undefined,
        },
      };

    case 'select':
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'static_select',
          action_id: field.id,
          options: field.options?.map((opt) => ({
            text: { type: 'plain_text', text: opt.label },
            value: opt.value,
          })),
        },
      };

    case 'client-select':
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'static_select',
          action_id: field.id,
          options: clients.map((c) => ({
            text: { type: 'plain_text', text: c.name },
            value: c.id,
          })),
        },
      };

    case 'user-select':
      const filteredUsers = field.filter?.departments
        ? users.filter((u) => field.filter!.departments!.includes(u.department))
        : users;
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'static_select',
          action_id: field.id,
          options: filteredUsers.map((u) => ({
            text: { type: 'plain_text', text: u.name },
            value: u.id,
          })),
        },
      };

    case 'date':
      return {
        type: 'input',
        block_id: field.id,
        optional: !field.required,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'datepicker',
          action_id: field.id,
        },
      };

    default:
      // Skip unsupported field types
      return null;
  }
}

async function searchBriefs(query: string, user: User, workspace: SlackWorkspace) {
  const briefs = await db.brief.findMany({
    where: {
      organizationId: workspace.organizationId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { briefNumber: { contains: query, mode: 'insensitive' } },
        { client: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      client: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  if (briefs.length === 0) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `No briefs found matching "${query}"`,
    });
  }

  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Found ${briefs.length} brief(s):*` },
    },
    ...briefs.map((brief) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${process.env.APP_URL}/briefs/${brief.id}|${brief.briefNumber}>*\n${brief.title}\n_${brief.client.name} • ${brief.status} • ${brief.assignee?.name || 'Unassigned'}_`,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: 'View' },
        url: `${process.env.APP_URL}/briefs/${brief.id}`,
      },
    })),
  ];

  return NextResponse.json({
    response_type: 'ephemeral',
    blocks,
  });
}
```

### /status Command

```typescript
// src/app/api/slack/commands/handlers/status.ts

export async function handleStatusCommand(context: CommandContext) {
  const { workspace, user } = context;

  // Get user's assigned briefs
  const briefs = await db.brief.findMany({
    where: {
      organizationId: workspace.organizationId,
      assigneeId: user.id,
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
    },
    include: {
      client: { select: { name: true } },
    },
    orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    take: 10,
  });

  if (briefs.length === 0) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: "You don't have any active briefs assigned. 🎉",
    });
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `Your Active Briefs (${briefs.length})` },
    },
  ];

  for (const brief of briefs) {
    const isOverdue = brief.deadline && new Date(brief.deadline) < new Date();
    const deadlineText = brief.deadline
      ? `Due: ${formatDate(brief.deadline)}${isOverdue ? ' ⚠️ OVERDUE' : ''}`
      : 'No deadline';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${process.env.APP_URL}/briefs/${brief.id}|${brief.briefNumber}>* - ${brief.title}\n_${brief.client.name} • ${brief.status} • ${deadlineText}_`,
      },
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `<${process.env.APP_URL}/briefs?assignee=${user.id}|View all in SpokeStack>` },
    ],
  });

  return NextResponse.json({
    response_type: 'ephemeral',
    blocks,
  });
}
```

---

## Event Publishing

```typescript
// src/lib/slack/publisher.ts

import { slackClient } from './client';
import { db } from '@/lib/db';

interface PublishOptions {
  organizationId: string;
  event: string;
  data: Record<string, unknown>;
}

class SlackPublisher {
  async publish(options: PublishOptions): Promise<void> {
    const { organizationId, event, data } = options;

    // Get workspace config
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId },
    });

    if (!workspace || !workspace.isActive) return;

    // Check if event is enabled
    if (!workspace.enabledEvents.includes(event)) return;

    // Get channel for this event type
    const channelConfig = this.getChannelForEvent(event, workspace.channelMappings);
    if (!channelConfig) return;

    // Build message
    const message = this.buildMessage(event, data);

    // Post to channel
    await slackClient.chat.postMessage({
      token: workspace.botAccessToken,
      channel: channelConfig.channelId,
      ...message,
    });
  }

  async sendDM(options: {
    organizationId: string;
    userId: string;
    message: SlackMessage;
  }): Promise<void> {
    const { organizationId, userId, message } = options;

    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId },
    });

    if (!workspace || !workspace.isActive) return;

    // Get Slack user ID
    const userMapping = await db.slackUserMapping.findFirst({
      where: { organizationId, userId },
    });

    if (!userMapping) return;

    // Open DM channel
    const dmResult = await slackClient.conversations.open({
      token: workspace.botAccessToken,
      users: userMapping.slackUserId,
    });

    if (!dmResult.ok || !dmResult.channel) return;

    // Send message
    await slackClient.chat.postMessage({
      token: workspace.botAccessToken,
      channel: dmResult.channel.id,
      ...message,
    });
  }

  private getChannelForEvent(
    event: string,
    mappings: Record<string, { channelId: string }>
  ): { channelId: string } | null {
    const eventPrefix = event.split('.')[0];  // "brief" from "brief.assigned"

    return mappings[eventPrefix] || mappings['default'] || null;
  }

  private buildMessage(event: string, data: Record<string, unknown>): SlackMessage {
    switch (event) {
      case 'brief.created':
        return this.buildBriefCreatedMessage(data);
      case 'brief.assigned':
        return this.buildBriefAssignedMessage(data);
      case 'brief.completed':
        return this.buildBriefCompletedMessage(data);
      case 'brief.overdue':
        return this.buildBriefOverdueMessage(data);
      case 'submission.pending':
        return this.buildSubmissionPendingMessage(data);
      default:
        return { text: `Event: ${event}` };
    }
  }

  private buildBriefCreatedMessage(data: Record<string, unknown>): SlackMessage {
    return {
      text: `New brief created: ${data.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📋 *New Brief Created*\n\n*<${process.env.APP_URL}/briefs/${data.id}|${data.briefNumber}>*\n${data.title}`,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Client: ${data.clientName} • Created by: ${data.createdByName}` },
          ],
        },
      ],
    };
  }

  private buildBriefAssignedMessage(data: Record<string, unknown>): SlackMessage {
    return {
      text: `Brief assigned: ${data.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📌 *Brief Assigned to You*\n\n*<${process.env.APP_URL}/briefs/${data.id}|${data.briefNumber}>*\n${data.title}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Client:*\n${data.clientName}` },
            { type: 'mrkdwn', text: `*Deadline:*\n${data.deadline || 'Not set'}` },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Brief' },
              url: `${process.env.APP_URL}/briefs/${data.id}`,
              style: 'primary',
            },
          ],
        },
      ],
    };
  }

  private buildBriefCompletedMessage(data: Record<string, unknown>): SlackMessage {
    return {
      text: `Brief completed: ${data.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Brief Completed*\n\n*<${process.env.APP_URL}/briefs/${data.id}|${data.briefNumber}>*\n${data.title}`,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Client: ${data.clientName} • Completed by: ${data.completedByName}` },
          ],
        },
      ],
    };
  }

  private buildBriefOverdueMessage(data: Record<string, unknown>): SlackMessage {
    return {
      text: `Brief overdue: ${data.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⚠️ *Brief Overdue*\n\n*<${process.env.APP_URL}/briefs/${data.id}|${data.briefNumber}>*\n${data.title}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Deadline:*\n${data.deadline}` },
            { type: 'mrkdwn', text: `*Assignee:*\n${data.assigneeName || 'Unassigned'}` },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Brief' },
              url: `${process.env.APP_URL}/briefs/${data.id}`,
              style: 'danger',
            },
          ],
        },
      ],
    };
  }

  private buildSubmissionPendingMessage(data: Record<string, unknown>): SlackMessage {
    return {
      text: `New submission pending review`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📥 *Submission Pending Review*\n\n*${data.title}*\nType: ${data.templateName}`,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Submitted by: ${data.submittedByName}` },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Review' },
              url: `${process.env.APP_URL}/submissions/${data.id}`,
              style: 'primary',
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Approve' },
              action_id: `approve_submission_${data.id}`,
              style: 'primary',
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Reject' },
              action_id: `reject_submission_${data.id}`,
            },
          ],
        },
      ],
    };
  }
}

export const slackPublisher = new SlackPublisher();
```

---

## Interactive Components Handler

```typescript
// src/app/api/slack/interactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify';
import { slackClient } from '@/lib/slack/client';
import { db } from '@/lib/db';
import { createFormSubmission } from '@/modules/forms/actions/form-submission-actions';
import { approveSubmission, rejectSubmission } from '@/modules/forms/actions/form-submission-actions';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = request.headers.get('x-slack-request-timestamp')!;
  const signature = request.headers.get('x-slack-signature')!;

  if (!verifySlackRequest(body, timestamp, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const payload = JSON.parse(params.get('payload')!);

  switch (payload.type) {
    case 'view_submission':
      return handleModalSubmit(payload);
    case 'block_actions':
      return handleBlockAction(payload);
    default:
      return NextResponse.json({ ok: true });
  }
}

async function handleModalSubmit(payload: SlackViewSubmission) {
  const { view, user } = payload;
  const callbackId = view.callback_id;

  // Brief submission
  if (callbackId.startsWith('brief_submit_')) {
    const templateId = JSON.parse(view.private_metadata).templateId;
    const values = view.state.values;

    // Extract form data from Slack modal
    const formData: Record<string, unknown> = {};
    for (const [blockId, block] of Object.entries(values)) {
      const element = Object.values(block)[0];
      formData[blockId] = extractValue(element);
    }

    // Get user mapping
    const userMapping = await db.slackUserMapping.findFirst({
      where: { slackUserId: user.id },
      include: { user: true },
    });

    if (!userMapping) {
      return NextResponse.json({
        response_action: 'errors',
        errors: { _: 'User not linked to SpokeStack' },
      });
    }

    try {
      // Create submission (will be reviewed)
      const submission = await createFormSubmission({
        templateId,
        formData,
      });

      return NextResponse.json({
        response_action: 'update',
        view: {
          type: 'modal',
          title: { type: 'plain_text', text: 'Success!' },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ Brief submitted successfully!\n\n<${process.env.APP_URL}/submissions/${submission.id}|View submission>`,
              },
            },
          ],
        },
      });
    } catch (error) {
      return NextResponse.json({
        response_action: 'errors',
        errors: { _: error instanceof Error ? error.message : 'Submission failed' },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleBlockAction(payload: SlackBlockAction) {
  const { actions, user, response_url } = payload;
  const action = actions[0];

  // Approve submission
  if (action.action_id.startsWith('approve_submission_')) {
    const submissionId = action.action_id.replace('approve_submission_', '');

    const userMapping = await db.slackUserMapping.findFirst({
      where: { slackUserId: user.id },
      include: { user: true },
    });

    if (!userMapping) {
      await respondToSlack(response_url, {
        text: 'Your Slack account is not linked to SpokeStack.',
        replace_original: false,
      });
      return NextResponse.json({ ok: true });
    }

    try {
      const result = await approveSubmission(submissionId);

      await respondToSlack(response_url, {
        text: `✅ Submission approved by ${userMapping.user.name}`,
        replace_original: true,
      });

      if (result.brief) {
        await respondToSlack(response_url, {
          text: `Brief created: <${process.env.APP_URL}/briefs/${result.brief.id}|${result.brief.briefNumber}>`,
          replace_original: false,
        });
      }
    } catch (error) {
      await respondToSlack(response_url, {
        text: `Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`,
        replace_original: false,
      });
    }

    return NextResponse.json({ ok: true });
  }

  // Reject submission - open modal for reason
  if (action.action_id.startsWith('reject_submission_')) {
    const submissionId = action.action_id.replace('reject_submission_', '');

    await slackClient.views.open({
      token: process.env.SLACK_BOT_TOKEN!,
      trigger_id: payload.trigger_id,
      view: {
        type: 'modal',
        callback_id: `reject_confirm_${submissionId}`,
        title: { type: 'plain_text', text: 'Reject Submission' },
        submit: { type: 'plain_text', text: 'Reject' },
        blocks: [
          {
            type: 'input',
            block_id: 'reason',
            label: { type: 'plain_text', text: 'Reason for rejection' },
            element: {
              type: 'plain_text_input',
              action_id: 'reason',
              multiline: true,
              placeholder: { type: 'plain_text', text: 'Please provide a reason...' },
            },
          },
        ],
        private_metadata: JSON.stringify({ submissionId, responseUrl: response_url }),
      },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

function extractValue(element: SlackElement): unknown {
  switch (element.type) {
    case 'plain_text_input':
      return element.value;
    case 'static_select':
    case 'external_select':
      return element.selected_option?.value;
    case 'datepicker':
      return element.selected_date;
    case 'checkboxes':
      return element.selected_options?.map((o) => o.value);
    default:
      return null;
  }
}

async function respondToSlack(url: string, message: SlackMessage): Promise<void> {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}
```

---

## Implementation Checklist

### Phase 9.1: OAuth & Setup
- [ ] Create Slack App in Slack API dashboard
- [ ] Implement OAuth installation flow
- [ ] Create database schema (SlackWorkspace, SlackUserMapping)
- [ ] Build settings UI for Slack configuration

### Phase 9.2: Slash Commands
- [ ] Implement /brief command (type selection, modal, search)
- [ ] Implement /status command (user's briefs)
- [ ] Implement /time command (quick time logging)
- [ ] Test commands in workspace

### Phase 9.3: Event Publishing
- [ ] Implement SlackPublisher service
- [ ] Integrate with notification system
- [ ] Configure channel mappings
- [ ] Test event delivery

### Phase 9.4: Interactive Components
- [ ] Handle modal submissions
- [ ] Handle button clicks (approve/reject)
- [ ] Handle menu selections
- [ ] Error handling and feedback

---

## TeamLMTD Configuration

```typescript
const lmtdSlackConfig = {
  // Channel mappings
  channels: {
    briefs: { id: 'C_BRIEFS', name: '#briefs' },
    rfp: { id: 'C_RFP', name: '#rfp-private' },
    general: { id: 'C_GENERAL', name: '#general' },
  },

  // Enabled commands
  commands: ['brief', 'status', 'time'],

  // Enabled events
  events: [
    'brief.assigned',
    'brief.completed',
    'brief.overdue',
    'submission.pending',
    'rfp.deadline',
  ],

  // Brief type shortcuts
  briefShortcuts: {
    shoot: 'VIDEO_SHOOT',
    edit: 'VIDEO_EDIT',
    design: 'DESIGN',
    copy: 'COPYWRITING_EN',
    arabic: 'COPYWRITING_AR',
    paid: 'PAID_MEDIA',
  },
};
```

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
