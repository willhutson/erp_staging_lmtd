# Phase 7: File & Document Management - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** None (can run in parallel with Phase 6)

---

## Overview

Centralized file management for creative agency assets, deliverables, and documents. Built for scale, searchability, and AI processing.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FILE MANAGEMENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  UPLOAD                        PROCESSING                     STORAGE        │
│                                                                              │
│  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐  │
│  │ Web Upload  │──┐           │             │              │             │  │
│  │ (Drag/Drop) │  │           │ • Validate  │              │ Cloudflare  │  │
│  └─────────────┘  │           │ • Resize    │              │ R2          │  │
│                   │  ┌─────┐  │ • Thumbnail │  ┌───────┐   │             │  │
│  ┌─────────────┐  ├─▶│Queue│─▶│ • Extract   │─▶│ Store │──▶│ + CDN       │  │
│  │ Slack       │  │  └─────┘  │ • AI Tag    │  └───────┘   │             │  │
│  │ Upload      │──┤           │ • Index     │              │             │  │
│  └─────────────┘  │           │             │              └─────────────┘  │
│                   │           └─────────────┘                               │
│  ┌─────────────┐  │                                        ┌─────────────┐  │
│  │ API         │──┘                                        │ PostgreSQL  │  │
│  │ Upload      │                                           │ (Metadata)  │  │
│  └─────────────┘                                           └─────────────┘  │
│                                                                              │
│  DELIVERY                                                                    │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Presigned   │  │ CDN         │  │ Download    │  │ Client      │        │
│  │ URLs        │  │ Public URLs │  │ Links       │  │ Portal      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
// File record
model File {
  id              String   @id @default(cuid())
  organizationId  String

  // File identity
  name            String   // Display name
  originalName    String   // Original upload name
  extension       String?  // "jpg", "pdf", "mp4"
  mimeType        String   // "image/jpeg"
  size            Int      // Bytes

  // Storage
  storageKey      String   // R2/S3 key: "org_xxx/files/2024/abc123.jpg"
  storageProvider String   @default("r2")
  cdnUrl          String?  // Public CDN URL (if public)

  // Thumbnails
  thumbnailKey    String?
  thumbnailUrl    String?

  // Classification
  category        FileCategory @default(OTHER)
  tags            String[]     @default([])

  // Folder (optional organization)
  folderId        String?
  folder          Folder?  @relation(fields: [folderId], references: [id])

  // AI processing
  aiStatus        AIProcessingStatus @default(PENDING)
  aiMetadata      Json?    // Extracted text, labels, colors, etc.
  aiProcessedAt   DateTime?

  // Search
  searchVector    String?  @db.Text  // Concatenated searchable text

  // Ownership
  uploadedById    String
  uploadedBy      User     @relation(fields: [uploadedById], references: [id])

  // Soft delete
  isArchived      Boolean  @default(false)
  archivedAt      DateTime?
  archivedById    String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations - polymorphic links
  briefFiles      BriefFile[]
  clientFiles     ClientFile[]
  projectFiles    ProjectFile[]
  submissionFiles FormSubmissionFile[]

  @@index([organizationId])
  @@index([category])
  @@index([uploadedById])
  @@index([folderId])
  @@index([createdAt])
  @@map("files")
}

enum FileCategory {
  BRIEF_ATTACHMENT   // Reference materials for briefs
  DELIVERABLE        // Completed work
  CONTRACT           // Legal documents
  BRAND_ASSET        // Logos, fonts, brand guides
  REFERENCE          // Inspiration, moodboards
  INVOICE            // Financial documents
  PROFILE_PHOTO      // User avatars
  OTHER
}

enum AIProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  SKIPPED
}

// Folder structure
model Folder {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  parentId        String?
  path            String   // "/clients/CCAD/brand-assets"
  depth           Int      @default(0)

  // Permissions
  isPublic        Boolean  @default(false)  // Visible in client portal

  // Relations
  parent          Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children        Folder[] @relation("FolderHierarchy")
  files           File[]

  createdById     String
  createdAt       DateTime @default(now())

  @@unique([organizationId, path])
  @@index([organizationId])
  @@index([parentId])
  @@map("folders")
}

// Junction tables for entity relationships
model BriefFile {
  briefId   String
  fileId    String
  role      String   @default("attachment")  // "attachment", "deliverable", "reference"
  sortOrder Int      @default(0)
  addedAt   DateTime @default(now())
  addedById String

  brief     Brief    @relation(fields: [briefId], references: [id], onDelete: Cascade)
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([briefId, fileId])
  @@map("brief_files")
}

