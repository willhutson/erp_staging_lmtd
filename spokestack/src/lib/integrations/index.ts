/**
 * Integration Services Index
 *
 * Central export for all integration services used in SpokeStack.
 * Each integration has its own service file with configuration,
 * authentication, and API methods.
 */

// Phyllo - Creator data aggregation
export {
  phyllo,
  PHYLLO_PLATFORMS,
  type PhylloConfig,
  type PhylloUser,
  type PhylloAccount,
  type PhylloIdentity,
  type PhylloEngagement,
  type PhylloAudience,
  type PhylloContent,
  type PhylloDemographicBreakdown,
  type PhylloPlatformId,
  type PhylloService,
} from './phyllo';

// BigQuery - Data warehouse
export {
  bigquery,
  SPOKESTACK_TABLES,
  type BigQueryConfig,
  type BigQueryCredentials,
  type BigQueryJob,
  type BigQueryQueryResult,
  type BigQueryTable,
  type BigQueryService,
} from './bigquery';

// Integration status types
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface IntegrationInfo {
  id: string;
  name: string;
  status: IntegrationStatus;
  lastSync?: Date;
  error?: string;
  accountCount?: number;
}

/**
 * Get status of all integrations
 */
export async function getIntegrationStatuses(): Promise<IntegrationInfo[]> {
  const statuses: IntegrationInfo[] = [];

  // Check Phyllo
  const { phyllo: phylloService } = await import('./phyllo');
  statuses.push({
    id: 'phyllo',
    name: 'Phyllo',
    status: phylloService.isConfigured() ? 'connected' : 'disconnected',
  });

  // Check BigQuery
  const { bigquery: bqService } = await import('./bigquery');
  statuses.push({
    id: 'bigquery',
    name: 'Google BigQuery',
    status: bqService.isConfigured() ? 'connected' : 'disconnected',
  });

  // Add more integrations as they are implemented
  // These would typically be stored in the database

  return statuses;
}

/**
 * Initialize an integration with stored credentials
 */
export async function initializeIntegration(
  integrationId: string,
  credentials: Record<string, unknown>
): Promise<void> {
  switch (integrationId) {
    case 'phyllo': {
      const { phyllo: phylloService } = await import('./phyllo');
      phylloService.configure({
        clientId: credentials.clientId as string,
        clientSecret: credentials.clientSecret as string,
        environment: (credentials.environment as 'sandbox' | 'production') || 'sandbox',
      });
      break;
    }
    case 'bigquery': {
      const { bigquery: bqService } = await import('./bigquery');
      bqService.configure({
        projectId: credentials.projectId as string,
        datasetId: credentials.datasetId as string,
        credentials: credentials.serviceAccount as import('./bigquery').BigQueryCredentials,
      });
      break;
    }
    default:
      throw new Error(`Unknown integration: ${integrationId}`);
  }
}
