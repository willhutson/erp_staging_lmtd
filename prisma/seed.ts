import { PrismaClient, PermissionLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Test account password (same for all test accounts)
const TEST_PASSWORD = "testpass123";

async function main() {
  console.log("Seeding database...");

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: "lmtd" },
    update: {},
    create: {
      name: "TeamLMTD",
      slug: "lmtd",
      domain: "teamlmtd.com",
      configKey: "lmtd",
      settings: {
        timezone: "Asia/Dubai",
        currency: "AED",
        dateFormat: "DD MMM YYYY",
      },
    },
  });

  console.log(`Created organization: ${org.name}`);

  // Create Clients
  const clients = [
    { name: "Creative City Abu Dhabi", code: "CCAD", industry: "Government", isRetainer: true, retainerHours: 160 },
    { name: "Department of Economy and Tourism", code: "DET", industry: "Government", isRetainer: true, retainerHours: 120 },
    { name: "Abu Dhabi Department of Education and Knowledge", code: "ADEK", industry: "Government", isRetainer: true, retainerHours: 80 },
    { name: "Emirates Culinary District", code: "ECD", industry: "Hospitality", isRetainer: false },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { organizationId_code: { organizationId: org.id, code: client.code } },
      update: {},
      create: {
        organizationId: org.id,
        ...client,
      },
    });
  }

  console.log(`Created ${clients.length} clients`);

  // Define all 46 users
  const users = [
    // Management (2)
    { name: "William Whitaker Hutson", email: "will@teamlmtd.com", role: "CEO", department: "Management", permissionLevel: PermissionLevel.ADMIN },
    { name: "Afaq Tariq", email: "afaq@teamlmtd.com", role: "CFO", department: "Management", permissionLevel: PermissionLevel.ADMIN },

    // Creative & Design (5)
    { name: "Klaudia Maria Pszczolinska", email: "klaudia@teamlmtd.com", role: "Design Director", department: "Creative & Design", permissionLevel: PermissionLevel.TEAM_LEAD },
    { name: "Theodore Totsidis", email: "ted@teamlmtd.com", role: "Executive Creative Director", department: "Creative & Design", permissionLevel: PermissionLevel.LEADERSHIP },
    { name: "Mohamed Nejib Ben Ayed", email: "nejib@teamlmtd.com", role: "Graphic Designer", department: "Creative & Design", permissionLevel: PermissionLevel.STAFF },
    { name: "John Vincent Gomez", email: "john@teamlmtd.com", role: "Graphic Designer", department: "Creative & Design", permissionLevel: PermissionLevel.STAFF },
    { name: "Anas Eramullan", email: "anasramzan@gmail.com", role: "Graphic Designer", department: "Creative & Design", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, contractEnd: new Date("2025-01-31") },

    // Video Production (9)
    { name: "Rozanne Jamaica Vasallo", email: "rozanne@teamlmtd.com", role: "Producer", department: "Video Production", permissionLevel: PermissionLevel.TEAM_LEAD },
    { name: "Haani Farooq", email: "haani@teamlmtd.com", role: "Content Specialist", department: "Video Production", permissionLevel: PermissionLevel.STAFF },
    { name: "Mikaela Delovieres", email: "mikaela@teamlmtd.com", role: "Trend Analyst", department: "Video Production", permissionLevel: PermissionLevel.STAFF },
    { name: "Harsh Ghanshyambhai Prajapati", email: "harsh@teamlmtd.com", role: "Video Content Specialist", department: "Video Production", permissionLevel: PermissionLevel.STAFF },
    { name: "Jasim Kunhamed Kuttuan", email: "jasim@teamlmtd.com", role: "Video Content Specialist", department: "Video Production", permissionLevel: PermissionLevel.STAFF, skills: ["video", "design"] },
    { name: "Marvin Cuenca Vasquez", email: "marvin@teamlmtd.com", role: "Video Content Specialist", department: "Video Production", permissionLevel: PermissionLevel.STAFF, skills: ["video", "design"] },
    { name: "Hteth Aung Win", email: "htet@teamlmtd.com", role: "Video Content Creator", department: "Video Production", permissionLevel: PermissionLevel.STAFF },
    { name: "Yadu Krishnan", email: "yadu@teamlmtd.com", role: "Video Content Creator", department: "Video Production", permissionLevel: PermissionLevel.STAFF },
    { name: "Veysel Enis", email: "veysel@teamlmtd.com", role: "Video Content Creator", department: "Video Production", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, contractEnd: new Date("2025-12-17"), notes: "May become full-time" },

    // Client Servicing (16)
    { name: "Cornel Jerome Holland", email: "cj@teamlmtd.com", role: "Client Servicing Director", department: "Client Servicing", permissionLevel: PermissionLevel.LEADERSHIP },
    { name: "Salma Ehab Ahmed", email: "salma@teamlmtd.com", role: "Strategy Director", department: "Client Servicing", permissionLevel: PermissionLevel.LEADERSHIP },
    { name: "Haidy Hany Guirguis", email: "haidy@teamlmtd.com", role: "Account Director", department: "Client Servicing", permissionLevel: PermissionLevel.TEAM_LEAD },
    { name: "Sarwath Abdul Wahid", email: "sarwath@teamlmtd.com", role: "Associate Account Director", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Clauda El Achkar", email: "clauda@teamlmtd.com", role: "Senior ARM", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Don Chenuka Wirasinha", email: "don@teamlmtd.com", role: "ARM", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Susan George", email: "susan@teamlmtd.com", role: "ARM", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Linda Khalid El-Borno", email: "linda@teamlmtd.com", role: "Account Executive", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Nisrine Moubarik", email: "nisrine@teamlmtd.com", role: "Account Executive", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Lakshmy Bharati", email: "lakshmy@teamlmtd.com", role: "ARM", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF },
    { name: "Matthew David Cole", email: "matthew@teamlmtd.com", role: "Project Manager", department: "Client Servicing", permissionLevel: PermissionLevel.LEADERSHIP },
    { name: "Rida Kashif", email: "rida@teamlmtd.com", role: "Social Media Executive", department: "Client Servicing", permissionLevel: PermissionLevel.STAFF, skills: ["social-media", "video"] },
    { name: "Joei Legaspi", email: "jralegaspi25@gmail.com", role: "Trend Analyst", department: "Client Servicing", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, contractEnd: new Date("2026-02-28") },
    { name: "Ali Amin", email: "aliaminshivjee@gmail.com", role: "Trend Analyst", department: "Client Servicing", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, contractEnd: new Date("2026-01-31") },
    { name: "Senani Dilukshika", email: "senani.dilukshika@gmail.com", role: "Social Media Account Exec", department: "Client Servicing", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, notes: "May become full-time" },
    { name: "Clive Hernandez", email: "clive.ferns1@gmail.com", role: "Account Manager", department: "Client Servicing", permissionLevel: PermissionLevel.FREELANCER, isFreelancer: true, contractEnd: new Date("2026-01-15") },

    // HR & Operations (5)
    { name: "Albert Khoury", email: "albert@teamlmtd.com", role: "Workflow Optimization Lead", department: "HR & Operations", permissionLevel: PermissionLevel.ADMIN },
    { name: "Sheryl Lunas Sto. Tomas", email: "sheryl@teamlmtd.com", role: "HR Executive", department: "HR & Operations", permissionLevel: PermissionLevel.STAFF },
    { name: "Salman Ali Bahadar", email: "salman@teamlmtd.com", role: "Driver", department: "HR & Operations", permissionLevel: PermissionLevel.STAFF },
    { name: "Joeniffer Ruiz A. Legaspi", email: "joe@teamlmtd.com", role: "Accountant", department: "HR & Operations", permissionLevel: PermissionLevel.STAFF },
    { name: "Dima Albouza", email: "dima@teamlmtd.com", role: "Finance Executive", department: "HR & Operations", permissionLevel: PermissionLevel.STAFF },

    // OCM - Online Community Management (3)
    { name: "Ghassan Abdelbasit Ahmed", email: "ghassan@teamlmtd.com", role: "Online Community Manager", department: "OCM", permissionLevel: PermissionLevel.TEAM_LEAD },
    { name: "Maryam Naji Al-Basha Zaiba", email: "maryam@teamlmtd.com", role: "Online Community Manager", department: "OCM", permissionLevel: PermissionLevel.STAFF },
    { name: "Haytham Abdelfattah Kamil", email: "hkamil@teamlmtd.com", role: "Online Community Manager", department: "OCM", permissionLevel: PermissionLevel.STAFF },

    // Paid Media (2)
    { name: "Omer Gunal", email: "omer@teamlmtd.com", role: "Analyst", department: "Paid Media", permissionLevel: PermissionLevel.TEAM_LEAD },
    { name: "Nourhan Mohamed Radwan", email: "nour@teamlmtd.com", role: "Paid Media Specialist", department: "Paid Media", permissionLevel: PermissionLevel.STAFF },

    // Copywriting (4)
    { name: "Emaan Omer", email: "emaan@teamlmtd.com", role: "English Copywriter", department: "Copywriting", permissionLevel: PermissionLevel.TEAM_LEAD, skills: ["copywriting-en"] },
    { name: "Tony Samaan", email: "tony@teamlmtd.com", role: "Arabic Copywriter", department: "Copywriting", permissionLevel: PermissionLevel.TEAM_LEAD, skills: ["copywriting-ar"] },
    { name: "Marcelle Alzaher", email: "marcelle@teamlmtd.com", role: "Junior Arabic Copywriter", department: "Copywriting", permissionLevel: PermissionLevel.STAFF, skills: ["copywriting-ar"] },
    { name: "Razan Samir Abdallah", email: "razan@teamlmtd.com", role: "Content Specialist", department: "Copywriting", permissionLevel: PermissionLevel.STAFF, skills: ["copywriting-en"] },
  ];

  // Create users
  for (const user of users) {
    await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: user.email } },
      update: {},
      create: {
        organizationId: org.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        permissionLevel: user.permissionLevel,
        isFreelancer: user.isFreelancer ?? false,
        contractEnd: user.contractEnd,
        notes: user.notes,
        skills: user.skills ?? [],
        weeklyCapacity: user.isFreelancer ? 40 : 40,
      },
    });
  }

  console.log(`Created ${users.length} users`);

  // Set team leads
  const teamLeadMappings = [
    { department: "Creative & Design", leadEmail: "klaudia@teamlmtd.com" },
    { department: "Video Production", leadEmail: "rozanne@teamlmtd.com" },
    { department: "Client Servicing", leadEmail: "haidy@teamlmtd.com" },
    { department: "OCM", leadEmail: "ghassan@teamlmtd.com" },
    { department: "Paid Media", leadEmail: "omer@teamlmtd.com" },
  ];

  for (const mapping of teamLeadMappings) {
    const lead = await prisma.user.findFirst({
      where: { organizationId: org.id, email: mapping.leadEmail },
    });

    if (lead) {
      await prisma.user.updateMany({
        where: {
          organizationId: org.id,
          department: mapping.department,
          permissionLevel: { in: [PermissionLevel.STAFF, PermissionLevel.FREELANCER] },
        },
        data: { teamLeadId: lead.id },
      });
    }
  }

  console.log("Set team lead relationships");

  // Create test accounts for each permission level
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const testAccounts = [
    {
      email: "admin@test.com",
      name: "Test Admin",
      role: "Test Admin",
      department: "Management",
      permissionLevel: PermissionLevel.ADMIN
    },
    {
      email: "lead@test.com",
      name: "Test Team Lead",
      role: "Test Lead",
      department: "Creative & Design",
      permissionLevel: PermissionLevel.TEAM_LEAD
    },
    {
      email: "staff@test.com",
      name: "Test Staff",
      role: "Test Designer",
      department: "Creative & Design",
      permissionLevel: PermissionLevel.STAFF
    },
    {
      email: "freelancer@test.com",
      name: "Test Freelancer",
      role: "Test Contractor",
      department: "Video Production",
      permissionLevel: PermissionLevel.FREELANCER,
      isFreelancer: true
    },
  ];

  for (const account of testAccounts) {
    await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: account.email } },
      update: { passwordHash: hashedPassword },
      create: {
        organizationId: org.id,
        email: account.email,
        name: account.name,
        role: account.role,
        department: account.department,
        permissionLevel: account.permissionLevel,
        isFreelancer: account.isFreelancer ?? false,
        passwordHash: hashedPassword,
      },
    });
  }

  console.log(`Created ${testAccounts.length} test accounts (password: ${TEST_PASSWORD})`);

  // Create Portal Users (for client portal testing)
  const ccadClient = await prisma.client.findFirst({
    where: { organizationId: org.id, code: "CCAD" },
  });

  if (ccadClient) {
    // Create a client contact first
    const contact = await prisma.clientContact.upsert({
      where: {
        id: "portal-test-contact"
      },
      update: {},
      create: {
        id: "portal-test-contact",
        clientId: ccadClient.id,
        name: "Sarah Mitchell",
        email: "portal@test.com",
        jobTitle: "Marketing Director",
        isPrimary: true,
        isDecisionMaker: true,
      },
    });

    // Create portal user
    await prisma.clientPortalUser.upsert({
      where: {
        organizationId_email: { organizationId: org.id, email: "portal@test.com" },
      },
      update: {},
      create: {
        organizationId: org.id,
        clientId: ccadClient.id,
        contactId: contact.id,
        email: "portal@test.com",
        name: "Sarah Mitchell",
        isActive: true,
      },
    });

    console.log("Created portal test user: portal@test.com (use magic link to login)");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
