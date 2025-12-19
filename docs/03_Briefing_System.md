# TeamLMTD ERP Platform

## Briefing System

**Version:** 2.0 | **Forms:** 7 Types | **Source:** Monday.com Migration

---

## 1. Overview

The briefing system handles all work requests from Account Managers to creative teams. Each brief type has:
- Structured form with validated fields
- Naming convention enforcement
- AI quality scoring
- Workflow state machine
- Slack integration

### Brief Types Summary

| Type | Prefix | Slack | Primary Team |
|------|--------|-------|--------------|
| Video Shoot | `Shoot:` | `/brief-shoot` | Video Production |
| Video Edit | `Edit:` | `/brief-edit` | Video Production |
| Design | `Design:` | `/brief-design` | Creative & Design |
| Copywriting EN | `Copy:` | `/brief-copy` | Copywriting |
| Copywriting AR | `Copy:` | `/brief-copy-ar` | Copywriting |
| Paid Media | `Paid Media:` | `/brief-media` | Paid Media |
| RFP | `RFP –` | `/rfp` | Leadership |

---

## 2. Form Specifications

### Form 1: Video Shoot Request

**Naming:** `Shoot: [Client] – [Campaign/Topic]`  
**Example:** `Shoot: CCAD – Talking Heads`

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| Project Title | text | ✅ | 255 | Naming pattern validated |
| Your Name | user-select | ✅ | - | Filter: Client Servicing |
| Client | client-select | ✅ | - | - |
| Assigned Videographer | user-select | ✅ | - | Filter: Video Production |
| Location | textarea | ✅ | 2000 | City and full address |
| Date(s) | date-range | ✅ | - | Same date for single day |
| Timing | text | ✅ | - | e.g., "10am-2pm" |
| Transport Needed? | select | ✅ | - | Yes / No / Not Sure |
| Shooting Method | select | ✅ | - | Studio / On Location / Hybrid |
| Deliverables | multi-select | ✅ | - | Raw, Edited, Photos, BTS |
| Campaign Objective | textarea | ✅ | 2000 | Context and goals |
| Talent V/O Needed? | textarea | ✅ | 2000 | Yes/No with details |
| Additional Notes | textarea | ❌ | 2000 | Special requests |
| Reference Link | url | ❌ | - | Moodboards, storyboards |
| Attachments | file-upload | ❌ | - | Multiple files |

**Quality Rules:**
- Location ≥20 chars (15%)
- Objective ≥50 chars (20%)
- Timing not empty (10%)
- ≥1 deliverable selected (15%)
- Reference link present (10%)
- Has attachments (10%)
- Talent V/O ≥10 chars (10%)
- Notes ≥20 chars (10%)

---

### Form 2: Video Edit Request

**Naming:** `Edit: [Client] – [Campaign/Topic]`  
**Example:** `Edit: CCAD – Talking Heads`

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| Project Title | text | ✅ | 255 | - |
| Your Name | user-select | ✅ | - | - |
| Client | client-select | ✅ | - | - |
| Assigned Editor | user-select | ✅ | - | Filter: Video Production |
| Deadline | date | ✅ | - | Include time preference |
| Booking Date(s) | date-range | ✅ | - | Editor availability |
| Platforms | multi-select | ✅ | - | Instagram, YouTube, TikTok, etc. |
| Video Sizes | multi-select | ✅ | - | 16:9, 9:16, 1:1 |
| Duration | text | ✅ | - | e.g., "under 1 min" |
| Brief | textarea | ✅ | 2000 | Or Google Doc link |
| B-Roll Guidance | textarea | ✅ | 2000 | Editor direction |
| Reference Link | url | ❌ | - | Past edits, inspiration |
| Attachments | file-upload | ❌ | - | Logos, audio, b-roll |