model ClientFile {
  clientId  String
  fileId    String
  role      String   @default("asset")  // "asset", "contract", "brand", "logo"
  sortOrder Int      @default(0)
  addedAt   DateTime @default(now())
  addedById String

  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([clientId, fileId])
  @@map("client_files")
}

model ProjectFile {
  projectId String
  fileId    String
  role      String   @default("asset")
  sortOrder Int      @default(0)
  addedAt   DateTime @default(now())
  addedById String

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([projectId, fileId])
  @@map("project_files")
}

model FormSubmissionFile {
  submissionId String
  fileId       String
  fieldId      String   // Which form field this was uploaded to
  sortOrder    Int      @default(0)
  addedAt      DateTime @default(now())

  submission   FormSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  file         File           @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([submissionId, fileId])
  @@map("form_submission_files")
}
```

---

## Storage Architecture

### Cloudflare R2 Configuration

```typescript
// src/lib/storage/r2-client.ts

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;

export const storage = {
  /**
   * Upload file to R2
   */
  async upload(key: string, body: Buffer | Blob, contentType: string): Promise<string> {
    await r2Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  },

  /**
   * Get presigned download URL (private files)
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn }
    );
  },

  /**
   * Get presigned upload URL (client-side upload)
   */
  async getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn }
    );
  },

  /**
   * Delete file
   */
  async delete(key: string): Promise<void> {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  },

  /**
   * Generate storage key
   */
  generateKey(organizationId: string, category: string, filename: string): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const ext = filename.split('.').pop();

    return `${organizationId}/${category}/${year}/${month}/${uuid}.${ext}`;
  },
};
```

### Folder Structure

```
{organization_id}/
├── files/              # General uploads
│   └── 2024/
│       └── 01/
│           └── {uuid}.{ext}
├── thumbnails/         # Generated thumbnails
│   └── 2024/
│       └── 01/
│           └── {uuid}_thumb.{ext}
├── avatars/            # User profile photos
│   └── {user_id}.{ext}
└── exports/            # Generated reports/exports
    └── 2024/
        └── 01/
            └── {uuid}.{ext}
```

---

## File Service

```typescript
// src/lib/files/file-service.ts

import { db } from '@/lib/db';
import { storage } from '@/lib/storage/r2-client';
import { imageProcessor } from './image-processor';
import { aiProcessor } from './ai-processor';
import type { FileCategory } from '@prisma/client';

interface UploadOptions {
  file: File | Buffer;
  filename: string;
  mimeType: string;
  category: FileCategory;
  organizationId: string;
  uploadedById: string;

  // Optional metadata
  tags?: string[];
  folderId?: string;

  // Optional linking
  linkTo?: {
    briefId?: string;
    clientId?: string;
    projectId?: string;
    submissionId?: string;
    fieldId?: string;
    role?: string;
  };
}

interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  cdnUrl?: string;
  thumbnailUrl?: string;
}

class FileService {
  /**
   * Upload a file
   */
  async upload(options: UploadOptions): Promise<FileRecord> {
    const {
      file,
      filename,
      mimeType,
      category,
      organizationId,
      uploadedById,
      tags = [],
      folderId,
      linkTo,
    } = options;

    // Convert File to Buffer if needed
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());
    const size = buffer.length;

    // Generate storage key
    const storageKey = storage.generateKey(organizationId, category, filename);

    // Upload to R2
    const cdnUrl = await storage.upload(storageKey, buffer, mimeType);

    // Generate thumbnail for images/videos
    let thumbnailKey: string | undefined;
    let thumbnailUrl: string | undefined;

