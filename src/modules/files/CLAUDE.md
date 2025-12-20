# Files Module

## Purpose
Central file management system for the ERP platform. Handles file uploads, storage, organization, and attachment to entities (briefs, clients, projects, form submissions).

## Architecture

### Storage
- **Local Development**: Files stored in `/tmp/uploads` with filesystem storage
- **Production**: Cloudflare R2 (S3-compatible) with CDN URLs
- **Storage Keys**: `{orgId}/{category}/{year}/{month}/{uuid}.{ext}`

### Database Schema
- **File**: Core file metadata (name, size, mimeType, storageKey, cdnUrl)
- **Folder**: Hierarchical folder structure with paths
- **Junction Tables**: BriefFile, ClientFile, ProjectFile, FormSubmissionFile

### Categories
```typescript
enum FileCategory {
  LOGO          // Client/brand logos
  BRAND_ASSET   // Brand guidelines, fonts, colors
  DOCUMENT      // PDFs, docs, spreadsheets
  VIDEO         // Video files
  IMAGE         // General images
  AUDIO         // Audio files
  DESIGN_FILE   // PSD, AI, Figma exports
  OTHER         // Everything else
}
```

## Key Files

```
/src/modules/files/
  actions/file-actions.ts   # Server actions for CRUD

/src/lib/storage/
  storage-service.ts        # FileService class

/src/components/files/
  FileUploader.tsx          # Drag-drop uploader
  FileGrid.tsx              # Grid/list file browser
  BriefFileAttachments.tsx  # Brief attachment component
  ClientFileAttachments.tsx # Client asset component

/src/app/api/files/
  upload/route.ts           # Multipart upload handler
  serve/[...path]/route.ts  # File serving endpoint
```

## Usage

### Uploading Files
```tsx
import { FileUploader } from "@/components/files";

<FileUploader
  category="DOCUMENT"
  onUploadComplete={(file) => console.log(file)}
  onError={(error) => console.error(error)}
/>
```

### Attaching to Brief
```tsx
import { BriefFileAttachments } from "@/components/files";

<BriefFileAttachments
  briefId={brief.id}
  files={briefFiles}
  onRefresh={refresh}
/>
```

### Server Actions
```typescript
import {
  getFiles,
  createFileRecord,
  attachFileToBrief,
  attachFileToClient,
} from "@/modules/files/actions/file-actions";

// Get files for organization
const { files, total } = await getFiles({ category: "IMAGE" });

// Attach file to brief
await attachFileToBrief({
  briefId: "...",
  fileId: "...",
  role: "reference",
});
```

## Security
- All file access checks organizationId
- Upload validates file type and size (100MB max)
- Serving endpoint verifies file ownership
- Storage keys are UUID-based (not guessable)

## Future Enhancements
- R2 integration with presigned URLs
- Image thumbnails generation
- Video transcoding
- AI-powered tagging and search
- Version history