**Assigned Editor Options:**
```
Haani Farooq (Content Specialist)
Harsh Prajapati (Video Specialist)
Jasim Kuttuan (Video Specialist)
Marvin Vasquez (Video Specialist)
Hteth Aung Win (Video Creator)
Yadu Krishnan (Video Creator)
Veysel Enis (Video Creator)
```

---

### Form 3: Design Request

**Naming:** `Design: [Client] – [Campaign/Topic]`  
**Example:** `Design: ECD – Changemakers Campaign`

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| Project Title | text | ✅ | 255 | - |
| Your Name | user-select | ✅ | - | - |
| Client | client-select | ✅ | - | - |
| Type of Media | select | ✅ | - | Static, Animated, etc. |
| Deliverables | multi-select | ✅ | - | Platform & sizes needed |
| Language(s) | multi-select | ✅ | - | EN, AR, Other |
| Internal Deadline | date | ✅ | - | - |
| Brief | textarea | ✅ | 2000 | Overview, context |
| Copy | textarea | ✅ | 2000 | Exact copy for design |
| Assets | file-upload | ❌ | - | Multiple |
| Inspiration | file-upload | ❌ | - | Reference materials |
| Reference Link | url | ❌ | - | - |

**Assigned Designer Options:**
```
Klaudia Pszczolinska (Design Director)
Mohamed Nejib (Graphic Designer)
John Vincent Gomez (Graphic Designer)
Anas Eramullan (Graphic Designer - Freelancer)
Jasim Kuttuan (Does design occasionally)
Marvin Vasquez (Does design occasionally)
```

---

### Form 4: Copywriting Request (English)

**Naming:** `Copy: [Client] – [Campaign/Topic]`  
**Example:** `Copy: LMTD – Ramadan Campaign Captions`

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| Project Title | text | ✅ | 255 | - |
| Your Name | user-select | ✅ | - | - |
| Client | client-select | ✅ | - | - |
| Assigned Copywriter | user-select | ✅ | - | Filter: EN Copywriters |
| Description | textarea | ✅ | 2000 | Objective, brand, topic |
| Languages Required | multi-select | ✅ | - | - |
| Platforms Needed | multi-select | ✅ | - | - |
| Format Required | select | ✅ | - | Captions, Articles, etc. |
| Tone of Voice | textarea | ✅ | 2000 | Examples, mood |
| Deadline | date | ✅ | - | - |
| Attachments | file-upload | ❌ | - | - |

**English Copywriter Options:**
```
Emaan Omer (English Copywriter)
Razan Samir Abdallah (Content Specialist)
```

---

### Form 5: Arabic Copywriting Request

**Naming:** `Copy: [Client] – [Campaign/Topic]`  
**Example:** `Copy: LMTD – Ramadan Campaign Captions`

Same fields as English Copywriting, different assignees.

**Arabic Copywriter Options:**
```
Tony Samaan (Arabic Copywriter)
Marcelle Alzaher (Junior Arabic Copywriter)
```

---

### Form 6: Paid Media Request

**Naming:** `Paid Media: [Client] – [Campaign/Topic]`  
**Example:** `Paid Media: ECD – Changemakers Campaign`

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| Project Title | text | ✅ | 255 | - |
| Requester Name | user-select | ✅ | - | - |
| Client | client-select | ✅ | - | - |
| Description & Objectives | textarea | ✅ | 2000 | Goals, KPIs |
| Type of Campaign | select | ✅ | - | Awareness, Conversion, etc. |
| Target Audience | textarea | ✅ | 2000 | Demographics, interests |
| Duration | date-range | ✅ | - | Campaign dates |
| Deadline | date | ✅ | - | Media plan delivery |
| Platforms | multi-select | ✅ | - | Meta, Google, TikTok, etc. |
| Budget | text | ✅ | - | Amount or "Recommend" |
| Budget Split | textarea | ✅ | 2000 | Platform/regional |
| Requirements | textarea | ✅ | 2000 | Detailed plan needs |
| Creative Assets | file-upload | ❌ | - | Mockups, references |
| Additional Notes | textarea | ❌ | 2000 | Context, insights |

