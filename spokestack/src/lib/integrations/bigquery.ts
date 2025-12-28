/**
 * BigQuery Integration Service
 *
 * Google BigQuery is a serverless data warehouse for analytics.
 * This service enables:
 * - Running custom SQL queries for analytics
 * - Exporting platform data to BigQuery
 * - Importing external data for unified reporting
 *
 * Documentation: https://cloud.google.com/bigquery/docs
 */

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  credentials: BigQueryCredentials;
}

export interface BigQueryCredentials {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export interface BigQueryJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  error?: string;
  statistics?: {
    totalBytesProcessed: string;
    totalBytesBilled: string;
    cacheHit: boolean;
    queryPlanComplexity: string;
  };
}

export interface BigQueryQueryResult<T = Record<string, unknown>> {
  schema: {
    fields: Array<{
      name: string;
      type: string;
      mode: string;
    }>;
  };
  rows: T[];
  totalRows: number;
  jobId: string;
  cacheHit: boolean;
}

export interface BigQueryTable {
  tableId: string;
  type: 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW' | 'EXTERNAL';
  schema: {
    fields: Array<{
      name: string;
      type: string;
      mode: string;
      description?: string;
    }>;
  };
  numRows: string;
  numBytes: string;
  creationTime: string;
  lastModifiedTime: string;
}

// Standard tables we create/manage in BigQuery
export const SPOKESTACK_TABLES = {
  CAMPAIGNS: 'campaigns',
  CREATORS: 'creators',
  CONTENT: 'content',
  AD_ACCOUNTS: 'ad_accounts',
  AD_CAMPAIGNS: 'ad_campaigns',
  DAILY_METRICS: 'daily_metrics',
  AGGREGATED_STATS: 'aggregated_stats',
} as const;

class BigQueryService {
  private config: BigQueryConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private get baseUrl(): string {
    if (!this.config) throw new Error('BigQuery not configured');
    return `https://bigquery.googleapis.com/bigquery/v2/projects/${this.config.projectId}`;
  }

  /**
   * Initialize BigQuery with credentials
   */
  configure(config: BigQueryConfig): void {
    this.config = config;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if BigQuery is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get access token using service account credentials
   * Uses Google OAuth2 with JWT
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('BigQuery not configured. Call configure() first.');
    }

    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: this.config.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/bigquery',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // Note: In production, use a proper JWT library for signing
    // This is a simplified version that would need crypto implementation
    const jwtToken = await this.createSignedJWT(header, payload, this.config.credentials.private_key);

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`BigQuery auth failed: ${error.error_description || response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Token expires in 1 hour, refresh 5 minutes early
    this.tokenExpiry = new Date(Date.now() + (55 * 60 * 1000));

    return this.accessToken as string;
  }

  /**
   * Create signed JWT (simplified - use proper crypto in production)
   */
  private async createSignedJWT(
    header: object,
    payload: object,
    privateKey: string
  ): Promise<string> {
    // In production, use a proper JWT library like 'jose' or 'jsonwebtoken'
    // This is a placeholder that shows the structure
    const encoder = new TextEncoder();

    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(payload));
    const message = `${headerB64}.${payloadB64}`;

    // Note: Actual signing would use Web Crypto API or Node crypto
    // This is simplified for demonstration
    const signature = 'SIGNATURE_PLACEHOLDER';

    return `${message}.${signature}`;
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
      throw new Error(`BigQuery API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Run a SQL query
   */
  async query<T = Record<string, unknown>>(sql: string, params?: Record<string, unknown>): Promise<BigQueryQueryResult<T>> {
    if (!this.config) throw new Error('BigQuery not configured');

    const response = await this.request<{
      kind: string;
      schema: BigQueryQueryResult['schema'];
      rows: Array<{ f: Array<{ v: unknown }> }>;
      totalRows: string;
      jobReference: { jobId: string };
      cacheHit: boolean;
    }>('POST', '/queries', {
      query: sql,
      useLegacySql: false,
      defaultDataset: {
        projectId: this.config.projectId,
        datasetId: this.config.datasetId,
      },
      queryParameters: params ? Object.entries(params).map(([name, value]) => ({
        name,
        parameterType: { type: typeof value === 'number' ? 'INT64' : 'STRING' },
        parameterValue: { value: String(value) },
      })) : undefined,
    });

    // Transform rows from BigQuery format to objects
    const rows = response.rows?.map(row => {
      const obj: Record<string, unknown> = {};
      response.schema.fields.forEach((field, i) => {
        obj[field.name] = row.f[i]?.v;
      });
      return obj as T;
    }) || [];

    return {
      schema: response.schema,
      rows,
      totalRows: parseInt(response.totalRows || '0', 10),
      jobId: response.jobReference.jobId,
      cacheHit: response.cacheHit,
    };
  }

  /**
   * List all tables in the dataset
   */
  async listTables(): Promise<BigQueryTable[]> {
    if (!this.config) throw new Error('BigQuery not configured');

    const response = await this.request<{
      tables: Array<{
        tableReference: { tableId: string };
        type: string;
        numRows: string;
        numBytes: string;
        creationTime: string;
        lastModifiedTime: string;
      }>;
    }>('GET', `/datasets/${this.config.datasetId}/tables`);

    // Get full schema for each table
    const tables: BigQueryTable[] = [];
    for (const table of response.tables || []) {
      const fullTable = await this.getTable(table.tableReference.tableId);
      tables.push(fullTable);
    }

    return tables;
  }

