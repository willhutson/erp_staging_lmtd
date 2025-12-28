/**
 * Phyllo Integration Service
 *
 * Phyllo provides a unified API to access creator data across platforms:
 * - Instagram, TikTok, YouTube, Twitter/X, Twitch, etc.
 * - Profile data, content, engagement metrics, audience demographics
 *
 * Documentation: https://docs.getphyllo.com
 */

export interface PhylloConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export interface PhylloUser {
  id: string;
  external_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PhylloAccount {
  id: string;
  user_id: string;
  work_platform_id: string;
  platform_username: string;
  profile_url: string;
  profile_pic_url: string;
  status: 'connected' | 'not_connected' | 'session_expired';
  data: {
    identity?: PhylloIdentity;
    engagement?: PhylloEngagement;
    audience?: PhylloAudience;
  };
}

export interface PhylloIdentity {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_url: string;
  profile_pic_url: string;
  bio: string;
  is_verified: boolean;
  platform_account_type: string;
  platform_profile_name: string;
  platform_profile_id: string;
  platform_profile_published_at: string;
  username: string;
  reputation: {
    follower_count: number;
    following_count: number;
    subscriber_count: number;
  };
}

export interface PhylloEngagement {
  account_id: string;
  engagement_rate: number;
  average_likes: number;
  average_comments: number;
  average_views: number;
  average_shares: number;
  total_content_count: number;
  last_content_published_at: string;
}

export interface PhylloAudience {
  account_id: string;
  total_followers: number;
  demographics: {
    age?: PhylloDemographicBreakdown[];
    gender?: PhylloDemographicBreakdown[];
    country?: PhylloDemographicBreakdown[];
    city?: PhylloDemographicBreakdown[];
  };
}

export interface PhylloDemographicBreakdown {
  name: string;
  value: number;
  percentage: number;
}

export interface PhylloContent {
  id: string;
  account_id: string;
  external_id: string;
  type: 'VIDEO' | 'IMAGE' | 'TEXT' | 'STORY' | 'REEL' | 'LIVE';
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  published_at: string;
  engagement: {
    like_count: number;
    comment_count: number;
    share_count: number;
    view_count: number;
    save_count: number;
  };
}

// Supported work platforms
export const PHYLLO_PLATFORMS = {
  INSTAGRAM: '8577ed58-1234-4567-abcd-6c5be2de8e98',
  TIKTOK: '8577ed58-2345-5678-bcde-7d6cf3ef9f09',
  YOUTUBE: '8577ed58-3456-6789-cdef-8e7dg4fg0g10',
  TWITTER: '8577ed58-4567-7890-defg-9f8eh5gh1h21',
  FACEBOOK: '8577ed58-5678-8901-efgh-0g9fi6hi2i32',
  TWITCH: '8577ed58-6789-9012-fghi-1h0gj7ij3j43',
  LINKEDIN: '8577ed58-7890-0123-ghij-2i1hk8jk4k54',
} as const;

export type PhylloPlatformId = typeof PHYLLO_PLATFORMS[keyof typeof PHYLLO_PLATFORMS];

class PhylloService {
  private config: PhylloConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private get baseUrl(): string {
    if (!this.config) throw new Error('Phyllo not configured');
    return this.config.environment === 'production'
      ? 'https://api.getphyllo.com'
      : 'https://api.sandbox.getphyllo.com';
  }

  /**
   * Initialize Phyllo with credentials
   */
  configure(config: PhylloConfig): void {
    this.config = config;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if Phyllo is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get access token (with caching)
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('Phyllo not configured. Call configure() first.');
    }

    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    // Request new token
    const response = await fetch(`${this.baseUrl}/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Phyllo auth failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Token expires in 1 hour, refresh 5 minutes early
    this.tokenExpiry = new Date(Date.now() + (55 * 60 * 1000));

    return this.accessToken as string;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Phyllo API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new user in Phyllo
   */
  async createUser(externalId: string, name: string): Promise<PhylloUser> {
    return this.request<PhylloUser>('POST', '/v1/users', {
      external_id: externalId,
      name,
    });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<PhylloUser> {
    return this.request<PhylloUser>('GET', `/v1/users/${userId}`);
  }

  /**
   * Create SDK token for Connect flow
   * This token is used in the frontend to open the Phyllo Connect modal
   */
  async createSDKToken(userId: string, products: string[] = ['IDENTITY', 'ENGAGEMENT', 'AUDIENCE']): Promise<string> {
    const response = await this.request<{ sdk_token: string }>('POST', '/v1/sdk-tokens', {
      user_id: userId,
      products,
    });
    return response.sdk_token;
  }

  /**
   * Get all connected accounts for a user
   */
  async getAccounts(userId: string): Promise<PhylloAccount[]> {
    const response = await this.request<{ data: PhylloAccount[] }>('GET', `/v1/accounts?user_id=${userId}`);
    return response.data;
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string): Promise<PhylloAccount> {
    return this.request<PhylloAccount>('GET', `/v1/accounts/${accountId}`);
  }

  /**
   * Get identity data for an account
   */
  async getIdentity(accountId: string): Promise<PhylloIdentity> {
    return this.request<PhylloIdentity>('GET', `/v1/social/identity?account_id=${accountId}`);
  }

  /**
   * Get engagement metrics for an account
   */
  async getEngagement(accountId: string): Promise<PhylloEngagement> {
    return this.request<PhylloEngagement>('GET', `/v1/social/engagement?account_id=${accountId}`);
  }

  /**
   * Get audience demographics for an account
   */
  async getAudience(accountId: string): Promise<PhylloAudience> {
    return this.request<PhylloAudience>('GET', `/v1/social/audience?account_id=${accountId}`);
  }

  /**
   * Get content/posts for an account
   */
  async getContent(accountId: string, limit: number = 50, offset: number = 0): Promise<PhylloContent[]> {
    const response = await this.request<{ data: PhylloContent[] }>(
      'GET',
      `/v1/social/contents?account_id=${accountId}&limit=${limit}&offset=${offset}`
    );
    return response.data;
  }

  /**
   * Refresh data for an account
   */
  async refreshAccount(accountId: string): Promise<void> {
    await this.request('POST', `/v1/accounts/${accountId}/refresh`);
  }

  /**
   * Disconnect an account
   */
  async disconnectAccount(accountId: string): Promise<void> {
    await this.request('DELETE', `/v1/accounts/${accountId}`);
  }
}

// Export singleton instance
export const phyllo = new PhylloService();

// Export types for use in other modules
export type { PhylloService };
