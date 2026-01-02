# LMS (Learning Management System) Module

## Overview

Course creation, delivery, and tracking system for employee training and development.

## Key Concepts

### Course Structure

```
Course
├── Module 1 (Chapter)
│   ├── Lesson 1.1 (Video)
│   ├── Lesson 1.2 (Article)
│   └── Lesson 1.3 (Quiz)
├── Module 2
│   ├── Lesson 2.1 (Presentation)
│   └── Lesson 2.2 (Assignment)
└── Certificate (on completion)
```

### Lesson Types
- `VIDEO`: YouTube, Vimeo, or internal video
- `DOCUMENT`: PDF, Word, PowerPoint viewer
- `ARTICLE`: Rich text content
- `PRESENTATION`: Slide-by-slide view
- `QUIZ`: Knowledge assessment
- `ASSIGNMENT`: Submit work for review
- `SCORM`: SCORM package support
- `EXTERNAL_LINK`: External resource
- `LIVE_SESSION`: Scheduled live meeting

### Enrollment Status
- `ENROLLED`: Just signed up
- `IN_PROGRESS`: Started at least one lesson
- `COMPLETED`: Finished all required content
- `FAILED`: Failed assessment requirements
- `DROPPED`: Voluntarily left
- `EXPIRED`: Time limit exceeded

## Data Flow

```
LMSCourse (definition)
    │
    ├── LMSModule[] (chapters)
    │       └── LMSLesson[] (content)
    │               └── LMSAssessment? (quiz)
    │
    └── LMSEnrollment[] (learners)
            ├── LMSLessonProgress[] (per lesson)
            ├── LMSAssessmentAttempt[] (quiz attempts)
            └── LMSCertificate? (on completion)
```

## Files

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript types and interfaces |
| `actions.ts` | Server actions for CRUD |
| `components/` | UI components |

## Database Tables

- `lms_courses` - Course definitions
- `lms_modules` - Course sections/chapters
- `lms_lessons` - Individual content units
- `lms_assessments` - Quiz definitions
- `lms_questions` - Quiz questions
- `lms_enrollments` - User enrollments
- `lms_lesson_progress` - Per-lesson completion
- `lms_assessment_attempts` - Quiz submissions
- `lms_certificates` - Completion certificates

## Common Operations

### Create Course
```typescript
const course = await createCourse({
  title: "New Employee Onboarding",
  description: "Complete orientation for new hires",
  category: "Onboarding",
  visibility: "PRIVATE",
});
```

### Add Module
```typescript
const module = await createModule({
  courseId: course.id,
  title: "Week 1: Company Culture",
});
```

### Add Lesson
```typescript
const lesson = await createLesson({
  moduleId: module.id,
  title: "Welcome Video",
  type: "VIDEO",
  content: {
    type: "VIDEO",
    provider: "youtube",
    videoId: "abc123",
  },
  duration: 300, // 5 minutes
});
```

### Enroll Users
```typescript
await enrollUsers({
  courseId: course.id,
  userIds: ["user1", "user2", "user3"],
});
```

### Track Progress
```typescript
await updateLessonProgress({
  enrollmentId: enrollment.id,
  lessonId: lesson.id,
  isCompleted: true,
  timeSpent: 320, // seconds
});
```

## Permissions

| Action | Required Level |
|--------|---------------|
| View courses (public) | STAFF+ |
| Create course | LEADERSHIP+ |
| Publish course | LEADERSHIP+ |
| Enroll users | TEAM_LEAD+ |
| View own progress | STAFF+ |
| View all enrollments | TEAM_LEAD+ |
| View analytics | LEADERSHIP+ |

## Visibility Levels

- `PUBLIC`: Anyone in org can self-enroll
- `PRIVATE`: By invitation only
- `DEPARTMENT`: Auto-enroll specific departments
- `CLIENT`: For client portal users

## Completion Requirements

- `passingScore`: Minimum assessment score (%)
- `requiredCompletionPercent`: % of lessons required
- `timeLimit`: Days to complete (null = unlimited)