  /**
   * Get table details
   */
  async getTable(tableId: string): Promise<BigQueryTable> {
    if (!this.config) throw new Error('BigQuery not configured');

    const response = await this.request<{
      tableReference: { tableId: string };
      type: string;
      schema: BigQueryTable['schema'];
      numRows: string;
      numBytes: string;
      creationTime: string;
      lastModifiedTime: string;
    }>('GET', `/datasets/${this.config.datasetId}/tables/${tableId}`);

    return {
      tableId: response.tableReference.tableId,
      type: response.type as BigQueryTable['type'],
      schema: response.schema,
      numRows: response.numRows,
      numBytes: response.numBytes,
      creationTime: response.creationTime,
      lastModifiedTime: response.lastModifiedTime,
    };
  }

  /**
   * Create a new table
   */
  async createTable(tableId: string, schema: BigQueryTable['schema']): Promise<BigQueryTable> {
    if (!this.config) throw new Error('BigQuery not configured');

    const response = await this.request<BigQueryTable>('POST', `/datasets/${this.config.datasetId}/tables`, {
      tableReference: {
        projectId: this.config.projectId,
        datasetId: this.config.datasetId,
        tableId,
      },
      schema,
    });

    return response;
  }

  /**
   * Insert rows into a table
   */
  async insertRows(tableId: string, rows: Record<string, unknown>[]): Promise<void> {
    if (!this.config) throw new Error('BigQuery not configured');

    await this.request('POST', `/datasets/${this.config.datasetId}/tables/${tableId}/insertAll`, {
      rows: rows.map((row, i) => ({
        insertId: `row_${Date.now()}_${i}`,
        json: row,
      })),
    });
  }

  /**
   * Delete a table
   */
  async deleteTable(tableId: string): Promise<void> {
    if (!this.config) throw new Error('BigQuery not configured');
    await this.request('DELETE', `/datasets/${this.config.datasetId}/tables/${tableId}`);
  }

  // ============================================
  // SpokeStack-specific queries
  // ============================================

  /**
   * Get campaign performance summary
   */
  async getCampaignPerformance(
    campaignId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<BigQueryQueryResult> {
    let sql = `
      SELECT
        campaign_id,
        campaign_name,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spend) as total_spend,
        SAFE_DIVIDE(SUM(conversions), SUM(spend)) as roas,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100 as ctr
      FROM \`${this.config?.datasetId}.daily_metrics\`
      WHERE 1=1
    `;

    if (campaignId) sql += ` AND campaign_id = @campaignId`;
    if (startDate) sql += ` AND date >= @startDate`;
    if (endDate) sql += ` AND date <= @endDate`;

    sql += ` GROUP BY campaign_id, campaign_name ORDER BY total_spend DESC`;

    return this.query(sql, { campaignId, startDate, endDate });
  }

  /**
   * Get creator performance summary
   */
  async getCreatorPerformance(
    creatorId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<BigQueryQueryResult> {
    let sql = `
      SELECT
        creator_id,
        creator_name,
        platform,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        AVG(engagement_rate) as avg_engagement_rate,
        COUNT(content_id) as content_count
      FROM \`${this.config?.datasetId}.content\`
      WHERE 1=1
    `;

    if (creatorId) sql += ` AND creator_id = @creatorId`;
    if (startDate) sql += ` AND published_at >= @startDate`;
    if (endDate) sql += ` AND published_at <= @endDate`;

    sql += ` GROUP BY creator_id, creator_name, platform ORDER BY total_views DESC`;

    return this.query(sql, { creatorId, startDate, endDate });
  }

  /**
   * Get platform comparison
   */
  async getPlatformComparison(
    startDate?: string,
    endDate?: string
  ): Promise<BigQueryQueryResult> {
    let sql = `
      SELECT
        platform,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spend) as total_spend,
        SAFE_DIVIDE(SUM(conversions * 100), SUM(spend)) as roas,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100 as ctr,
        SAFE_DIVIDE(SUM(spend), SUM(clicks)) as cpc
      FROM \`${this.config?.datasetId}.daily_metrics\`
      WHERE 1=1
    `;

    if (startDate) sql += ` AND date >= @startDate`;
    if (endDate) sql += ` AND date <= @endDate`;

    sql += ` GROUP BY platform ORDER BY total_spend DESC`;

    return this.query(sql, { startDate, endDate });
  }

  /**
   * Get daily trends
   */
  async getDailyTrends(
    metric: string = 'impressions',
    startDate?: string,
    endDate?: string
  ): Promise<BigQueryQueryResult> {
    const sql = `
      SELECT
        date,
        SUM(${metric}) as value
      FROM \`${this.config?.datasetId}.daily_metrics\`
      WHERE date >= @startDate AND date <= @endDate
      GROUP BY date
      ORDER BY date ASC
    `;

    return this.query(sql, { startDate, endDate });
  }
}

// Export singleton instance
export const bigquery = new BigQueryService();

// Export types for use in other modules
export type { BigQueryService };
