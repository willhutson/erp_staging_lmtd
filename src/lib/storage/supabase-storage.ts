/**
 * Supabase Storage Client for DAM
 * Phase 1 - Supabase Migration
 *
 * Handles signed URL generation for uploads and downloads.
 * All uploads use signed URLs (client-side direct upload to Supabase).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Bucket configuration
export const DAM_BUCKET = "dam";

// URL expiry times
const UPLOAD_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour for uploads
const DOWNLOAD_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour for downloads

// Supabase client singleton
let supabaseAdmin: SupabaseClient | null = null;

/**
 * Get the Supabase admin client for storage operations
 * Uses service role key for server-side operations
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

/**
 * Check if Supabase storage is configured
 */
export function isSupabaseStorageConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Generate the storage path for a file
 * Convention: org/{organizationId}/{category}/{year}/{month}/{uuid}.{ext}
 */
export function generateStoragePath(
  organizationId: string,
  category: string,
  filename: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID();

  // Extract extension
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "";

  return `org/${organizationId}/${category.toLowerCase()}/${year}/${month}/${uuid}${ext ? `.${ext}` : ""}`;
}

/**
 * Result of generating an upload URL
 */
export interface UploadUrlResult {
  bucket: string;
  path: string;
  signedUrl: string;
  expiresAt: Date;
}

/**
 * Generate a signed upload URL
 * Client uploads directly to Supabase Storage using this URL
 */
export async function generateUploadUrl(
  organizationId: string,
  category: string,
  filename: string,
  mimeType?: string
): Promise<UploadUrlResult> {
  const supabase = getSupabaseAdmin();
  const path = generateStoragePath(organizationId, category, filename);

  const { data, error } = await supabase.storage
    .from(DAM_BUCKET)
    .createSignedUploadUrl(path, {
      upsert: false,
    });

  if (error) {
    console.error("Error generating upload URL:", error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }

  const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRY_SECONDS * 1000);

  return {
    bucket: DAM_BUCKET,
    path,
    signedUrl: data.signedUrl,
    expiresAt,
  };
}

/**
 * Result of generating a download URL
 */
export interface DownloadUrlResult {
  signedUrl: string;
  expiresAt: Date;
}

/**
 * Generate a signed download URL
 * Used to serve files to authenticated users
 */
export async function generateDownloadUrl(
  path: string,
  expiresInSeconds: number = DOWNLOAD_URL_EXPIRY_SECONDS
): Promise<DownloadUrlResult> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(DAM_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error("Error generating download URL:", error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return {
    signedUrl: data.signedUrl,
    expiresAt,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(DAM_BUCKET).remove([path]);

  if (error) {
    console.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get file metadata from storage
 */
export async function getFileMetadata(path: string) {
  const supabase = getSupabaseAdmin();

  // Extract folder and filename from path
  const lastSlash = path.lastIndexOf("/");
  const folder = lastSlash > 0 ? path.substring(0, lastSlash) : "";
  const filename = path.substring(lastSlash + 1);

  const { data, error } = await supabase.storage
    .from(DAM_BUCKET)
    .list(folder, {
      limit: 1,
      search: filename,
    });

  if (error) {
    console.error("Error getting file metadata:", error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }

  const file = data?.find((f) => f.name === filename);
  return file || null;
}

/**
 * Verify a path belongs to an organization
 * Prevents cross-tenant access
 */
export function verifyPathOwnership(
  path: string,
  organizationId: string
): boolean {
  const expectedPrefix = `org/${organizationId}/`;
  return path.startsWith(expectedPrefix);
}