**Media Manager Options:**
```
Omer Gunal (Analyst)
Nourhan Mohamed Radwan (Paid Media Specialist)
```

---

### Form 7: RFP Submission

**Naming:** `RFP – [Client/Entity Name]`  
**Example:** `RFP – Dubai South`

**Access:** Leadership only (Will, Afaq, CJ, Matthew)

| Field | Type | Required | Max | Notes |
|-------|------|----------|-----|-------|
| RFP Name | text | ✅ | 255 | Format: `RFP – [Entity]` |
| Client Name | text | ✅ | - | Organization name |
| RFP Code | text | ✅ | - | Reference code |
| Portal | text | ✅ | - | Where received |
| Date Received | date | ✅ | - | - |
| Submission Deadline | date | ✅ | - | Client deadline |
| RFP Owner | text | ✅ | - | Client contact |
| Scope of Work | textarea | ✅ | 2000 | What they're asking |
| Bid Bond Required | select | ✅ | - | Yes / No |
| Estimated Value | number | ❌ | - | Pipeline value |
| Win Probability | select | ❌ | - | Low / Medium / High |
| Additional Info | textarea | ❌ | 2000 | Other details |

*See 05_RFP_Management.md for workflow details.*

---

## 3. Workflow States

### Brief Status Flow

```
                    ┌──────────────────────────────────────┐
                    │                                      │
DRAFT ──► SUBMITTED ──► IN_REVIEW ──► APPROVED ──► IN_PROGRESS
                                                       │
                          ┌────────────────────────────┘
                          ▼
                   INTERNAL_REVIEW
                          │
                          ▼
                    CLIENT_REVIEW
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
          COMPLETED               REVISIONS
                                     │
                                     └──► IN_PROGRESS
```

### Status Definitions

| Status | Description | Color | Actions |
|--------|-------------|-------|---------|
| DRAFT | Saved, not submitted | Gray | Edit, Submit, Delete |
| SUBMITTED | Awaiting assignment | Blue | Assign, Edit |
| IN_REVIEW | Team lead reviewing | Yellow | Approve, Reject |
| APPROVED | Ready to start | Green | Start Work |
| IN_PROGRESS | Actively working | Blue | Track Time, Update |
| INTERNAL_REVIEW | Team reviewing | Yellow | Approve, Request Changes |
| CLIENT_REVIEW | Client reviewing | Orange | (Portal actions) |
| REVISIONS | Changes requested | Red | Resume Work |
| COMPLETED | Finished | Green | Archive |
| CANCELLED | Cancelled | Gray | - |

### Status Transitions

```typescript
const VALID_TRANSITIONS: Record<BriefStatus, BriefStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'SUBMITTED'],
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['INTERNAL_REVIEW', 'CANCELLED'],
  INTERNAL_REVIEW: ['CLIENT_REVIEW', 'IN_PROGRESS'],
  CLIENT_REVIEW: ['COMPLETED', 'REVISIONS'],
  REVISIONS: ['IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
};
```

---

## 4. AI Quality Scoring

### How It Works

1. Form fields evaluated against quality rules
2. Each rule has weight (total = 100%)
3. Score calculated and displayed in real-time
4. AI suggestions shown for low-scoring fields

### Score Display

```
┌─────────────────────────────────────┐
│  Brief Quality Score                │
│  ████████████████░░░░░░  78/100    │
│                                     │
│  Improve these fields:              │
│  • Location needs more detail       │
│  • Consider adding reference files  │
└─────────────────────────────────────┘
```

### Score Thresholds

| Score | Status | Submission |
|-------|--------|------------|
| 90-100 | Excellent | ✅ Ready |
| 70-89 | Good | ✅ With suggestions |
| 50-69 | Fair | ⚠️ Review first |
| 0-49 | Poor | ❌ Must improve |

### Quality Rule Definition

