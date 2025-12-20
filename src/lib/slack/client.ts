/**
 * Slack API Client
 * Handles OAuth and API calls to Slack
 */

const SLACK_API_BASE = "https://slack.com/api";

export interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
  };
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_member: boolean;
}

export interface SlackMessage {
  ok: boolean;
  error?: string;
  channel?: string;
  ts?: string;
  message?: {
    text: string;
    ts: string;
  };
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    url?: string;
    action_id?: string;
  }>;
  accessory?: {
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    url?: string;
  };
  fields?: Array<{ type: string; text: string }>;
}

class SlackClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SLACK_CLIENT_ID || "";
    this.clientSecret = process.env.SLACK_CLIENT_SECRET || "";
    this.redirectUri = process.env.SLACK_REDIRECT_URI || "";
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const scopes = [
      "chat:write",
      "channels:read",
      "channels:join",
      "users:read",
      "users:read.email",
    ].join(",");

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state,
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<SlackOAuthResponse> {
    const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    return response.json();
  }

  /**
   * Send a message to a channel
   */
  async sendMessage(
    token: string,
    channel: string,
    text: string,
    blocks?: SlackBlock[],
    threadTs?: string
  ): Promise<SlackMessage> {
    const body: Record<string, unknown> = {
      channel,
      text,
      unfurl_links: false,
      unfurl_media: false,
    };

    if (blocks) {
      body.blocks = blocks;
    }

    if (threadTs) {
      body.thread_ts = threadTs;
    }

    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  /**
   * Update an existing message
   */
  async updateMessage(
    token: string,
    channel: string,
    ts: string,
    text: string,
    blocks?: SlackBlock[]
  ): Promise<SlackMessage> {
    const body: Record<string, unknown> = {
      channel,
      ts,
      text,
    };

    if (blocks) {
      body.blocks = blocks;
    }

    const response = await fetch(`${SLACK_API_BASE}/chat.update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  /**
   * List channels the bot can access
   */
  async listChannels(token: string): Promise<SlackChannel[]> {
    const response = await fetch(
      `${SLACK_API_BASE}/conversations.list?types=public_channel,private_channel&limit=200`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("Failed to list channels:", data.error);
      return [];
    }

    return data.channels || [];
  }

  /**
   * Join a channel
   */
  async joinChannel(token: string, channel: string): Promise<boolean> {
    const response = await fetch(`${SLACK_API_BASE}/conversations.join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel }),
    });

    const data = await response.json();
    return data.ok;
  }

  /**
   * Test authentication
   */
  async testAuth(token: string): Promise<{ ok: boolean; team?: string; user?: string }> {
    const response = await fetch(`${SLACK_API_BASE}/auth.test`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  }
}

export const slackClient = new SlackClient();
