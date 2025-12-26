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

  // ===========================================
  // ACCESS CONTROL POLICIES
  // ===========================================
  // These define what each permission level can do by default.
  // Leadership can create draft policies, Admins approve them.
  // Individual users can have policies assigned to override defaults.

  // Get an admin user to be the creator
  const adminUser = await prisma.user.findFirst({
    where: { organizationId: org.id, email: "will@teamlmtd.com" },
  });

  if (adminUser) {
    console.log("Creating default access policies...");

    // ADMIN FULL ACCESS
    // ─────────────────────────────────────────
    // Full unrestricted access to all resources and actions.
    // Can create, edit, delete anything. Can manage users and policies.
    // Can approve/reject policy submissions from Leadership.
    const adminPolicy = await prisma.accessPolicy.upsert({
      where: { organizationId_name: { organizationId: org.id, name: "Admin Full Access" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Admin Full Access",
        description: `
Full administrative access to all platform features.

USERS:
• View all users across organization
• Create new user accounts
• Edit user profiles, roles, permissions
• Deactivate/reactivate accounts
• Assign policies to users

CLIENTS:
• View all clients and their details
• Create new clients
• Edit client information, retainer settings
• Assign account managers
• Archive clients

PROJECTS:
• View all projects
• Create and edit projects
• Delete/archive projects
• Manage budgets and timelines

BRIEFS:
• Full access to all briefs
• Create, edit, assign, delete briefs
• Override any brief status

ACCESS POLICIES:
• Create policies directly (auto-approved)
• Approve/reject policy submissions
• Edit any policy
• Archive/restore policies
• Assign policies to users

AUDIT LOGS:
• View all audit logs
• Export audit data
        `.trim(),
        defaultLevel: PermissionLevel.ADMIN,
        status: "APPROVED",
        isActive: true,
        priority: 100,
        version: 1,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: adminUser.id,
      },
    });

    // Create rules for admin
    const adminRules = [
      // Users - full access
      { resource: "users", action: "LIST" },
      { resource: "users", action: "VIEW" },
      { resource: "users", action: "CREATE" },
      { resource: "users", action: "UPDATE" },
      { resource: "users", action: "DELETE" },
      { resource: "users", action: "EXPORT" },
      // Clients - full access
      { resource: "clients", action: "LIST" },
      { resource: "clients", action: "VIEW" },
      { resource: "clients", action: "CREATE" },
      { resource: "clients", action: "UPDATE" },
      { resource: "clients", action: "DELETE" },
      { resource: "clients", action: "EXPORT" },
      // Projects - full access
      { resource: "projects", action: "LIST" },
      { resource: "projects", action: "VIEW" },
      { resource: "projects", action: "CREATE" },
      { resource: "projects", action: "UPDATE" },
      { resource: "projects", action: "DELETE" },
      // Briefs - full access
      { resource: "briefs", action: "LIST" },
      { resource: "briefs", action: "VIEW" },
      { resource: "briefs", action: "CREATE" },
      { resource: "briefs", action: "UPDATE" },
      { resource: "briefs", action: "DELETE" },
      { resource: "briefs", action: "ASSIGN" },
      // Time entries - full access
      { resource: "time_entries", action: "LIST" },
      { resource: "time_entries", action: "VIEW" },
      { resource: "time_entries", action: "CREATE" },
      { resource: "time_entries", action: "UPDATE" },
      { resource: "time_entries", action: "DELETE" },
      // Access policies - full access
      { resource: "access_policies", action: "LIST" },
      { resource: "access_policies", action: "VIEW" },
      { resource: "access_policies", action: "CREATE" },
      { resource: "access_policies", action: "UPDATE" },
      { resource: "access_policies", action: "DELETE" },
      // Audit logs - view and export
      { resource: "audit_logs", action: "LIST" },
      { resource: "audit_logs", action: "VIEW" },
      { resource: "audit_logs", action: "EXPORT" },
    ];

    for (const rule of adminRules) {
      await prisma.accessRule.upsert({
        where: {
          policyId_resource_action: {
            policyId: adminPolicy.id,
            resource: rule.resource,
            action: rule.action as any,
          },
        },
        update: {},
        create: {
          policyId: adminPolicy.id,
          resource: rule.resource,
          action: rule.action as any,
          effect: "ALLOW",
          conditionType: "ALL",
        },
      });
    }

    // LEADERSHIP ACCESS
    // ─────────────────────────────────────────
    // Senior management with broad view access.
    // Can create clients/projects but limited user management.
    // Can draft policies for admin approval.
    const leadershipPolicy = await prisma.accessPolicy.upsert({
      where: { organizationId_name: { organizationId: org.id, name: "Leadership Access" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Leadership Access",
        description: `
Senior leadership with broad organizational visibility.

USERS:
• View all users (no sensitive fields like salary)
• Cannot create or delete users

CLIENTS:
• View all clients with full details
• Create new clients
• Edit client information
• Cannot archive clients

PROJECTS:
• View all projects
• Create and edit projects
• Cannot delete projects

BRIEFS:
• View all briefs across teams
• Create and edit briefs
• Assign briefs to team members
• Cannot delete briefs

ACCESS POLICIES:
• View all policies
• Create draft policies (requires admin approval)
• Cannot approve or delete policies

AUDIT LOGS:
• View audit logs
        `.trim(),
        defaultLevel: PermissionLevel.LEADERSHIP,
        status: "APPROVED",
        isActive: true,
        priority: 90,
        version: 1,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: adminUser.id,
      },
    });

    const leadershipRules = [
      // Users - view only, hide sensitive fields
      { resource: "users", action: "LIST", conditionType: "ALL", deniedFields: ["hourlyRate", "bankAccountNumber", "bankIban", "emiratesId"] },
      { resource: "users", action: "VIEW", conditionType: "ALL", deniedFields: ["hourlyRate", "bankAccountNumber", "bankIban", "emiratesId"] },
      // Clients - full view, create, update
      { resource: "clients", action: "LIST" },
      { resource: "clients", action: "VIEW" },
      { resource: "clients", action: "CREATE" },
      { resource: "clients", action: "UPDATE" },
      // Projects - full view, create, update
      { resource: "projects", action: "LIST" },
      { resource: "projects", action: "VIEW" },
      { resource: "projects", action: "CREATE" },
      { resource: "projects", action: "UPDATE" },
      // Briefs - full access except delete
      { resource: "briefs", action: "LIST" },
      { resource: "briefs", action: "VIEW" },
      { resource: "briefs", action: "CREATE" },
      { resource: "briefs", action: "UPDATE" },
      { resource: "briefs", action: "ASSIGN" },
      // Time entries - view all, manage own
      { resource: "time_entries", action: "LIST" },
      { resource: "time_entries", action: "VIEW" },
      { resource: "time_entries", action: "CREATE", conditionType: "OWN" },
      { resource: "time_entries", action: "UPDATE", conditionType: "OWN" },
      // Access policies - view and create drafts
      { resource: "access_policies", action: "LIST" },
      { resource: "access_policies", action: "VIEW" },
      { resource: "access_policies", action: "CREATE" }, // Creates as draft
      // Audit logs - view only
      { resource: "audit_logs", action: "LIST" },
      { resource: "audit_logs", action: "VIEW" },
    ];

    for (const rule of leadershipRules) {
      await prisma.accessRule.upsert({
        where: {
          policyId_resource_action: {
            policyId: leadershipPolicy.id,
            resource: rule.resource,
            action: rule.action as any,
          },
        },
        update: {},
        create: {
          policyId: leadershipPolicy.id,
          resource: rule.resource,
          action: rule.action as any,
          effect: "ALLOW",
          conditionType: (rule as any).conditionType || "ALL",
          deniedFields: (rule as any).deniedFields || [],
        },
      });
    }

    // TEAM LEAD ACCESS
    // ─────────────────────────────────────────
    // Department heads with team management capabilities.
    // Can view own team, assign work, manage projects.
    const teamLeadPolicy = await prisma.accessPolicy.upsert({
      where: { organizationId_name: { organizationId: org.id, name: "Team Lead Access" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Team Lead Access",
        description: `
Department leads with team management capabilities.

USERS:
• View team members (direct reports)
• View own profile with full details
• Cannot view other teams' members

CLIENTS:
• View all clients (basic info)
• Cannot create or edit clients

PROJECTS:
• View all projects
• Create projects (for any client)
• Edit projects they're assigned to

BRIEFS:
• View all briefs
• Create briefs
• Assign briefs to team members
• Edit briefs for their team

TIME ENTRIES:
• View team's time entries
• Edit own time entries
• Approve team time entries

ACCESS POLICIES:
• View policies (cannot create/edit)
        `.trim(),
        defaultLevel: PermissionLevel.TEAM_LEAD,
        status: "APPROVED",
        isActive: true,
        priority: 80,
        version: 1,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: adminUser.id,
      },
    });

    const teamLeadRules = [
      // Users - view team only
      { resource: "users", action: "LIST", conditionType: "TEAM" },
      { resource: "users", action: "VIEW", conditionType: "TEAM" },
      // Clients - view all
      { resource: "clients", action: "LIST" },
      { resource: "clients", action: "VIEW" },
      // Projects - view all, create, update own
      { resource: "projects", action: "LIST" },
      { resource: "projects", action: "VIEW" },
      { resource: "projects", action: "CREATE" },
      { resource: "projects", action: "UPDATE" },
      // Briefs - view all, full access for team
      { resource: "briefs", action: "LIST" },
      { resource: "briefs", action: "VIEW" },
      { resource: "briefs", action: "CREATE" },
      { resource: "briefs", action: "UPDATE" },
      { resource: "briefs", action: "ASSIGN", conditionType: "TEAM" },
      // Time entries - view team, manage own
      { resource: "time_entries", action: "LIST", conditionType: "TEAM" },
      { resource: "time_entries", action: "VIEW", conditionType: "TEAM" },
      { resource: "time_entries", action: "CREATE", conditionType: "OWN" },
      { resource: "time_entries", action: "UPDATE", conditionType: "OWN" },
      // Access policies - view only
      { resource: "access_policies", action: "LIST" },
      { resource: "access_policies", action: "VIEW" },
    ];

    for (const rule of teamLeadRules) {
      await prisma.accessRule.upsert({
        where: {
          policyId_resource_action: {
            policyId: teamLeadPolicy.id,
            resource: rule.resource,
            action: rule.action as any,
          },
        },
        update: {},
        create: {
          policyId: teamLeadPolicy.id,
          resource: rule.resource,
          action: rule.action as any,
          effect: "ALLOW",
          conditionType: (rule as any).conditionType || "ALL",
        },
      });
    }

    // STAFF ACCESS
    // ─────────────────────────────────────────
    // Regular employees with standard access.
    // Can view work, manage own assignments.
    const staffPolicy = await prisma.accessPolicy.upsert({
      where: { organizationId_name: { organizationId: org.id, name: "Staff Access" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Staff Access",
        description: `
Standard employee access for day-to-day work.

USERS:
• View team directory (basic info only)
• Edit own profile

CLIENTS:
• View client list (names only)
• View client details when assigned to their briefs

PROJECTS:
• View projects they're working on

BRIEFS:
• View all briefs (to understand workload)
• Edit briefs assigned to them
• Cannot create or assign briefs

TIME ENTRIES:
• View own time entries only
• Create and edit own time entries
        `.trim(),
        defaultLevel: PermissionLevel.STAFF,
        status: "APPROVED",
        isActive: true,
        priority: 70,
        version: 1,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: adminUser.id,
      },
    });

    const staffRules = [
      // Users - limited view
      { resource: "users", action: "LIST", conditionType: "ALL", allowedFields: ["id", "name", "email", "role", "department", "avatarUrl"] },
      { resource: "users", action: "VIEW", conditionType: "OWN" },
      { resource: "users", action: "UPDATE", conditionType: "OWN", allowedFields: ["name", "phone", "avatarUrl", "skills"] },
      // Clients - view all
      { resource: "clients", action: "LIST" },
      { resource: "clients", action: "VIEW" },
      // Projects - view all
      { resource: "projects", action: "LIST" },
      { resource: "projects", action: "VIEW" },
      // Briefs - view all, edit assigned
      { resource: "briefs", action: "LIST" },
      { resource: "briefs", action: "VIEW" },
      { resource: "briefs", action: "UPDATE", conditionType: "ASSIGNED" },
      // Time entries - own only
      { resource: "time_entries", action: "LIST", conditionType: "OWN" },
      { resource: "time_entries", action: "VIEW", conditionType: "OWN" },
      { resource: "time_entries", action: "CREATE", conditionType: "OWN" },
      { resource: "time_entries", action: "UPDATE", conditionType: "OWN" },
    ];

    for (const rule of staffRules) {
      await prisma.accessRule.upsert({
        where: {
          policyId_resource_action: {
            policyId: staffPolicy.id,
            resource: rule.resource,
            action: rule.action as any,
          },
        },
        update: {},
        create: {
          policyId: staffPolicy.id,
          resource: rule.resource,
          action: rule.action as any,
          effect: "ALLOW",
          conditionType: (rule as any).conditionType || "ALL",
          allowedFields: (rule as any).allowedFields || [],
        },
      });
    }

    // FREELANCER ACCESS
    // ─────────────────────────────────────────
    // Contractors with restricted access.
    // Only see work assigned to them.
    const freelancerPolicy = await prisma.accessPolicy.upsert({
      where: { organizationId_name: { organizationId: org.id, name: "Freelancer Access" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Freelancer Access",
        description: `
External contractors with restricted access.

USERS:
• View own profile only

CLIENTS:
• View clients only when assigned to their briefs
• Cannot see retainer details, notes, or contracts

PROJECTS:
• View projects only when assigned to related briefs

BRIEFS:
• View only briefs assigned to them
• Update status on assigned briefs

TIME ENTRIES:
• View and manage own time entries only
        `.trim(),
        defaultLevel: PermissionLevel.FREELANCER,
        status: "APPROVED",
        isActive: true,
        priority: 60,
        version: 1,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: adminUser.id,
      },
    });

    const freelancerRules = [
      // Users - own only
      { resource: "users", action: "VIEW", conditionType: "OWN" },
      { resource: "users", action: "UPDATE", conditionType: "OWN", allowedFields: ["phone", "avatarUrl", "skills"] },
      // Clients - assigned only, hide sensitive
      { resource: "clients", action: "LIST", conditionType: "CLIENT" },
      { resource: "clients", action: "VIEW", conditionType: "CLIENT", deniedFields: ["retainerHours", "notes", "linkedIn", "accountManagerId"] },
      // Projects - assigned only
      { resource: "projects", action: "LIST", conditionType: "ASSIGNED" },
      { resource: "projects", action: "VIEW", conditionType: "ASSIGNED", deniedFields: ["budgetHours", "budgetAmount"] },
      // Briefs - assigned only
      { resource: "briefs", action: "LIST", conditionType: "ASSIGNED" },
      { resource: "briefs", action: "VIEW", conditionType: "ASSIGNED" },
      { resource: "briefs", action: "UPDATE", conditionType: "ASSIGNED" },
      // Time entries - own only
      { resource: "time_entries", action: "LIST", conditionType: "OWN" },
      { resource: "time_entries", action: "VIEW", conditionType: "OWN" },
      { resource: "time_entries", action: "CREATE", conditionType: "OWN" },
      { resource: "time_entries", action: "UPDATE", conditionType: "OWN" },
    ];

    for (const rule of freelancerRules) {
      await prisma.accessRule.upsert({
        where: {
          policyId_resource_action: {
            policyId: freelancerPolicy.id,
            resource: rule.resource,
            action: rule.action as any,
          },
        },
        update: {},
        create: {
          policyId: freelancerPolicy.id,
          resource: rule.resource,
          action: rule.action as any,
          effect: "ALLOW",
          conditionType: (rule as any).conditionType || "ALL",
          allowedFields: (rule as any).allowedFields || [],
          deniedFields: (rule as any).deniedFields || [],
        },
      });
    }

    console.log("Created 5 default access policies with rules");
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
