import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LMS and Survey data...");

  // Get organization and admin user
  const org = await prisma.organization.findFirst({
    where: { slug: "lmtd" },
  });

  if (!org) {
    console.error("Organization not found. Run main seed first.");
    process.exit(1);
  }

  const adminUser = await prisma.user.findFirst({
    where: {
      organizationId: org.id,
      permissionLevel: "ADMIN",
    },
  });

  if (!adminUser) {
    console.error("Admin user not found. Run main seed first.");
    process.exit(1);
  }

  // ============================================
  // SURVEY TEMPLATES
  // ============================================
  console.log("\nCreating survey templates...");

  // Client Satisfaction Survey Template
  const clientSatTemplate = await prisma.surveyTemplate.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "client-satisfaction",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: "Client Satisfaction Survey",
      slug: "client-satisfaction",
      description: "Measure client satisfaction after project completion",
      kind: "SURVEY",
      category: "CLIENT_SATISFACTION",
      isPublished: true,
      settings: {
        showProgressBar: true,
        allowBackNavigation: true,
        shuffleQuestions: false,
        oneQuestionPerPage: false,
        showThankYouPage: true,
        thankYouMessage: "Thank you for your feedback! We truly value your input.",
        showBranding: true,
      },
      createdById: adminUser.id,
    },
  });

  // Create version for client satisfaction template
  await prisma.surveyTemplateVersion.upsert({
    where: {
      templateId_version: {
        templateId: clientSatTemplate.id,
        version: 1,
      },
    },
    update: {},
    create: {
      templateId: clientSatTemplate.id,
      version: 1,
      schema: [
        {
          id: "q1",
          type: "RATING_SCALE",
          text: "How satisfied are you with the overall quality of our work?",
          required: true,
          settings: { min: 1, max: 5, labels: { 1: "Very Unsatisfied", 5: "Very Satisfied" } },
        },
        {
          id: "q2",
          type: "RATING_SCALE",
          text: "How would you rate our communication throughout the project?",
          required: true,
          settings: { min: 1, max: 5 },
        },
        {
          id: "q3",
          type: "SINGLE_CHOICE",
          text: "Did we deliver the project on time?",
          required: true,
          options: ["Yes, ahead of schedule", "Yes, on time", "Slightly delayed", "Significantly delayed"],
        },
        {
          id: "q4",
          type: "NPS",
          text: "How likely are you to recommend our services to a colleague?",
          required: true,
        },
        {
          id: "q5",
          type: "LONG_TEXT",
          text: "What could we improve for future projects?",
          required: false,
        },
      ],
      design: {
        theme: "modern",
        primaryColor: "#52EDC7",
        fontFamily: "Inter",
      },
      settings: {},
      createdById: adminUser.id,
    },
  });

  // Update template to point to current version
  const clientSatVersion = await prisma.surveyTemplateVersion.findFirst({
    where: { templateId: clientSatTemplate.id, version: 1 },
  });
  await prisma.surveyTemplate.update({
    where: { id: clientSatTemplate.id },
    data: { currentVersionId: clientSatVersion?.id },
  });

  console.log("  Created: Client Satisfaction Survey");

  // Employee Engagement Template
  const employeeEngageTemplate = await prisma.surveyTemplate.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "employee-engagement",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: "Employee Engagement Survey",
      slug: "employee-engagement",
      description: "Quarterly employee engagement and satisfaction check",
      kind: "SURVEY",
      category: "EMPLOYEE_ENGAGEMENT",
      isPublished: true,
      settings: {
        showProgressBar: true,
        allowBackNavigation: true,
        shuffleQuestions: false,
        oneQuestionPerPage: true,
        showThankYouPage: true,
        thankYouMessage: "Thank you for your honest feedback!",
        showBranding: false,
      },
      createdById: adminUser.id,
    },
  });

  await prisma.surveyTemplateVersion.upsert({
    where: {
      templateId_version: {
        templateId: employeeEngageTemplate.id,
        version: 1,
      },
    },
    update: {},
    create: {
      templateId: employeeEngageTemplate.id,
      version: 1,
      schema: [
        {
          id: "q1",
          type: "RATING_SCALE",
          text: "I feel valued at work.",
          required: true,
          settings: { min: 1, max: 5, labels: { 1: "Strongly Disagree", 5: "Strongly Agree" } },
        },
        {
          id: "q2",
          type: "RATING_SCALE",
          text: "I have the resources I need to do my job well.",
          required: true,
          settings: { min: 1, max: 5 },
        },
        {
          id: "q3",
          type: "RATING_SCALE",
          text: "I understand how my work contributes to company goals.",
          required: true,
          settings: { min: 1, max: 5 },
        },
        {
          id: "q4",
          type: "MULTIPLE_CHOICE",
          text: "Which areas would you like to see improved?",
          required: false,
          options: ["Communication", "Work-life balance", "Career development", "Team collaboration", "Tools & technology", "Leadership"],
        },
        {
          id: "q5",
          type: "LONG_TEXT",
          text: "Any additional feedback or suggestions?",
          required: false,
        },
      ],
      design: {
        theme: "minimal",
        primaryColor: "#1BA098",
        fontFamily: "Inter",
      },
      settings: {},
      createdById: adminUser.id,
    },
  });

  const employeeEngageVersion = await prisma.surveyTemplateVersion.findFirst({
    where: { templateId: employeeEngageTemplate.id, version: 1 },
  });
  await prisma.surveyTemplate.update({
    where: { id: employeeEngageTemplate.id },
    data: { currentVersionId: employeeEngageVersion?.id },
  });

  console.log("  Created: Employee Engagement Survey");

  // Quick Poll Template
  const quickPollTemplate = await prisma.surveyTemplate.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "team-meeting-poll",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: "Team Meeting Time Poll",
      slug: "team-meeting-poll",
      description: "Quick poll to find the best meeting time",
      kind: "POLL",
      category: "INTERNAL_PROCESS",
      isPublished: true,
      settings: {
        showProgressBar: false,
        allowBackNavigation: false,
        shuffleQuestions: false,
        oneQuestionPerPage: false,
        showThankYouPage: true,
        thankYouMessage: "Thanks for voting!",
        showBranding: false,
      },
      createdById: adminUser.id,
    },
  });

  await prisma.surveyTemplateVersion.upsert({
    where: {
      templateId_version: {
        templateId: quickPollTemplate.id,
        version: 1,
      },
    },
    update: {},
    create: {
      templateId: quickPollTemplate.id,
      version: 1,
      schema: [
        {
          id: "q1",
          type: "SINGLE_CHOICE",
          text: "What's your preferred time for the weekly team meeting?",
          required: true,
          options: ["Monday 9 AM", "Monday 2 PM", "Wednesday 10 AM", "Friday 3 PM"],
        },
      ],
      design: {
        theme: "modern",
        primaryColor: "#6366f1",
        fontFamily: "Inter",
      },
      settings: {},
      createdById: adminUser.id,
    },
  });

  const quickPollVersion = await prisma.surveyTemplateVersion.findFirst({
    where: { templateId: quickPollTemplate.id, version: 1 },
  });
  await prisma.surveyTemplate.update({
    where: { id: quickPollTemplate.id },
    data: { currentVersionId: quickPollVersion?.id },
  });

  console.log("  Created: Team Meeting Time Poll");

  // ============================================
  // LMS COURSES
  // ============================================
  console.log("\nCreating LMS courses...");

  // Clean up existing LMS modules and lessons (no compound unique constraint available)
  // Delete lessons first (child), then modules (parent)
  await prisma.lMSLesson.deleteMany({
    where: {
      module: {
        course: {
          organizationId: org.id,
        },
      },
    },
  });
  await prisma.lMSModule.deleteMany({
    where: {
      course: {
        organizationId: org.id,
      },
    },
  });

  // Course 1: Brand Guidelines Training
  const brandCourse = await prisma.lMSCourse.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "brand-guidelines",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      title: "LMTD Brand Guidelines",
      slug: "brand-guidelines",
      description: "Learn the TeamLMTD brand guidelines, including logo usage, color palette, typography, and tone of voice. Essential training for all team members.",
      shortDescription: "Master our brand standards",
      category: "Onboarding",
      tags: ["brand", "design", "guidelines"],
      skillLevel: "Beginner",
      status: "PUBLISHED",
      visibility: "PRIVATE",
      estimatedDuration: 30,
      hasCertificate: true,
      passingScore: 80,
      requiredCompletionPercent: 100,
      allowSkipLessons: false,
      publishedAt: new Date(),
      publishedById: adminUser.id,
      createdById: adminUser.id,
    },
  });

  // Create modules for brand course
  const brandModule1 = await prisma.lMSModule.create({
    data: {
      courseId: brandCourse.id,
      title: "Introduction to Our Brand",
      description: "Understanding what makes LMTD unique",
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: brandModule1.id,
      title: "Welcome to LMTD",
      description: "An introduction to our agency and values",
      type: "VIDEO",
      content: {
        type: "VIDEO",
        url: "https://example.com/videos/welcome",
        provider: "internal",
      },
      duration: 5,
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: brandModule1.id,
      title: "Our Mission & Values",
      description: "What drives us every day",
      type: "ARTICLE",
      content: {
        type: "ARTICLE",
        body: "<h2>Our Mission</h2><p>To create impactful digital experiences that connect brands with their audiences...</p>",
      },
      duration: 10,
      sortOrder: 2,
      isRequired: true,
    },
  });

  const brandModule2 = await prisma.lMSModule.create({
    data: {
      courseId: brandCourse.id,
      title: "Visual Identity",
      description: "Logo, colors, and typography",
      sortOrder: 2,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: brandModule2.id,
      title: "Logo Usage Guidelines",
      description: "Proper use of the LMTD logo",
      type: "DOCUMENT",
      content: {
        type: "DOCUMENT",
        url: "https://example.com/docs/logo-guidelines.pdf",
        fileType: "pdf",
      },
      duration: 8,
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: brandModule2.id,
      title: "Color Palette & Typography",
      description: "Our color system and font choices",
      type: "ARTICLE",
      content: {
        type: "ARTICLE",
        body: "<h2>Primary Colors</h2><p>Turquoise: #52EDC7</p><p>Turquoise Dark: #1BA098</p>",
      },
      duration: 7,
      sortOrder: 2,
      isRequired: true,
    },
  });

  console.log("  Created: LMTD Brand Guidelines");

  // Course 2: Social Media Best Practices
  const socialCourse = await prisma.lMSCourse.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "social-media-best-practices",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      title: "Social Media Best Practices",
      slug: "social-media-best-practices",
      description: "Learn how to create engaging social media content that drives results. Covers platform-specific strategies, content creation, and analytics.",
      shortDescription: "Master social media marketing",
      category: "Marketing",
      tags: ["social media", "marketing", "content"],
      skillLevel: "Intermediate",
      status: "PUBLISHED",
      visibility: "PRIVATE",
      estimatedDuration: 60,
      hasCertificate: true,
      passingScore: 75,
      requiredCompletionPercent: 100,
      allowSkipLessons: true,
      publishedAt: new Date(),
      publishedById: adminUser.id,
      createdById: adminUser.id,
    },
  });

  const socialModule1 = await prisma.lMSModule.create({
    data: {
      courseId: socialCourse.id,
      title: "Platform Fundamentals",
      description: "Understanding each social platform",
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: socialModule1.id,
      title: "Instagram Strategy",
      description: "Mastering visual storytelling on Instagram",
      type: "VIDEO",
      content: {
        type: "VIDEO",
        url: "https://example.com/videos/instagram",
        provider: "internal",
      },
      duration: 15,
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: socialModule1.id,
      title: "LinkedIn for B2B",
      description: "Leveraging LinkedIn for professional content",
      type: "VIDEO",
      content: {
        type: "VIDEO",
        url: "https://example.com/videos/linkedin",
        provider: "internal",
      },
      duration: 12,
      sortOrder: 2,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: socialModule1.id,
      title: "TikTok & Short-Form Video",
      description: "Creating viral short-form content",
      type: "VIDEO",
      content: {
        type: "VIDEO",
        url: "https://example.com/videos/tiktok",
        provider: "internal",
      },
      duration: 18,
      sortOrder: 3,
      isRequired: true,
    },
  });

  const socialModule2 = await prisma.lMSModule.create({
    data: {
      courseId: socialCourse.id,
      title: "Content Creation",
      description: "Creating engaging content",
      sortOrder: 2,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: socialModule2.id,
      title: "Writing Engaging Captions",
      description: "The art of social media copywriting",
      type: "ARTICLE",
      content: {
        type: "ARTICLE",
        body: "<h2>Caption Best Practices</h2><p>Start with a hook, tell a story, end with a CTA...</p>",
      },
      duration: 10,
      sortOrder: 1,
      isRequired: true,
    },
  });

  console.log("  Created: Social Media Best Practices");

  // Course 3: Client Communication (Draft)
  const clientCommCourse = await prisma.lMSCourse.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "client-communication",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      title: "Effective Client Communication",
      slug: "client-communication",
      description: "Master the art of client communication. Learn how to manage expectations, handle difficult conversations, and build lasting relationships.",
      shortDescription: "Build better client relationships",
      category: "Soft Skills",
      tags: ["communication", "client relations", "soft skills"],
      skillLevel: "Beginner",
      status: "DRAFT",
      visibility: "PRIVATE",
      estimatedDuration: 45,
      hasCertificate: true,
      passingScore: 70,
      requiredCompletionPercent: 100,
      allowSkipLessons: false,
      createdById: adminUser.id,
    },
  });

  const clientCommModule1 = await prisma.lMSModule.create({
    data: {
      courseId: clientCommCourse.id,
      title: "Communication Fundamentals",
      description: "Core principles of client communication",
      sortOrder: 1,
      isRequired: true,
    },
  });

  await prisma.lMSLesson.create({
    data: {
      moduleId: clientCommModule1.id,
      title: "Setting Expectations",
      description: "How to set and manage client expectations",
      type: "VIDEO",
      content: {
        type: "VIDEO",
        url: "https://example.com/videos/expectations",
        provider: "internal",
      },
      duration: 12,
      sortOrder: 1,
      isRequired: true,
    },
  });

  console.log("  Created: Effective Client Communication (Draft)");

  // ============================================
  // CREATE SAMPLE SURVEYS (instances of templates)
  // ============================================
  console.log("\nCreating sample survey instances...");

  const clientSatSurvey = await prisma.survey.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "q4-2024-client-feedback",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      templateId: clientSatTemplate.id,
      title: "Q4 2024 Client Feedback",
      slug: "q4-2024-client-feedback",
      status: "ACTIVE",
      channels: ["WEB_LINK", "EMAIL"],
      startsAt: new Date("2024-10-01"),
      endsAt: new Date("2024-12-31"),
      createdById: adminUser.id,
    },
  });

  console.log("  Created: Q4 2024 Client Feedback survey");

  // ============================================
  // UPDATE COUNTS
  // ============================================

  // Update course lesson counts
  const courses = await prisma.lMSCourse.findMany({
    where: { organizationId: org.id },
    include: {
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  for (const course of courses) {
    const lessonCount = course.modules.reduce((sum, m) => sum + m._count.lessons, 0);
    // Course doesn't have a lessonCount field, but enrollments do
  }

  console.log("\n✅ LMS and Survey seeding complete!");
  console.log(`   - ${3} survey templates`);
  console.log(`   - ${1} active survey`);
  console.log(`   - ${3} courses (2 published, 1 draft)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