```typescript
interface QualityRule {
  field: string;
  weight: number;           // % of total
  check: QualityCheck;
  value?: number;           // For minLength, minItems
  message?: string;         // Suggestion if fails
}

type QualityCheck = 
  | 'notEmpty'
  | 'minLength'
  | 'minItems'
  | 'hasFiles';
```

---

## 5. Slack Integration

### Slash Commands

| Command | Opens | Access |
|---------|-------|--------|
| `/brief-shoot` | Video Shoot form | All |
| `/brief-edit` | Video Edit form | All |
| `/brief-design` | Design form | All |
| `/brief-copy` | Copywriting EN form | All |
| `/brief-copy-ar` | Copywriting AR form | All |
| `/brief-media` | Paid Media form | All |
| `/rfp` | RFP form | Leadership |

### Notifications

**On Brief Submission:**
```
📋 New Brief Submitted

Shoot: CCAD – Talking Heads
Client: CCAD
Type: Video Shoot
Deadline: Dec 24, 2024
Quality Score: 85/100

Submitted by: Haidy Guirguis
Assigned to: @John.Doe

View Brief →
```

**On Status Change:**
```
🔄 Brief Status Updated

Shoot: CCAD – Talking Heads
Status: In Progress → Internal Review

Updated by: John Doe
```

**Daily Digest (Team Lead):**
```
📊 Daily Brief Summary

Pending Assignment: 3
In Progress: 8
Due Today: 2
Overdue: 1 ⚠️

View Dashboard →
```

### Notification Channels

| Event | Channel | DM |
|-------|---------|-----|
| Brief submitted | #briefs | Assigned user |
| Status change | - | Assignee + Creator |
| Deadline 48h | - | Assignee |
| Overdue | #briefs | Assignee + Team Lead |
| Daily digest | - | Team Leads |

---

## 6. Form Field Components

### User Select

```typescript
interface UserSelectProps {
  filter?: {
    departments?: string[];
    roles?: string[];
    skills?: string[];
    excludeIds?: string[];
  };
  placeholder?: string;
  showAvailability?: boolean;
}
```

### Client Select

```typescript
interface ClientSelectProps {
  showInactive?: boolean;
  showRetainerInfo?: boolean;
  placeholder?: string;
}
```

### Date Range

```typescript
interface DateRangeProps {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  helpText?: string;
}
```

### File Upload

```typescript
interface FileUploadProps {
  multiple?: boolean;
  accept?: string[];        // MIME types
  maxSize?: number;         // Bytes
  maxFiles?: number;
  helpText?: string;
}
```

---

## 7. Naming Validation

```typescript
const NAMING_PATTERNS: Record<BriefType, RegExp> = {
  VIDEO_SHOOT: /^Shoot:\s*.+\s*–\s*.+$/,
  VIDEO_EDIT: /^Edit:\s*.+\s*–\s*.+$/,
  DESIGN: /^Design:\s*.+\s*–\s*.+$/,
  COPYWRITING_EN: /^Copy:\s*.+\s*–\s*.+$/,
  COPYWRITING_AR: /^Copy:\s*.+\s*–\s*.+$/,
  PAID_MEDIA: /^Paid Media:\s*.+\s*–\s*.+$/,
  RFP: /^RFP\s*–\s*.+$/,
};

function validateBriefTitle(type: BriefType, title: string): boolean {
  return NAMING_PATTERNS[type].test(title);
}

function generateTitleSuggestion(type: BriefType, client: string): string {
  const prefixes: Record<BriefType, string> = {
    VIDEO_SHOOT: 'Shoot',
    VIDEO_EDIT: 'Edit',
    DESIGN: 'Design',
    COPYWRITING_EN: 'Copy',
    COPYWRITING_AR: 'Copy',
    PAID_MEDIA: 'Paid Media',
    RFP: 'RFP',
  };
  return `${prefixes[type]}: ${client} – `;
}
```

---

*Next: 04_Resource_Planning.md*