    if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
      try {
        const thumbnail = await imageProcessor.generateThumbnail(buffer, mimeType);
        thumbnailKey = storageKey.replace(/\.[^.]+$/, '_thumb.jpg');
        thumbnailUrl = await storage.upload(thumbnailKey, thumbnail, 'image/jpeg');
      } catch (e) {
        console.error('Thumbnail generation failed:', e);
      }
    }

    // Create database record
    const fileRecord = await db.file.create({
      data: {
        organizationId,
        name: this.sanitizeFilename(filename),
        originalName: filename,
        extension: filename.split('.').pop()?.toLowerCase(),
        mimeType,
        size,
        storageKey,
        cdnUrl,
        thumbnailKey,
        thumbnailUrl,
        category,
        tags,
        folderId,
        uploadedById,
        aiStatus: this.shouldProcessWithAI(mimeType) ? 'PENDING' : 'SKIPPED',
      },
    });

    // Create link to entity if specified
    if (linkTo) {
      await this.linkToEntity(fileRecord.id, uploadedById, linkTo);
    }

    // Queue AI processing
    if (fileRecord.aiStatus === 'PENDING') {
      await this.queueAIProcessing(fileRecord.id);
    }

    return fileRecord;
  }

  /**
   * Get presigned download URL
   */
  async getDownloadUrl(fileId: string, userId: string): Promise<string> {
    const file = await db.file.findUnique({
      where: { id: fileId },
      include: { uploadedBy: true },
    });

    if (!file) throw new Error('File not found');

    // TODO: Add permission check

    return storage.getPresignedUrl(file.storageKey);
  }

  /**
   * Search files
   */
  async search(options: {
    organizationId: string;
    query?: string;
    category?: FileCategory;
    tags?: string[];
    clientId?: string;
    briefId?: string;
    folderId?: string;
    mimeTypes?: string[];
    dateRange?: { start: Date; end: Date };
    limit?: number;
    offset?: number;
  }): Promise<{ files: FileRecord[]; total: number }> {
    const where: Prisma.FileWhereInput = {
      organizationId: options.organizationId,
      isArchived: false,
      ...(options.category && { category: options.category }),
      ...(options.folderId && { folderId: options.folderId }),
      ...(options.tags?.length && { tags: { hasEvery: options.tags } }),
      ...(options.mimeTypes?.length && { mimeType: { in: options.mimeTypes } }),
      ...(options.dateRange && {
        createdAt: {
          gte: options.dateRange.start,
          lte: options.dateRange.end,
        },
      }),
      ...(options.query && {
        OR: [
          { name: { contains: options.query, mode: 'insensitive' } },
          { tags: { has: options.query.toLowerCase() } },
          { searchVector: { contains: options.query, mode: 'insensitive' } },
        ],
      }),
      ...(options.clientId && {
        clientFiles: { some: { clientId: options.clientId } },
      }),
      ...(options.briefId && {
        briefFiles: { some: { briefId: options.briefId } },
      }),
    };

    const [files, total] = await Promise.all([
      db.file.findMany({
        where,
        take: options.limit || 20,
        skip: options.offset || 0,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true } },
          folder: { select: { id: true, name: true, path: true } },
        },
      }),
      db.file.count({ where }),
    ]);

    return { files, total };
  }

  /**
   * Move file to folder
   */
  async moveToFolder(fileId: string, folderId: string | null): Promise<void> {
    await db.file.update({
      where: { id: fileId },
      data: { folderId },
    });
  }

  /**
   * Add tags to file
   */
  async addTags(fileId: string, tags: string[]): Promise<void> {
    const file = await db.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const newTags = [...new Set([...file.tags, ...tags.map((t) => t.toLowerCase())])];

    await db.file.update({
      where: { id: fileId },
      data: { tags: newTags },
    });
  }

  /**
   * Archive file (soft delete)
   */
  async archive(fileId: string, userId: string): Promise<void> {
    await db.file.update({
      where: { id: fileId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedById: userId,
      },
    });
  }

  /**
   * Permanently delete file
   */
  async delete(fileId: string): Promise<void> {
    const file = await db.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    // Delete from storage
    await storage.delete(file.storageKey);
    if (file.thumbnailKey) {
      await storage.delete(file.thumbnailKey);
    }

    // Delete database record (cascades to links)
    await db.file.delete({ where: { id: fileId } });
  }

  /**
   * Create folder
   */
  async createFolder(data: {
    organizationId: string;
    name: string;
    parentId?: string;
    createdById: string;
  }): Promise<Folder> {
    const parent = data.parentId
      ? await db.folder.findUnique({ where: { id: data.parentId } })
      : null;

    const path = parent
      ? `${parent.path}/${this.slugify(data.name)}`
      : `/${this.slugify(data.name)}`;

    const depth = parent ? parent.depth + 1 : 0;

    return db.folder.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        parentId: data.parentId,
        path,
        depth,
        createdById: data.createdById,
      },
    });
  }

  /**
   * Get folder tree
   */
  async getFolderTree(organizationId: string): Promise<FolderTree[]> {
    const folders = await db.folder.findMany({
      where: { organizationId },
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { files: true } },
      },
    });

    return this.buildTree(folders);
  }

  // Private helpers

  private async linkToEntity(
    fileId: string,
    addedById: string,
    linkTo: {
      briefId?: string;
      clientId?: string;
      projectId?: string;
      submissionId?: string;
      fieldId?: string;
      role?: string;
    }
  ): Promise<void> {
    if (linkTo.briefId) {
      await db.briefFile.create({
        data: {
          briefId: linkTo.briefId,
          fileId,
          role: linkTo.role || 'attachment',
          addedById,
        },
      });
    }

    if (linkTo.clientId) {
      await db.clientFile.create({
        data: {
          clientId: linkTo.clientId,
          fileId,
          role: linkTo.role || 'asset',
          addedById,
        },
      });
    }

    if (linkTo.projectId) {
      await db.projectFile.create({
        data: {
          projectId: linkTo.projectId,
          fileId,
          role: linkTo.role || 'asset',
          addedById,
        },
      });
    }

    if (linkTo.submissionId && linkTo.fieldId) {
      await db.formSubmissionFile.create({
        data: {
          submissionId: linkTo.submissionId,
          fileId,
          fieldId: linkTo.fieldId,
        },
      });
    }
  }

  private shouldProcessWithAI(mimeType: string): boolean {
    return (
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('text/')
    );
  }

  private async queueAIProcessing(fileId: string): Promise<void> {
    // Queue for async processing (Inngest, Trigger.dev, or simple API call)
    await fetch(`${process.env.APP_URL}/api/jobs/process-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.INTERNAL_API_KEY}` },
      body: JSON.stringify({ fileId }),
    });
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 255);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private buildTree(folders: Folder[]): FolderTree[] {
    const map = new Map<string, FolderTree>();
    const roots: FolderTree[] = [];

    folders.forEach((folder) => {
      map.set(folder.id, { ...folder, children: [] });
    });

    folders.forEach((folder) => {
      const node = map.get(folder.id)!;
      if (folder.parentId) {
        const parent = map.get(folder.parentId);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const fileService = new FileService();
```

---

## AI Processing Pipeline

```typescript
// src/lib/files/ai-processor.ts

import { db } from '@/lib/db';
import { storage } from '@/lib/storage/r2-client';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface AIMetadata {
  // Text extraction
  extractedText?: string;
  summary?: string;

  // Image analysis
  description?: string;
  labels?: string[];
  dominantColors?: string[];
  containsFaces?: boolean;
  faceCount?: number;

  // Video analysis
  duration?: number;
  keyFrames?: string[];

  // Document analysis
  documentType?: string;
  language?: string;
  pageCount?: number;
}

class AIProcessor {
  async processFile(fileId: string): Promise<void> {
    const file = await db.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    // Update status
    await db.file.update({
      where: { id: fileId },
      data: { aiStatus: 'PROCESSING' },
    });

    try {
      const aiMetadata: AIMetadata = {};

      // Get file content
      const url = await storage.getPresignedUrl(file.storageKey);

      if (file.mimeType.startsWith('image/')) {
        const imageAnalysis = await this.analyzeImage(url);
        Object.assign(aiMetadata, imageAnalysis);
      } else if (file.mimeType === 'application/pdf') {
        const pdfAnalysis = await this.analyzePDF(url);
        Object.assign(aiMetadata, pdfAnalysis);
      } else if (file.mimeType.startsWith('text/') || file.mimeType.includes('document')) {
        const textAnalysis = await this.analyzeText(url);
        Object.assign(aiMetadata, textAnalysis);
      }

      // Build search vector
      const searchVector = this.buildSearchVector(file.name, file.tags, aiMetadata);

      // Update file with AI metadata
      await db.file.update({
        where: { id: fileId },
        data: {
          aiStatus: 'COMPLETED',
          aiMetadata,
          aiProcessedAt: new Date(),
          searchVector,
          // Auto-add tags from AI
          tags: [...new Set([...file.tags, ...(aiMetadata.labels || [])])],
        },
      });
    } catch (error) {
      await db.file.update({
        where: { id: fileId },
        data: {
          aiStatus: 'FAILED',
          aiMetadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      });
      throw error;
    }
  }

  private async analyzeImage(url: string): Promise<Partial<AIMetadata>> {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url },
            },
            {
              type: 'text',
              text: `Analyze this image and return JSON with:
- description: A brief description (1-2 sentences)
- labels: Array of relevant tags (max 10)
- dominantColors: Array of hex color codes for dominant colors (max 5)
- containsFaces: boolean
- faceCount: number of faces if any

Return only valid JSON.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  }

  private async analyzePDF(url: string): Promise<Partial<AIMetadata>> {
    // For PDFs, we'd use a PDF extraction service
    // This is a placeholder - in production use pdf-parse or similar
    return {
      documentType: 'pdf',
      // Would extract text, page count, etc.
    };
  }

  private async analyzeText(url: string): Promise<Partial<AIMetadata>> {
    // Fetch and analyze text content
    const response = await fetch(url);
    const text = await response.text();

    const summary = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Summarize this document in 2-3 sentences:\n\n${text.slice(0, 10000)}`,
        },
      ],
    });

    return {
      extractedText: text.slice(0, 50000),
      summary: summary.content[0].type === 'text' ? summary.content[0].text : '',
    };
  }

  private buildSearchVector(
    name: string,
    tags: string[],
    metadata: AIMetadata
  ): string {
    const parts = [
      name,
      ...tags,
      metadata.description,
      metadata.extractedText?.slice(0, 5000),
      metadata.summary,
      ...(metadata.labels || []),
    ].filter(Boolean);

    return parts.join(' ');
  }
}

