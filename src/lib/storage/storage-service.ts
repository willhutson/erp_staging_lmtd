import { db } from '@/lib/db';
import type { File, FileCategory, Prisma } from '@prisma/client';

/**
 * Storage configuration from environment
 */
const STORAGE_CONFIG = {
  provider: process.env.STORAGE_PROVIDER || 'local', // 'r2' | 'local'
  r2Endpoint: process.env.R2_ENDPOINT,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2Bucket: process.env.R2_BUCKET,
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  localPath: process.env.LOCAL_STORAGE_PATH || '/tmp/uploads',
};

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string | null {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : null;
}

/**
 * Generate a unique storage key
 */
export function generateStorageKey(
  organizationId: string,
  category: string,
  filename: string
): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = crypto.randomUUID();
  const ext = getExtension(filename);
  return `${organizationId}/${category}/${year}/${month}/${uuid}${ext ? `.${ext}` : ''}`;
}

/**
 * File service for managing uploads and downloads
 */
class FileService {
  /**
   * Create a file record (after upload)
   */
  async createFile(data: {
    organizationId: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    storageKey: string;
    category?: FileCategory;
    tags?: string[];
    folderId?: string;
    uploadedById: string;
    cdnUrl?: string;
    thumbnailKey?: string;
    thumbnailUrl?: string;
  }): Promise<File> {
    const extension = getExtension(data.originalName);

    return db.file.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        originalName: data.originalName,
        extension,
        mimeType: data.mimeType,
        size: data.size,
        storageKey: data.storageKey,
        category: data.category || 'OTHER',
        tags: data.tags || [],
        folderId: data.folderId,
        uploadedById: data.uploadedById,
        cdnUrl: data.cdnUrl,
        thumbnailKey: data.thumbnailKey,
        thumbnailUrl: data.thumbnailUrl,
      },
    });
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string, organizationId: string): Promise<File | null> {
    return db.file.findFirst({
      where: { id: fileId, organizationId, isArchived: false },
    });
  }

  /**
   * List files with filtering
   */
  async listFiles(options: {
    organizationId: string;
    category?: FileCategory;
    folderId?: string | null;
    search?: string;
    tags?: string[];
    uploadedById?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ files: File[]; total: number }> {
    const where: Prisma.FileWhereInput = {
      organizationId: options.organizationId,
      isArchived: false,
      ...(options.category && { category: options.category }),
      ...(options.folderId !== undefined && { folderId: options.folderId }),
      ...(options.uploadedById && { uploadedById: options.uploadedById }),
      ...(options.tags?.length && { tags: { hasSome: options.tags } }),
      ...(options.search && {
        OR: [
          { name: { contains: options.search, mode: 'insensitive' } },
          { originalName: { contains: options.search, mode: 'insensitive' } },
          { tags: { hasSome: [options.search] } },
        ],
      }),
    };

    const [files, total] = await Promise.all([
      db.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
        include: {
          uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
          folder: { select: { id: true, name: true, path: true } },
        },
      }),
      db.file.count({ where }),
    ]);

    return { files, total };
  }

  /**
   * Update file metadata
   */
  async updateFile(
    fileId: string,
    organizationId: string,
    data: {
      name?: string;
      category?: FileCategory;
      tags?: string[];
      folderId?: string | null;
    }
  ): Promise<File | null> {
    const file = await this.getFile(fileId, organizationId);
    if (!file) return null;

    return db.file.update({
      where: { id: fileId },
      data,
    });
  }

  /**
   * Archive file (soft delete)
   */
  async archiveFile(
    fileId: string,
    organizationId: string,
    archivedById: string
  ): Promise<boolean> {
    const file = await this.getFile(fileId, organizationId);
    if (!file) return false;

    await db.file.update({
      where: { id: fileId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedById,
      },
    });

    return true;
  }

  /**
   * Get files for a brief
   */
  async getBriefFiles(briefId: string): Promise<File[]> {
    const briefFiles = await db.briefFile.findMany({
      where: { briefId },
      include: { file: true },
      orderBy: { sortOrder: 'asc' },
    });
    return briefFiles.map((bf) => bf.file);
  }

  /**
   * Attach file to brief
   */
  async attachToBrief(data: {
    briefId: string;
    fileId: string;
    role?: string;
    addedById: string;
  }): Promise<void> {
    await db.briefFile.create({
      data: {
        briefId: data.briefId,
        fileId: data.fileId,
        role: data.role || 'attachment',
        addedById: data.addedById,
      },
    });
  }

  /**
   * Detach file from brief
   */
  async detachFromBrief(briefId: string, fileId: string): Promise<void> {
    await db.briefFile.delete({
      where: { briefId_fileId: { briefId, fileId } },
    });
  }

  /**
   * Get files for a client
   */
  async getClientFiles(clientId: string): Promise<File[]> {
    const clientFiles = await db.clientFile.findMany({
      where: { clientId },
      include: { file: true },
      orderBy: { sortOrder: 'asc' },
    });
    return clientFiles.map((cf) => cf.file);
  }

  /**
   * Attach file to client
   */
  async attachToClient(data: {
    clientId: string;
    fileId: string;
    role?: string;
    addedById: string;
  }): Promise<void> {
    await db.clientFile.create({
      data: {
        clientId: data.clientId,
        fileId: data.fileId,
        role: data.role || 'asset',
        addedById: data.addedById,
      },
    });
  }

  // Folder operations

  /**
   * Create a folder
   */
  async createFolder(data: {
    organizationId: string;
    name: string;
    parentId?: string;
    createdById: string;
    isPublic?: boolean;
  }): Promise<{ id: string; path: string }> {
    let path = `/${data.name}`;
    let depth = 0;

    if (data.parentId) {
      const parent = await db.folder.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        path = `${parent.path}/${data.name}`;
        depth = parent.depth + 1;
      }
    }

    const folder = await db.folder.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        parentId: data.parentId,
        path,
        depth,
        createdById: data.createdById,
        isPublic: data.isPublic || false,
      },
    });

    return { id: folder.id, path: folder.path };
  }

  /**
   * List folders
   */
  async listFolders(options: {
    organizationId: string;
    parentId?: string | null;
  }) {
    return db.folder.findMany({
      where: {
        organizationId: options.organizationId,
        parentId: options.parentId,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { files: true, children: true } },
      },
    });
  }

  /**
   * Get folder with contents
   */
  async getFolder(folderId: string, organizationId: string) {
    return db.folder.findFirst({
      where: { id: folderId, organizationId },
      include: {
        parent: true,
        children: {
          orderBy: { name: 'asc' },
        },
        files: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  /**
   * Get folder breadcrumbs
   */
  async getFolderBreadcrumbs(
    folderId: string
  ): Promise<Array<{ id: string; name: string }>> {
    const folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) return [];

    const pathParts = folder.path.split('/').filter(Boolean);
    const breadcrumbs: Array<{ id: string; name: string }> = [];

    // Build breadcrumbs from path
    let currentPath = '';
    for (const part of pathParts) {
      currentPath += `/${part}`;
      const f = await db.folder.findFirst({
        where: { path: currentPath, organizationId: folder.organizationId },
        select: { id: true, name: true },
      });
      if (f) breadcrumbs.push(f);
    }

    return breadcrumbs;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Check if file is an image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a video
   */
  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  /**
   * Check if file is a document
   */
  isDocument(mimeType: string): boolean {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'text/',
    ];
    return docTypes.some((t) => mimeType.startsWith(t));
  }
}

export const fileService = new FileService();