export const aiProcessor = new AIProcessor();
```

---

## UI Components

### FileUploader

```typescript
// src/components/files/FileUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import { uploadFile } from '@/modules/files/actions';
import { cn } from '@/lib/utils';

interface Props {
  onUpload: (files: FileRecord[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  category?: FileCategory;
  linkTo?: {
    briefId?: string;
    clientId?: string;
    submissionId?: string;
    fieldId?: string;
  };
}

export function FileUploader({
  onUpload,
  accept,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  category = 'OTHER',
  linkTo,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);

      const uploadingFiles = acceptedFiles.map((file) => ({
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading' as const,
      }));

      setFiles(uploadingFiles);

      const results: FileRecord[] = [];

      for (let i = 0; i < uploadingFiles.length; i++) {
        try {
          const formData = new FormData();
          formData.append('file', uploadingFiles[i].file);
          formData.append('category', category);
          if (linkTo) formData.append('linkTo', JSON.stringify(linkTo));

          const result = await uploadFile(formData);
          results.push(result);

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, progress: 100, status: 'done' } : f
            )
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', error: 'Upload failed' } : f
            )
          );
        }
      }

      setUploading(false);
      onUpload(results);
    },
    [category, linkTo, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-[#52EDC7] bg-[#52EDC7]/10'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-[#52EDC7] font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <FileIcon mimeType={file.file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {file.status === 'uploading' && (
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#52EDC7] transition-all"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
              {file.status === 'done' && (
                <span className="text-green-500 text-sm">Done</span>
              )}
              {file.status === 'error' && (
                <span className="text-red-500 text-sm">{file.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
```

### FileGallery

```typescript
// src/components/files/FileGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Grid, List, Download, Trash2, Tag, MoreVertical } from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  files: FileRecord[];
  view?: 'grid' | 'list';
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  onTagUpdate?: (fileId: string, tags: string[]) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function FileGallery({
  files,
  view = 'grid',
  onDelete,
  onDownload,
  selectable,
  selectedIds = [],
  onSelectionChange,
}: Props) {
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);

  const toggleSelection = (fileId: string) => {
    if (!onSelectionChange) return;
    const newSelection = selectedIds.includes(fileId)
      ? selectedIds.filter((id) => id !== fileId)
      : [...selectedIds, fileId];
    onSelectionChange(newSelection);
  };

  if (view === 'list') {
    return (
      <>
        <div className="border rounded-lg divide-y">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50"
            >
              {selectable && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(file.id)}
                  onChange={() => toggleSelection(file.id)}
                  className="rounded border-gray-300"
                />
              )}
              <div
                className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                {file.thumbnailUrl ? (
                  <Image
                    src={file.thumbnailUrl}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                ) : (
                  <FileIcon mimeType={file.mimeType} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                </p>
              </div>
              {file.tags.length > 0 && (
                <div className="flex gap-1">
                  {file.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                {onDownload && (
                  <button
                    onClick={() => onDownload(file.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {previewFile && (
          <FilePreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </>
    );
  }

  // Grid view
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'group relative border rounded-lg overflow-hidden cursor-pointer',
              selectedIds.includes(file.id) && 'ring-2 ring-[#52EDC7]'
            )}
            onClick={() => selectable ? toggleSelection(file.id) : setPreviewFile(file)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {file.thumbnailUrl ? (
                <Image
                  src={file.thumbnailUrl}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <FileIcon mimeType={file.mimeType} size="lg" />
              )}
            </div>
            <div className="p-2">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 bg-white rounded shadow">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}
```

---

## Server Actions

```typescript
// src/modules/files/actions/file-actions.ts
'use server';

import { auth } from '@/lib/auth';
import { fileService } from '@/lib/files/file-service';
import { revalidatePath } from 'next/cache';
import type { FileCategory } from '@prisma/client';

export async function uploadFile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const file = formData.get('file') as File;
  const category = (formData.get('category') as FileCategory) || 'OTHER';
  const linkTo = formData.get('linkTo') ? JSON.parse(formData.get('linkTo') as string) : undefined;
  const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
  const folderId = formData.get('folderId') as string | undefined;

  const result = await fileService.upload({
    file,
    filename: file.name,
    mimeType: file.type,
    category,
    organizationId: session.user.organizationId,
    uploadedById: session.user.id,
    tags,
    folderId,
    linkTo,
  });

  revalidatePath('/files');
  return result;
}

export async function getFiles(options: {
  query?: string;
  category?: FileCategory;
  folderId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return fileService.search({
    organizationId: session.user.organizationId,
    ...options,
  });
}

export async function getDownloadUrl(fileId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return fileService.getDownloadUrl(fileId, session.user.id);
}

export async function deleteFile(fileId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // TODO: Permission check
  await fileService.archive(fileId, session.user.id);
  revalidatePath('/files');
}

export async function createFolder(data: { name: string; parentId?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const folder = await fileService.createFolder({
    organizationId: session.user.organizationId,
    name: data.name,
    parentId: data.parentId,
    createdById: session.user.id,
  });

  revalidatePath('/files');
  return folder;
}

export async function getFolderTree() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return fileService.getFolderTree(session.user.organizationId);
}

export async function updateFileTags(fileId: string, tags: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await fileService.addTags(fileId, tags);
  revalidatePath('/files');
}
```

---

## Implementation Checklist

### Phase 7.1: Storage Infrastructure
- [ ] Configure Cloudflare R2 bucket
- [ ] Implement R2 client with presigned URLs
- [ ] Create database schema (File, Folder, junction tables)
- [ ] Implement FileService core methods

### Phase 7.2: Upload Flow
- [ ] Build FileUploader component with drag-drop
- [ ] Implement server action for file upload
- [ ] Add thumbnail generation for images
- [ ] Test large file uploads

### Phase 7.3: File Browsing
- [ ] Build FileGallery component (grid/list views)
- [ ] Implement folder tree navigation
- [ ] Add search and filter functionality
- [ ] Build FilePreviewModal for previews

### Phase 7.4: Integration
- [ ] Connect to brief attachments
- [ ] Connect to form submission files
- [ ] Connect to client assets
- [ ] Update existing file upload fields

### Phase 7.5: AI Processing
- [ ] Set up async processing job
- [ ] Implement image analysis with Claude
- [ ] Implement text/PDF extraction
- [ ] Add auto-tagging from AI

---

## TeamLMTD Configuration

```typescript
const lmtdFileConfig = {
  // Storage limits
  maxFileSize: 100 * 1024 * 1024,  // 100MB
  maxFilesPerUpload: 20,
  totalStorageQuota: 500 * 1024 * 1024 * 1024,  // 500GB

  // Allowed file types
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    videos: ['video/mp4', 'video/quicktime', 'video/webm'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    design: ['application/postscript', 'image/vnd.adobe.photoshop'],
  },

  // Default folder structure
  defaultFolders: [
    { name: 'Clients', path: '/clients' },
    { name: 'Brand Assets', path: '/brand-assets' },
    { name: 'Templates', path: '/templates' },
    { name: 'Shared', path: '/shared' },
  ],

  // AI processing
  aiProcessing: {
    enabled: true,
    autoTag: true,
    extractText: true,
    generateDescriptions: true,
  },
};
```

---

*Document Status: Technical Specification*
*Last Updated: December 2024*
